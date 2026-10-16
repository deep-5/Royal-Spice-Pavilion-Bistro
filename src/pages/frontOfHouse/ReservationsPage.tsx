import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  UserCheck,
  Armchair,
  Phone,
  Mail,
  Edit,
  Eye,
  Send,
  UserX,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Reservation, ReservationStatus, Table } from '../../types';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

interface ReservationsPageProps {
  onNavigate: (pageId: string) => void;
}

export const ReservationsPage: React.FC<ReservationsPageProps> = ({ onNavigate }) => {
  const {
    reservations,
    tables,
    addReservation,
    updateReservation,
    cancelReservation,
    seatReservation,
    checkInReservation,
    addWaitlist,
    currentBranchId
  } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'day' | 'week'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState('2026-10-15');

  // Modals & Drawers
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [assignTableModalOpen, setAssignTableModalOpen] = useState(false);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  // Form State
  const [formGuestName, setFormGuestName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDate, setFormDate] = useState('2026-10-15');
  const [formTime, setFormTime] = useState('19:30');
  const [formPartySize, setFormPartySize] = useState<number>(2);
  const [formDuration, setFormDuration] = useState<number>(90);
  const [formPreference, setFormPreference] = useState<'Indoor' | 'Outdoor' | 'Window' | 'Any'>('Indoor');
  const [formOccasion, setFormOccasion] = useState<'Birthday' | 'Anniversary' | 'Business' | 'Family' | 'Other'>('Other');
  const [formAssignedTableId, setFormAssignedTableId] = useState<string>('');
  const [formBookingSource, setFormBookingSource] = useState<'Phone' | 'Walk-in' | 'Website' | 'QR' | 'Other'>('Phone');
  const [formSpecialRequests, setFormSpecialRequests] = useState('');
  const [formDeposit, setFormDeposit] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState<{ text: string; isAvailable: boolean } | null>(null);
  const [formError, setFormError] = useState('');

  // Top metric badges
  const todayReservations = reservations.filter(r => r.date === selectedDate);
  const upcomingCount = todayReservations.filter(r => r.status === 'Confirmed').length;
  const checkedInCount = todayReservations.filter(r => r.status === 'Checked In').length;
  const seatedCount = todayReservations.filter(r => r.status === 'Seated').length;
  const cancelledCount = todayReservations.filter(r => r.status === 'Cancelled').length;
  const noShowCount = todayReservations.filter(r => r.status === 'No-show').length;

  // Filtered reservations
  const filteredReservations = reservations.filter(r => {
    if (selectedDate && r.date !== selectedDate && viewMode !== 'week') return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return r.guestName.toLowerCase().includes(q) || r.phone.includes(q) || r.id.toLowerCase().includes(q);
    }
    return true;
  });

  // Check Availability Logic against Operating hours, duration, table capacity, and overlapping bookings
  const checkAvailability = () => {
    setFormError('');
    if (!formTime) {
      setFormError('Please pick a reservation time.');
      return false;
    }

    // Operating hours check (11:00 AM - 11:30 PM)
    const [hours, minutes] = formTime.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const openTimeInMinutes = 11 * 60; // 11:00 AM
    const closeTimeInMinutes = 23 * 60 + 30; // 11:30 PM

    if (timeInMinutes < openTimeInMinutes || timeInMinutes > closeTimeInMinutes) {
      setAvailabilityMessage({
        text: 'Restaurant is closed at this hour. Operating hours are 11:00 AM to 11:30 PM.',
        isAvailable: false
      });
      return false;
    }

    // Check suitable tables that fit party size and have no overlapping booking
    const availableTables = tables.filter(t => {
      if (t.capacity < formPartySize) return false;
      if (t.status === 'Out of Service') return false;

      // Check overlap
      const conflict = reservations.some(r => {
        if (r.date !== formDate || r.assignedTableId !== t.id || r.status === 'Cancelled' || r.status === 'No-show') {
          return false;
        }
        const [rHours, rMins] = r.time.split(':').map(Number);
        const rStart = rHours * 60 + rMins;
        const rEnd = rStart + (r.expectedDuration || 90);

        const currentStart = timeInMinutes;
        const currentEnd = currentStart + formDuration;

        // Check if ranges overlap
        return Math.max(rStart, currentStart) < Math.min(rEnd, currentEnd);
      });

      return !conflict;
    });

    if (availableTables.length > 0) {
      setAvailabilityMessage({
        text: `Success! ${availableTables.length} tables available (${availableTables.map(t => t.number).join(', ')})`,
        isAvailable: true
      });
      if (!formAssignedTableId) {
        setFormAssignedTableId(availableTables[0].id);
      }
      return true;
    } else {
      setAvailabilityMessage({
        text: `No tables available for party of ${formPartySize} on ${formDate} at ${formTime}. Consider waitlist or another time slot.`,
        isAvailable: false
      });
      return false;
    }
  };

  const handleSaveBooking = (isDraft = false) => {
    if (!formGuestName.trim() || !formPhone.trim()) {
      setFormError('Guest name and phone number are required.');
      return;
    }

    if (!isDraft) {
      const isSlotOk = checkAvailability();
      if (!isSlotOk && !formAssignedTableId) {
        setFormError('Cannot confirm: please select an available table or save as draft.');
        return;
      }
    }

    addReservation({
      guestName: formGuestName,
      phone: formPhone,
      email: formEmail || undefined,
      date: formDate,
      time: formTime,
      partySize: formPartySize,
      expectedDuration: formDuration,
      seatingPreference: formPreference,
      occasion: formOccasion,
      assignedTableId: formAssignedTableId || undefined,
      bookingSource: formBookingSource,
      specialRequests: formSpecialRequests || undefined,
      depositAmount: formDeposit || undefined,
      staffNotes: formNotes || undefined,
      status: isDraft ? 'Draft' : 'Confirmed',
      branchId: currentBranchId
    });

    setIsNewModalOpen(false);
    resetForm();
    alert(isDraft ? 'Reservation saved as Draft.' : 'Reservation successfully confirmed!');
  };

  const resetForm = () => {
    setFormGuestName('');
    setFormPhone('');
    setFormEmail('');
    setFormDate('2026-10-15');
    setFormTime('19:30');
    setFormPartySize(2);
    setFormDuration(90);
    setFormPreference('Indoor');
    setFormOccasion('Other');
    setFormAssignedTableId('');
    setFormBookingSource('Phone');
    setFormSpecialRequests('');
    setFormDeposit(0);
    setFormNotes('');
    setAvailabilityMessage(null);
    setFormError('');
  };

  const handleSeatGuests = (r: Reservation) => {
    if (!r.assignedTableId) {
      setSelectedRes(r);
      setAssignTableModalOpen(true);
      return;
    }
    seatReservation(r.id, r.assignedTableId);
    alert(`Guests seated at Table ${tables.find(t => t.id === r.assignedTableId)?.number}. Table marked Occupied.`);
  };

  const handleSendConfirmation = (r: Reservation) => {
    setConfirmationNotice(`Simulated SMS & WhatsApp confirmation dispatched to ${r.phone} for ${r.guestName} (${r.date} at ${r.time}). Delivery: DELIVERED.`);
    setTimeout(() => setConfirmationNotice(null), 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast confirmation notice */}
      {confirmationNotice && (
        <div className="p-3 bg-green-50 border border-green-300 text-green-800 rounded-xl text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <span>{confirmationNotice}</span>
          <button onClick={() => setConfirmationNotice(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Reservations & Table Booking
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage table reservations, guest check-ins, capacity allocations, and waitlists
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              resetForm();
              setIsNewModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs text-center">
          <p className="text-[10px] font-bold uppercase text-gray-400">Today's Bookings</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{todayReservations.length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs text-center">
          <p className="text-[10px] font-bold uppercase text-[#f5764b]">Upcoming Slots</p>
          <p className="text-lg font-bold text-[#e05a2b] mt-0.5">{upcomingCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs text-center">
          <p className="text-[10px] font-bold uppercase text-purple-600">Checked In</p>
          <p className="text-lg font-bold text-purple-700 mt-0.5">{checkedInCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs text-center">
          <p className="text-[10px] font-bold uppercase text-green-600">Seated Guests</p>
          <p className="text-lg font-bold text-green-700 mt-0.5">{seatedCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs text-center">
          <p className="text-[10px] font-bold uppercase text-red-500">Cancelled</p>
          <p className="text-lg font-bold text-red-600 mt-0.5">{cancelledCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs text-center">
          <p className="text-[10px] font-bold uppercase text-gray-500">No-shows</p>
          <p className="text-lg font-bold text-gray-700 mt-0.5">{noShowCount}</p>
        </div>
      </div>

      {/* View Toolbar & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* View toggle & date selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-2xs text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'day' ? 'bg-white shadow-2xs text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Calendar Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'week' ? 'bg-white shadow-2xs text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Calendar Week
            </button>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-700 outline-none"
            />
          </div>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search guest or phone..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-[#f5764b]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="Seated">Seated</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No-show">No-show</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Main Reservations Table */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Guest Details</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-center">Party</th>
                  <th className="py-3 px-4">Assigned Table</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No reservations found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((r) => {
                    const assignedTable = tables.find(t => t.id === r.assignedTableId);

                    return (
                      <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-gray-800">{r.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900">{r.guestName}</p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400" /> {r.phone}
                          </p>
                          {r.specialRequests && (
                            <p className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 inline-block">
                              Note: {r.specialRequests}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{r.date}</p>
                          <p className="text-[11px] text-[#e05a2b] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {r.time} ({r.expectedDuration}m)
                          </p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
                            {r.partySize} guests
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {assignedTable ? (
                            <span className="font-bold text-orange-950 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md text-xs">
                              {assignedTable.number} ({assignedTable.section})
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedRes(r);
                                setAssignTableModalOpen(true);
                              }}
                              className="text-xs text-[#f5764b] hover:text-orange-950 font-semibold underline"
                            >
                              + Assign Table
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{r.bookingSource}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            r.status === 'Confirmed' ? 'bg-orange-100 text-orange-950 border border-orange-200' :
                            r.status === 'Checked In' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            r.status === 'Seated' ? 'bg-green-100 text-green-800 border border-green-200' :
                            r.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                            r.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            r.status === 'No-show' ? 'bg-gray-200 text-gray-700' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Actions by status */}
                            {r.status === 'Confirmed' && (
                              <>
                                <button
                                  onClick={() => checkInReservation(r.id)}
                                  className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                  title="Check In Guest"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSeatGuests(r)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Seat Guests at Table"
                                >
                                  <Armchair className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSendConfirmation(r)}
                                  className="p-1 text-[#f5764b] hover:bg-orange-50 rounded"
                                  title="Send Confirmation SMS"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {r.status === 'Checked In' && (
                              <button
                                onClick={() => handleSeatGuests(r)}
                                className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[11px] transition-colors"
                              >
                                Seat Guests
                              </button>
                            )}

                            {r.status === 'Seated' && (
                              <button
                                onClick={() => onNavigate('pos')}
                                className="px-2.5 py-1 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded font-bold text-[11px] transition-colors flex items-center gap-1"
                              >
                                Start Order →
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedRes(r);
                                setDetailModalOpen(true);
                              }}
                              className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {r.status !== 'Cancelled' && r.status !== 'Completed' && (
                              <button
                                onClick={() => {
                                  setSelectedRes(r);
                                  setCancelModalOpen(true);
                                }}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Cancel Booking"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar Day / Week View */
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">
              {viewMode === 'day' ? `Day Timeline: ${selectedDate}` : `Weekly Schedule Overview`}
            </h3>
            <span className="text-xs text-gray-500">{filteredReservations.length} bookings scheduled</span>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredReservations.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-gray-200 hover:border-[#f5764b] bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">{r.guestName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-orange-50 text-[#e05a2b] border border-orange-200">
                      {r.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {r.phone}
                  </p>
                  <p className="text-xs text-gray-600 mt-2 font-medium">
                    Party of {r.partySize} • {r.seatingPreference} • {r.occasion || 'Standard'}
                  </p>
                  {r.assignedTableId && (
                    <p className="text-xs font-bold text-[#e05a2b] mt-1">
                      Table: {tables.find(t => t.id === r.assignedTableId)?.number}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-gray-500">{r.status}</span>
                  <button
                    onClick={() => {
                      setSelectedRes(r);
                      setDetailModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#f5764b] hover:text-[#e05a2b]"
                  >
                    Manage Booking →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Reservation Modal Form */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30  overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-base text-gray-900">New Table Reservation</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
                  {formError}
                </div>
              )}

              {availabilityMessage && (
                <div className={`p-3 rounded-lg border font-medium flex items-center gap-2 ${
                  availabilityMessage.isAvailable ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{availabilityMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Guest Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formGuestName}
                    onChange={(e) => setFormGuestName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Khanna"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#f5764b] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98123 45678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#f5764b] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#f5764b] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Booking Source</label>
                  <select
                    value={formBookingSource}
                    onChange={(e) => setFormBookingSource(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs bg-white"
                  >
                    <option value="Phone">Phone Call</option>
                    <option value="Walk-in">Walk-in Direct</option>
                    <option value="Website">Online Website</option>
                    <option value="QR">Table QR Scan</option>
                    <option value="Other">Concierge / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Reservation Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Reservation Time</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Party Size (Guests)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={formPartySize}
                    onChange={(e) => setFormPartySize(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Expected Duration (Mins)</label>
                  <select
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs bg-white"
                  >
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes (Standard)</option>
                    <option value={120}>120 minutes (2 Hours)</option>
                    <option value={180}>180 minutes (3 Hours)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Seating Preference</label>
                  <select
                    value={formPreference}
                    onChange={(e) => setFormPreference(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs bg-white"
                  >
                    <option value="Indoor">Indoor Air-conditioned</option>
                    <option value="Outdoor">Outdoor Terrace</option>
                    <option value="Window">Window Booth</option>
                    <option value="Any">Any Available Table</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Dining Occasion</label>
                  <select
                    value={formOccasion}
                    onChange={(e) => setFormOccasion(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs bg-white"
                  >
                    <option value="Other">Casual / Regular</option>
                    <option value="Birthday">Birthday Celebration</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Business">Business Dinner</option>
                    <option value="Family">Family Gathering</option>
                  </select>
                </div>
              </div>

              {/* Table assignment & Check Availability button */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-gray-700">Table Assignment</label>
                  <button
                    type="button"
                    onClick={checkAvailability}
                    className="px-3 py-1 bg-orange-50 text-orange-950 hover:bg-orange-100 border border-orange-200 rounded text-xs font-bold"
                  >
                    🔍 Check Availability
                  </button>
                </div>
                <select
                  value={formAssignedTableId}
                  onChange={(e) => setFormAssignedTableId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs bg-white"
                >
                  <option value="">-- Choose or check available table --</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.number} - {t.section} (Capacity: {t.capacity} guests) - Status: {t.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Special Guest Requests</label>
                <textarea
                  value={formSpecialRequests}
                  onChange={(e) => setFormSpecialRequests(e.target.value)}
                  rows={2}
                  placeholder="e.g. Candlelight setup, child high-chair, quiet corner"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Advance Deposit (₹)</label>
                  <input
                    type="number"
                    value={formDeposit}
                    onChange={(e) => setFormDeposit(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Internal Staff Notes</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="e.g. Regular patron, prefer waiter Kunal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (formGuestName && formPhone) {
                    addWaitlist({
                      guestName: formGuestName,
                      phone: formPhone,
                      partySize: formPartySize,
                      preferredSection: formPreference,
                      estimatedWaitMinutes: 20,
                      status: 'Waiting',
                      branchId: currentBranchId
                    });
                    setIsNewModalOpen(false);
                    alert(`Added ${formGuestName} to Waitlist.`);
                  } else {
                    setFormError('Please enter guest name and phone to add to waitlist.');
                  }
                }}
                className="text-xs font-semibold text-[#e05a2b] hover:underline"
              >
                + Add to Waitlist Instead
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveBooking(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBooking(false)}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-xs"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Detail Drawer / Modal */}
      {detailModalOpen && selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="font-bold text-base text-gray-900">{selectedRes.guestName}</h3>
                <p className="text-xs text-gray-500">Booking Reference: {selectedRes.id}</p>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Contact</span>
                  <span className="font-bold text-gray-800">{selectedRes.phone}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Party Size</span>
                  <span className="font-bold text-gray-800">{selectedRes.partySize} Guests ({selectedRes.expectedDuration} mins)</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Date & Time</span>
                  <span className="font-bold text-orange-950">{selectedRes.date} at {selectedRes.time}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Assigned Table</span>
                  <span className="font-bold text-gray-800">
                    {tables.find(t => t.id === selectedRes.assignedTableId)?.number || 'None'}
                  </span>
                </div>
              </div>

              {selectedRes.specialRequests && (
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Special Requests</span>
                  <p className="mt-0.5 text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                    {selectedRes.specialRequests}
                  </p>
                </div>
              )}

              {selectedRes.staffNotes && (
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Internal Staff Notes</span>
                  <p className="mt-0.5 text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                    {selectedRes.staffNotes}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">Status Transition</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      checkInReservation(selectedRes.id);
                      setDetailModalOpen(false);
                    }}
                    className="px-3 py-1.5 rounded bg-purple-50 text-purple-700 font-bold hover:bg-purple-100"
                  >
                    Check In Guest
                  </button>
                  <button
                    onClick={() => {
                      handleSeatGuests(selectedRes);
                      setDetailModalOpen(false);
                    }}
                    className="px-3 py-1.5 rounded bg-green-50 text-green-700 font-bold hover:bg-green-100"
                  >
                    Seat Guests
                  </button>
                  <button
                    onClick={() => {
                      handleSendConfirmation(selectedRes);
                      setDetailModalOpen(false);
                    }}
                    className="px-3 py-1.5 rounded bg-orange-50 text-[#e05a2b] font-bold hover:bg-orange-100"
                  >
                    Resend Confirmation
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  setCancelModalOpen(true);
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-800"
              >
                Cancel Booking
              </button>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Table Picker Modal */}
      {assignTableModalOpen && selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              Assign Table for {selectedRes.guestName}
            </h3>
            <p className="text-xs text-gray-500">
              Party size: {selectedRes.partySize} guests • Section preference: {selectedRes.seatingPreference}
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tables.filter(t => t.status === 'Available' || t.status === 'Reserved').map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    seatReservation(selectedRes.id, t.id);
                    setAssignTableModalOpen(false);
                    alert(`Assigned table ${t.number} and seated guests!`);
                  }}
                  className="p-3 rounded-lg border border-gray-200 hover:border-[#f5764b] hover:bg-orange-50/50 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900">{t.number}</span>
                    <span className="text-gray-500 ml-2">({t.section} • Capacity: {t.capacity}p)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold text-[10px]">
                    Select Table
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setAssignTableModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Cancellation */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={(reason) => {
          if (selectedRes) {
            cancelReservation(selectedRes.id, reason || 'Customer requested cancellation');
          }
        }}
        title="Cancel Reservation"
        message={`Are you sure you want to cancel the reservation for ${selectedRes?.guestName}?`}
        confirmText="Confirm Cancellation"
        requireReason={true}
        reasonPlaceholder="Specify cancellation reason (e.g. Guest called to cancel, weather issue)..."
      />
    </div>
  );
};
