import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Shift, UserRole } from '../../types';

export const ShiftsPage: React.FC = () => {
  const { shifts, staff, addShift, currentBranchId } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id || '');
  const [shiftDate, setShiftDate] = useState('2026-10-16');
  const [startTime, setStartTime] = useState('11:30');
  const [endTime, setEndTime] = useState('20:30');
  const [station, setStation] = useState('Tandoor & Charcoal');
  const [notes, setNotes] = useState('');

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    const stf = staff.find(s => s.id === selectedStaffId);
    if (!stf) return;

    addShift({
      staffId: stf.id,
      staffName: stf.name,
      role: stf.role,
      branchId: currentBranchId,
      date: shiftDate,
      startTime,
      endTime,
      station,
      notes: notes || undefined,
      isPublished: true
    });

    setModalOpen(false);
    alert(`Shift scheduled for ${stf.name} on ${shiftDate}!`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Shifts & Staff Roster
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Weekly station scheduling, shift rosters, overlap warnings, and roster publishing
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Shift</span>
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts.map(shift => (
          <div
            key={shift.id}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-sm text-gray-900">{shift.staffName}</h3>
                <span className="text-[10px] font-semibold text-[#e05a2b] bg-orange-50 px-2 py-0.5 rounded">
                  {shift.role}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                Published
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="flex items-center gap-1.5 text-gray-700 font-medium">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> {shift.date}
              </p>
              <p className="flex items-center gap-1.5 text-gray-700 font-bold">
                <Clock className="w-3.5 h-3.5 text-[#f5764b]" /> {shift.startTime} - {shift.endTime}
              </p>
              {shift.station && (
                <p className="text-[11px] text-gray-500 font-medium">
                  Station: <span className="text-gray-800">{shift.station}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Shift Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">Schedule Staff Shift</h3>

            <form onSubmit={handleCreateShift} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Staff Member *</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                >
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Shift Date *</label>
                <input
                  type="date"
                  required
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Station / Assignment</label>
                <input
                  type="text"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  placeholder="e.g. Indoor Station A, Tandoor & Charcoal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg font-bold shadow-xs"
                >
                  Publish Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
