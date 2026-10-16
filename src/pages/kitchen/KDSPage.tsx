import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Volume2,
  VolumeX,
  RotateCcw,
  Flag,
  Flame,
  Search,
  Maximize2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KitchenTicket } from '../../types';

interface KDSPageProps {
  onNavigate: (pageId: string) => void;
}

export const KDSPage: React.FC<KDSPageProps> = ({ onNavigate }) => {
  const {
    kitchenTickets,
    updateKitchenTicketStatus,
    flagKitchenDelay,
    orders
  } = useApp();

  const [selectedStation, setSelectedStation] = useState<string>('All');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [delayModalTicket, setDelayModalTicket] = useState<KitchenTicket | null>(null);
  const [delayReason, setDelayReason] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [kdsMobileTab, setKdsMobileTab] = useState<'all' | 'new' | 'preparing' | 'ready'>('all');

  // Update timer every 10 seconds for live elapsed calculation
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const stations = [
    'All',
    'Main Kitchen',
    'Tandoor & Grill',
    'Drinks & Bar',
    'Dessert & Bakery',
    'Pantry'
  ];

  // Filter tickets by station and exclude already finished/served older tickets
  const filteredTickets = kitchenTickets.filter(kt => {
    if (selectedStation !== 'All' && kt.station !== selectedStation) return false;
    return true;
  });

  const newTickets = filteredTickets.filter(k => k.status === 'New');
  const preparingTickets = filteredTickets.filter(k => k.status === 'Preparing');
  const readyTickets = filteredTickets.filter(k => k.status === 'Ready');

  // Elapsed minutes helper
  const getElapsedMinutes = (timeStr: string) => {
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const nowH = currentTime.getHours();
      const nowM = currentTime.getMinutes();
      return Math.max(0, (nowH * 60 + nowM) - (h * 60 + m));
    } catch {
      return 8;
    }
  };

  const handleFlagDelaySubmit = () => {
    if (delayModalTicket && delayReason.trim()) {
      flagKitchenDelay(delayModalTicket.id, delayReason.trim());
      setDelayModalTicket(null);
      setDelayReason('');
      alert(`Delay alert logged on ticket ${delayModalTicket.orderNumber}`);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* KDS Header Bar */}
      <div className="bg-[#f5764b] text-white rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#f5764b] rounded-xl">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              Kitchen Display System (KDS)
              <span className="flex h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
            </h1>
            <p className="text-xs text-gray-400 font-medium">
              Live Cooking Station Monitor • Touch Optimized
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Station Filters */}
          <div className="flex items-center bg-gray-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            {stations.map(st => (
              <button
                key={st}
                onClick={() => setSelectedStation(st)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedStation === st ? 'bg-[#f5764b] text-white shadow-xs font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl transition-colors ${
              soundEnabled ? 'bg-orange-950/60 text-[#f5764b] hover:bg-orange-950' : 'bg-gray-800 text-gray-400'
            }`}
            title={soundEnabled ? 'Chime sound enabled' : 'Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Column Tab Switcher */}
      <div className="flex md:hidden items-center bg-gray-900 p-1.5 rounded-2xl border border-gray-800 text-xs font-bold gap-1 overflow-x-auto shadow-sm">
        <button
          onClick={() => setKdsMobileTab('all')}
          className={`flex-1 py-2 px-2.5 rounded-xl whitespace-nowrap text-center transition-all ${
            kdsMobileTab === 'all' ? 'bg-[#f5764b] text-white shadow-xs' : 'text-gray-400 hover:text-white'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setKdsMobileTab('new')}
          className={`flex-1 py-2 px-2.5 rounded-xl whitespace-nowrap text-center transition-all ${
            kdsMobileTab === 'new' ? 'bg-[#f5764b] text-white shadow-xs' : 'text-gray-400 hover:text-white'
          }`}
        >
          New ({newTickets.length})
        </button>
        <button
          onClick={() => setKdsMobileTab('preparing')}
          className={`flex-1 py-2 px-2.5 rounded-xl whitespace-nowrap text-center transition-all ${
            kdsMobileTab === 'preparing' ? 'bg-[#f5764b] text-white shadow-xs' : 'text-gray-400 hover:text-white'
          }`}
        >
          Cooking ({preparingTickets.length})
        </button>
        <button
          onClick={() => setKdsMobileTab('ready')}
          className={`flex-1 py-2 px-2.5 rounded-xl whitespace-nowrap text-center transition-all ${
            kdsMobileTab === 'ready' ? 'bg-green-600 text-white shadow-xs' : 'text-gray-400 hover:text-white'
          }`}
        >
          Ready ({readyTickets.length})
        </button>
      </div>

      {/* 3 Kanban Touch Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* COLUMN 1: NEW ORDERS */}
        <div className={`bg-gray-100 rounded-2xl p-3 border border-gray-200 flex-col min-h-[60vh] md:min-h-[70vh] ${
          kdsMobileTab === 'all' || kdsMobileTab === 'new' ? 'flex' : 'hidden md:flex'
        }`}>
          <div className="flex items-center justify-between pb-3 px-1 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#f5764b]" />
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">
                New Tickets
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-orange-200 text-orange-950 font-bold text-xs">
              {newTickets.length}
            </span>
          </div>

          <div className="mt-3 space-y-3 flex-1 overflow-y-auto">
            {newTickets.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-xs">
                No new incoming tickets
              </div>
            ) : (
              newTickets.map(ticket => {
                const elapsed = getElapsedMinutes(ticket.createdAt);
                return (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-xl border-2 border-[#f5764b] p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div>
                        <span className="font-black text-sm text-gray-900">{ticket.orderNumber}</span>
                        <p className="text-[11px] font-bold text-[#e05a2b]">
                          {ticket.tableNumber ? `Table ${ticket.tableNumber}` : ticket.source}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-950">
                          {ticket.priority}
                        </span>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{ticket.createdAt}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {ticket.items.map(item => (
                        <div key={item.id} className="font-bold text-gray-900">
                          <span className="text-[#e05a2b] mr-1.5">{item.quantity}x</span>
                          <span>{item.name}</span>
                          {item.notes && (
                            <p className="text-[11px] text-amber-700 italic font-normal pl-4">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {ticket.notes && (
                      <p className="text-[11px] text-red-700 bg-red-50 p-1.5 rounded font-bold">
                        ⚠️ Alert: {ticket.notes}
                      </p>
                    )}

                    <button
                      onClick={() => updateKitchenTicketStatus(ticket.id, 'Preparing')}
                      className="w-full py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Start Cooking</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: PREPARING */}
        <div className={`bg-amber-50/50 rounded-2xl p-3 border border-amber-200 flex-col min-h-[60vh] md:min-h-[70vh] ${
          kdsMobileTab === 'all' || kdsMobileTab === 'preparing' ? 'flex' : 'hidden md:flex'
        }`}>
          <div className="flex items-center justify-between pb-3 px-1 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-amber-900">
                Cooking / In Prep
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
              {preparingTickets.length}
            </span>
          </div>

          <div className="mt-3 space-y-3 flex-1 overflow-y-auto">
            {preparingTickets.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-xs">
                No orders currently being prepared
              </div>
            ) : (
              preparingTickets.map(ticket => {
                const elapsed = getElapsedMinutes(ticket.startedAt || ticket.createdAt);
                const isOverdue = elapsed > 15;
                const isCritical = elapsed > 25;

                return (
                  <div
                    key={ticket.id}
                    className={`bg-white rounded-xl border-2 p-4 shadow-sm space-y-3 transition-all ${
                      isCritical ? 'border-red-500 bg-red-50/20' :
                      isOverdue ? 'border-amber-400 bg-amber-50/20' :
                      'border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div>
                        <span className="font-black text-sm text-gray-900">{ticket.orderNumber}</span>
                        <p className="text-[11px] font-bold text-orange-950">
                          {ticket.tableNumber ? `Table ${ticket.tableNumber}` : ticket.source} • {ticket.station}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-md font-mono font-black text-xs flex items-center gap-1 ${
                          isCritical ? 'bg-red-100 text-red-800 animate-bounce' :
                          isOverdue ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          <Clock className="w-3 h-3" /> {elapsed}m
                        </span>
                        {ticket.isDelayed && (
                          <span className="text-[9px] text-red-600 font-bold block mt-0.5">DELAY FLAGGED</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {ticket.items.map(item => (
                        <div key={item.id} className="font-bold text-gray-900">
                          <span className="text-amber-700 mr-1.5">{item.quantity}x</span>
                          <span>{item.name}</span>
                          {item.notes && (
                            <p className="text-[11px] text-amber-700 italic font-normal pl-4">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setDelayModalTicket(ticket);
                          setDelayReason('Preparation delayed due to high kitchen volume');
                        }}
                        className="py-1.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Flag className="w-3 h-3" />
                        <span>Flag Delay</span>
                      </button>

                      <button
                        onClick={() => updateKitchenTicketStatus(ticket.id, 'Ready')}
                        className="py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Ready</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: READY TO SERVE */}
        <div className={`bg-green-50/50 rounded-2xl p-3 border border-green-200 flex-col min-h-[60vh] md:min-h-[70vh] ${
          kdsMobileTab === 'all' || kdsMobileTab === 'ready' ? 'flex' : 'hidden md:flex'
        }`}>
          <div className="flex items-center justify-between pb-3 px-1 border-b border-green-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-green-900">
                Ready at Pass / Pick-up
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-green-200 text-green-900 font-bold text-xs">
              {readyTickets.length}
            </span>
          </div>

          <div className="mt-3 space-y-3 flex-1 overflow-y-auto">
            {readyTickets.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-xs">
                No orders waiting at the pass
              </div>
            ) : (
              readyTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl border-2 border-green-400 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                      <span className="font-black text-sm text-gray-900">{ticket.orderNumber}</span>
                      <p className="text-[11px] font-bold text-green-800">
                        {ticket.tableNumber ? `Table ${ticket.tableNumber}` : ticket.source}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-bold uppercase">
                      Ready at Pass
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    {ticket.items.map(item => (
                      <p key={item.id} className="font-semibold text-gray-800">
                        ✓ {item.quantity}x {item.name}
                      </p>
                    ))}
                  </div>

                  <button
                    onClick={() => updateKitchenTicketStatus(ticket.id, 'Completed')}
                    className="w-full py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Completed & Handed Over</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Flag Delay Reason Dialog */}
      {delayModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              Flag Preparation Delay: {delayModalTicket.orderNumber}
            </h3>
            <p className="text-xs text-gray-500">
              Provide reason for delayed cooking to notify front-of-house servers:
            </p>

            <textarea
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              rows={3}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs outline-none"
              placeholder="e.g. Charcoal tandoor reheat required, special spice prep..."
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDelayModalTicket(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagDelaySubmit}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
              >
                Log Delay Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
