import React, { useState } from 'react';
import {
  History,
  Clock,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PrepHistoryPage: React.FC = () => {
  const { kitchenTickets, updateKitchenTicketStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState('All');

  const historyTickets = kitchenTickets.filter(k => {
    if (stationFilter !== 'All' && k.station !== stationFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return k.orderNumber.toLowerCase().includes(q) || k.items.some(i => i.name.toLowerCase().includes(q));
    }
    return true;
  });

  const handleRecallTicket = (ticketId: string) => {
    updateKitchenTicketStatus(ticketId, 'Preparing');
    alert(`Ticket recalled back into active cooking queue!`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Kitchen Preparation History
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Historical kitchen ticket turnaround times, dish cooking durations, and ticket recalls
          </p>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-gray-400">Total Tickets Prepared</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{kitchenTickets.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-green-600">Average Turnaround Time</p>
          <p className="text-xl font-bold text-green-700 mt-0.5">14.2 minutes</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-amber-600">Delayed Tickets Logged</p>
          <p className="text-xl font-bold text-amber-700 mt-0.5">
            {kitchenTickets.filter(k => k.isDelayed).length}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order or dish..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none"
          />
        </div>

        <select
          value={stationFilter}
          onChange={(e) => setStationFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none"
        >
          <option value="All">All Stations</option>
          <option value="Main Kitchen">Main Kitchen</option>
          <option value="Tandoor & Grill">Tandoor & Grill</option>
          <option value="Drinks & Bar">Drinks & Bar</option>
          <option value="Dessert & Bakery">Dessert & Bakery</option>
          <option value="Pantry">Pantry</option>
        </select>
      </div>

      {/* Tickets History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Dishes Prepared</th>
                <th className="py-3 px-4">Timestamps</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historyTickets.map(kt => (
                <tr key={kt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-gray-800">{kt.id}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{kt.orderNumber}</td>
                  <td className="py-3 px-4">
                    {kt.tableNumber ? `Table ${kt.tableNumber}` : kt.source}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-700">{kt.station}</td>
                  <td className="py-3 px-4">
                    {kt.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    <span className="block text-[11px]">Received: {kt.createdAt}</span>
                    {kt.startedAt && <span className="block text-[10px] text-[#e05a2b]">Started: {kt.startedAt}</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                      {kt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleRecallTicket(kt.id)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-bold text-[10px] flex items-center gap-1 ml-auto"
                      title="Recall back to active kitchen board"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Recall</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
