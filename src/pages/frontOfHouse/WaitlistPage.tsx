import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Bell,
  Armchair,
  Trash2,
  Phone,
  CheckCircle2,
  Users,
  Search,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WaitlistEntry } from '../../types';

interface WaitlistPageProps {
  onNavigate: (pageId: string) => void;
}

export const WaitlistPage: React.FC<WaitlistPageProps> = ({ onNavigate }) => {
  const { waitlist, tables, addWaitlist, seatWaitlist, removeWaitlist, notifyWaitlist, currentBranchId } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [preferredSection, setPreferredSection] = useState('Indoor');
  const [estimatedWait, setEstimatedWait] = useState(15);
  const [notes, setNotes] = useState('');

  const filteredWaitlist = waitlist.filter(w => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return w.guestName.toLowerCase().includes(q) || w.phone.includes(q);
    }
    return true;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !phone.trim()) {
      alert('Please fill in guest name and phone number.');
      return;
    }

    addWaitlist({
      guestName,
      phone,
      partySize,
      preferredSection,
      estimatedWaitMinutes: estimatedWait,
      notes: notes || undefined,
      status: 'Waiting',
      branchId: currentBranchId
    });

    setIsAddModalOpen(false);
    setGuestName('');
    setPhone('');
    setNotes('');
  };

  const handleSeat = (tableId: string) => {
    if (!selectedEntry) return;
    seatWaitlist(selectedEntry.id, tableId);
    setSeatModalOpen(false);
    alert(`Guest ${selectedEntry.guestName} seated at table! Table marked Occupied.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Live Waiting Queue
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage walk-in guest wait times, SMS notifications, and table seating dispatch
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Waiting Guest</span>
        </button>
      </div>

      {/* Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-50 text-[#f5764b] border border-orange-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-400">Total Waiting Parties</p>
            <p className="text-xl font-bold text-gray-900">
              {waitlist.filter(w => w.status === 'Waiting').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-400">Notified (Table Ready)</p>
            <p className="text-xl font-bold text-amber-700">
              {waitlist.filter(w => w.status === 'Notified').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-green-50 text-green-600 border border-green-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-400">Available Tables Now</p>
            <p className="text-xl font-bold text-green-700">
              {tables.filter(t => t.status === 'Available').length}
            </p>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search waiting guest..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none"
          />
        </div>

        <span className="text-xs text-gray-500 font-medium">
          Showing {filteredWaitlist.length} guests in queue
        </span>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Queue #</th>
                <th className="py-3 px-4">Guest Details</th>
                <th className="py-3 px-4 text-center">Party Size</th>
                <th className="py-3 px-4">Wait Time</th>
                <th className="py-3 px-4">Preferred Area</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWaitlist.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No guests currently in waitlist.
                  </td>
                </tr>
              ) : (
                filteredWaitlist.map((w, index) => (
                  <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-700">#{index + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{w.guestName}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-gray-400" /> {w.phone}
                      </p>
                      {w.notes && (
                        <p className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded mt-1 inline-block">
                          Note: {w.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                        {w.partySize}p
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" /> ~{w.estimatedWaitMinutes} mins
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Added at {w.createdAt}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">{w.preferredSection}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        w.status === 'Waiting' ? 'bg-orange-100 text-orange-950' :
                        w.status === 'Notified' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {w.status === 'Waiting' && (
                          <button
                            onClick={() => notifyWaitlist(w.id)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                            title="Send SMS table notification"
                          >
                            <Bell className="w-3 h-3" />
                            <span>Notify</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedEntry(w);
                            setSeatModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Armchair className="w-3 h-3" />
                          <span>Seat Guest</span>
                        </button>

                        <button
                          onClick={() => removeWaitlist(w.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Guest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Add Guest to Waitlist</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Guest Name *</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Rohan Deshmukh"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98112 34567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Party Size</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Estimated Wait (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={estimatedWait}
                    onChange={(e) => setEstimatedWait(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Preferred Section</label>
                <select
                  value={preferredSection}
                  onChange={(e) => setPreferredSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                >
                  <option value="Indoor">Indoor Air-conditioned</option>
                  <option value="Outdoor Terrace">Outdoor Terrace</option>
                  <option value="Bar Lounge">Bar Lounge</option>
                  <option value="Any Available">Any Available Section</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Special Preferences / Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Near window, high chair needed"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg font-bold shadow-xs"
                >
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Guest Table Picker */}
      {seatModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              Seat {selectedEntry.guestName} ({selectedEntry.partySize} Guests)
            </h3>
            <p className="text-xs text-gray-500">
              Select an available table to seat the party:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tables.filter(t => t.status === 'Available').length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  <AlertCircle className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  No available tables right now.
                </div>
              ) : (
                tables.filter(t => t.status === 'Available').map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleSeat(t.id)}
                    className="p-3 rounded-lg border border-gray-200 hover:border-[#f5764b] hover:bg-orange-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-bold text-gray-900">{t.number}</span>
                      <span className="text-gray-500 ml-2">({t.section} • Capacity: {t.capacity}p)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#f5764b] text-white font-bold text-[10px]">
                      Seat Here
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSeatModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
