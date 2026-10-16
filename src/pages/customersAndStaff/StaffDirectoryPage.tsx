import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  Building,
  Edit,
  Eye,
  Shield,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StaffMember, UserRole } from '../../types';

interface StaffDirectoryPageProps {
  onNavigate: (pageId: string) => void;
}

export const StaffDirectoryPage: React.FC<StaffDirectoryPageProps> = ({ onNavigate }) => {
  const { staff, branches, addStaff, updateStaff, currentBranchId, currentBranch } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState<UserRole>('Host / Waiter');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branchId, setBranchId] = useState(currentBranchId);
  const [joiningDate, setJoiningDate] = useState('2025-01-15');
  const [status, setStatus] = useState<StaffMember['status']>('Active');
  const [emergencyContact, setEmergencyContact] = useState('');

  const filteredStaff = staff.filter(s => {
    if (roleFilter !== 'All' && s.role !== roleFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.employeeId.toLowerCase().includes(q) || s.phone.includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName('');
    setEmployeeId(`EMP-${Math.floor(Math.random() * 900 + 100)}`);
    setRole('Host / Waiter');
    setPhone('');
    setEmail('');
    setBranchId(currentBranchId);
    setJoiningDate(new Date().toISOString().substring(0, 10));
    setStatus('Active');
    setEmergencyContact('+91 98999 00000');
    setModalOpen(true);
  };

  const handleOpenEdit = (s: StaffMember) => {
    setEditingStaff(s);
    setName(s.name);
    setEmployeeId(s.employeeId);
    setRole(s.role);
    setPhone(s.phone);
    setEmail(s.email);
    setBranchId(s.branchId);
    setJoiningDate(s.joiningDate);
    setStatus(s.status);
    setEmergencyContact(s.emergencyContact || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const branchObj = branches.find(b => b.id === branchId) || currentBranch;

    if (editingStaff) {
      updateStaff({
        ...editingStaff,
        name: name.trim(),
        employeeId: employeeId.trim(),
        role,
        phone: phone.trim(),
        email: email.trim(),
        branchId,
        branchName: branchObj.name,
        joiningDate,
        status,
        emergencyContact: emergencyContact || undefined
      });
    } else {
      addStaff({
        name: name.trim(),
        employeeId: employeeId.trim(),
        role,
        phone: phone.trim(),
        email: email.trim(),
        branchId,
        branchName: branchObj.name,
        joiningDate,
        status,
        emergencyContact: emergencyContact || undefined,
        currentAttendanceStatus: 'Clocked In'
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Staff & Employee Directory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Personnel profiles, roles, branch assignments, and attendance status
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee name, ID, or phone..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none"
        >
          <option value="All">All Job Roles</option>
          <option value="Restaurant Owner">Restaurant Owner</option>
          <option value="Manager">Manager</option>
          <option value="Cashier">Cashier</option>
          <option value="Kitchen Staff">Kitchen Staff</option>
          <option value="Host / Waiter">Host / Waiter</option>
          <option value="Accountant">Accountant</option>
        </select>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4">Today's Clock Status</th>
                <th className="py-3 px-4">Employment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaff.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-gray-800">{s.employeeId}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-gray-900">{s.name}</p>
                    <p className="text-[10px] text-gray-500">{s.phone} • {s.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold bg-orange-50 text-orange-950 text-[10px]">
                      {s.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{s.branchName}</td>
                  <td className="py-3 px-4 text-gray-500">{s.joiningDate}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.currentAttendanceStatus === 'Clocked In'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {s.currentAttendanceStatus || 'Clocked Out'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedStaff(s);
                          setProfileModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded"
                        title="View Staff Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1 text-[#f5764b] hover:text-orange-950 rounded"
                        title="Edit Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              {editingStaff ? 'Edit Staff Profile' : 'Add Employee to Roster'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Restaurant Owner">Restaurant Owner</option>
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Kitchen Staff">Kitchen Staff</option>
                    <option value="Host / Waiter">Host / Waiter</option>
                    <option value="Accountant">Accountant</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Emergency Contact Number</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="+91 98000 00000"
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
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Profile Modal */}
      {profileModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedStaff.name}</h3>
                <p className="text-xs text-[#e05a2b] font-bold">{selectedStaff.role} • {selectedStaff.employeeId}</p>
              </div>
              <button onClick={() => setProfileModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-2">
              <p><span className="font-bold text-gray-700">Phone:</span> {selectedStaff.phone}</p>
              <p><span className="font-bold text-gray-700">Email:</span> {selectedStaff.email}</p>
              <p><span className="font-bold text-gray-700">Branch:</span> {selectedStaff.branchName}</p>
              <p><span className="font-bold text-gray-700">Joining Date:</span> {selectedStaff.joiningDate}</p>
              <p><span className="font-bold text-gray-700">Emergency Contact:</span> {selectedStaff.emergencyContact || 'None'}</p>
              <p><span className="font-bold text-gray-700">Attendance:</span> {selectedStaff.currentAttendanceStatus || 'Clocked Out'}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
