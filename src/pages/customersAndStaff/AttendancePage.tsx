import React, { useState } from 'react';
import {
  Clock,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Coffee,
  CheckSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord } from '../../types';

export const AttendancePage: React.FC = () => {
  const {
    attendance,
    staff,
    clockIn,
    clockOut,
    currentUser
  } = useApp();

  const [dateFilter, setDateFilter] = useState('2026-10-15');
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [correctionReason, setCorrectionReason] = useState('');

  const todayRecords = attendance.filter(a => a.date === dateFilter);
  const presentCount = staff.filter(s => s.currentAttendanceStatus === 'Clocked In').length;
  const lateCount = todayRecords.filter(a => a.status === 'Late').length;
  const totalHoursLogged = todayRecords.reduce((sum, a) => sum + (a.totalHours || 0), 0);

  const currentStaff = staff.find(s => s.role === currentUser.role);
  const isSelfClockedIn = currentStaff?.currentAttendanceStatus === 'Clocked In';

  const handleSelfClockToggle = () => {
    if (!currentStaff) return;
    if (isSelfClockedIn) {
      clockOut(currentStaff.id);
    } else {
      clockIn(currentStaff.id);
    }
  };

  const handleRequestCorrectionSubmit = () => {
    if (!selectedRecord || !correctionReason.trim()) return;
    alert(`Correction request submitted for ${selectedRecord.staffName}. Manager notified for approval.`);
    setCorrectionModalOpen(false);
    setCorrectionReason('');
  };

  const exportTimesheet = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Staff Name,Date,Clock In,Clock Out,Break (Mins),Total Hours,Status\n" +
      todayRecords.map(a => 
        `"${a.staffName}","${a.date}","${a.clockIn}","${a.clockOut || 'Active'}",${a.breakDurationMinutes},${a.totalHours},"${a.status}"`
      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `staff_timesheet_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Staff Attendance & Timesheets
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time biometric punch simulation, break durations, hours worked, and timesheet exports
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentStaff && (
            <button
              onClick={handleSelfClockToggle}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-2xs transition-colors ${
                isSelfClockedIn
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{isSelfClockedIn ? 'Clock Out (Finish Shift)' : 'Clock In Now'}</span>
            </button>
          )}

          <button
            onClick={exportTimesheet}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Export Timesheet</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-green-600">Present on Duty Today</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{presentCount} staff</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Active across stations</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-amber-600">Late Arrivals</p>
          <p className="text-2xl font-bold text-amber-700 mt-0.5">{lateCount} staff</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Clocked in &gt; 15m after shift</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-[#f5764b]">Total Hours Logged</p>
          <p className="text-2xl font-bold text-orange-950 mt-0.5">{totalHoursLogged.toFixed(1)} hrs</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Today's cumulative labour</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-purple-600">On Break Right Now</p>
          <p className="text-2xl font-bold text-purple-700 mt-0.5">1 staff</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Staggered meal breaks</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Clock In Time</th>
                <th className="py-3 px-4">Clock Out Time</th>
                <th className="py-3 px-4 text-center">Break Duration</th>
                <th className="py-3 px-4">Total Shift Hours</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {todayRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{rec.staffName}</td>
                  <td className="py-3 px-4 text-gray-500">{rec.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-orange-950">{rec.clockIn}</td>
                  <td className="py-3 px-4 font-mono text-gray-600">{rec.clockOut || 'Active (On Duty)'}</td>
                  <td className="py-3 px-4 text-center font-medium text-gray-600">{rec.breakDurationMinutes} mins</td>
                  <td className="py-3 px-4 font-bold text-gray-800">{rec.totalHours.toFixed(2)} hrs</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rec.status === 'On Time' ? 'bg-green-100 text-green-800' :
                      rec.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedRecord(rec);
                        setCorrectionModalOpen(true);
                      }}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-semibold"
                    >
                      Correction
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Correction Modal */}
      {correctionModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              Request Attendance Correction
            </h3>
            <p className="text-gray-500">
              Submit punch time discrepancy for {selectedRecord.staffName} on {selectedRecord.date}:
            </p>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Reason for Adjustment *</label>
              <textarea
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                rows={3}
                placeholder="e.g. Card scanner offline, biometric missed punch at 09:30"
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCorrectionModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestCorrectionSubmit}
                className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg font-bold"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
