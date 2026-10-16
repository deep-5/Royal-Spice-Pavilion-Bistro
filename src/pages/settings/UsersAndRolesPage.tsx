import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Users,
  Shield,
  Plus,
  Edit2,
  Check,
  CheckCircle2,
  XCircle,
  Key,
  LogIn,
  Mail,
  Phone,
  Building
} from 'lucide-react';

export const UsersAndRolesPage: React.FC = () => {
  const { users, branches, addUser, updateUser, currentUser, setCurrentUser, setCurrentRole } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Cashier');
  const [branchId, setBranchId] = useState('b1');
  const [status, setStatus] = useState<User['status']>('Active');

  const roles: UserRole[] = [
    'Restaurant Owner',
    'Manager',
    'Cashier',
    'Kitchen Staff',
    'Host / Waiter',
    'Accountant'
  ];

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('Cashier');
    setBranchId(branches[0]?.id || 'b1');
    setStatus('Active');
    setShowModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setRole(user.role);
    setBranchId(user.branchId);
    setStatus(user.status);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUser) {
      updateUser({
        ...editingUser,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        branchId,
        status
      });
    } else {
      addUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        branchId,
        status,
        lastLogin: 'Just now'
      });
    }

    setShowModal(false);
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
  };

  // Matrix modules
  const modulesList = [
    { name: 'Executive Dashboard & Analytics', key: 'analytics' },
    { name: 'Reservations & Waitlist', key: 'reservations' },
    { name: 'Visual Floor Plan & Table Management', key: 'floor' },
    { name: 'Touch POS & Order Creation', key: 'pos' },
    { name: 'Kitchen Display System (KDS)', key: 'kds' },
    { name: 'Menu Engineering & Recipes', key: 'menu' },
    { name: 'Inventory & Stock Movements', key: 'stock' },
    { name: 'Suppliers & Purchase Orders', key: 'purchasing' },
    { name: 'Customer Directory & Feedback', key: 'customers' },
    { name: 'Staff Attendance & Shift Rosters', key: 'staff' },
    { name: 'Operating Expenses & Disbursements', key: 'expenses' },
    { name: 'Cash Register & Shift Closing', key: 'cash' },
    { name: 'Reports & Tax Audits', key: 'reports' },
    { name: 'System Settings & Audit Logs', key: 'settings' }
  ];

  const permissionMatrix: Record<UserRole, Record<string, boolean>> = {
    'Restaurant Owner': {
      analytics: true,
      reservations: true,
      floor: true,
      pos: true,
      kds: true,
      menu: true,
      stock: true,
      purchasing: true,
      customers: true,
      staff: true,
      expenses: true,
      cash: true,
      reports: true,
      settings: true
    },
    'Manager': {
      analytics: true,
      reservations: true,
      floor: true,
      pos: true,
      kds: true,
      menu: true,
      stock: true,
      purchasing: true,
      customers: true,
      staff: true,
      expenses: true,
      cash: true,
      reports: true,
      settings: false
    },
    'Cashier': {
      analytics: false,
      reservations: true,
      floor: true,
      pos: true,
      kds: false,
      menu: false,
      stock: false,
      purchasing: false,
      customers: true,
      staff: false,
      expenses: false,
      cash: true,
      reports: false,
      settings: false
    },
    'Kitchen Staff': {
      analytics: false,
      reservations: false,
      floor: false,
      pos: false,
      kds: true,
      menu: false,
      stock: true,
      purchasing: false,
      customers: false,
      staff: false,
      expenses: false,
      cash: false,
      reports: false,
      settings: false
    },
    'Host / Waiter': {
      analytics: false,
      reservations: true,
      floor: true,
      pos: true,
      kds: false,
      menu: false,
      stock: false,
      purchasing: false,
      customers: true,
      staff: false,
      expenses: false,
      cash: false,
      reports: false,
      settings: false
    },
    'Accountant': {
      analytics: true,
      reservations: false,
      floor: false,
      pos: false,
      kds: false,
      menu: false,
      stock: true,
      purchasing: true,
      customers: false,
      staff: true,
      expenses: true,
      cash: true,
      reports: true,
      settings: false
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#f5764b]" />
            Users, Staff Accounts & Permissions Matrix
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Access control governance, credential provisioning, and role permission enforcement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'users' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Staff Accounts ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'permissions' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Permission Matrix
            </button>
          </div>

          {activeTab === 'users' && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg text-sm font-medium shadow-sm transition-all shadow-[#e05a2b]/20"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          )}
        </div>
      </div>

      {activeTab === 'users' ? (
        /* Users List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => {
            const isSelf = u.id === currentUser.id;
            const branch = branches.find(b => b.id === u.branchId);

            return (
              <div
                key={u.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isSelf
                    ? 'border-[#f5764b] ring-2 ring-[#f5764b]/20 shadow-xs'
                    : 'border-gray-200/80 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-950 font-bold flex items-center justify-center text-sm">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm leading-tight">{u.name}</h4>
                        <span className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-950 border border-orange-200/60">
                          {u.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-500 py-3 border-y border-gray-100">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" /> {u.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {u.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-gray-400" /> {branch?.name || 'All Branches'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      u.status === 'Active' ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'
                    }`}
                  >
                    {u.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                    {u.status}
                  </span>

                  {isSelf ? (
                    <span className="text-xs font-bold text-[#e05a2b] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Active User
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSwitchUser(u)}
                      className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-orange-50 hover:text-[#e05a2b] text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-1"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Login as User
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Permission Matrix Table */
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#f5764b]" />
              Role Authorization Access Matrix
            </h3>
            <p className="text-xs text-gray-500">
              Enforced across sidebar navigation, direct URLs, and backend state mutations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200/80 text-xs font-semibold text-gray-600 uppercase">
                  <th className="py-3 px-4 min-w-[220px]">Functional Module</th>
                  {roles.map(r => (
                    <th key={r} className="py-3 px-3 text-center min-w-[120px]">
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {modulesList.map(mod => (
                  <tr key={mod.key} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-xs font-medium text-gray-800">
                      {mod.name}
                    </td>
                    {roles.map(r => {
                      const hasAccess = permissionMatrix[r]?.[mod.key] ?? false;

                      return (
                        <td key={r} className="py-3 px-3 text-center">
                          {hasAccess ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-600">
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </span>
                          ) : (
                            <span className="text-gray-300 font-mono">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30  p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xs border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#f5764b]" />
              {editingUser ? 'Edit User Account' : 'Provision New User'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Configure credentials, assigned role, and outlet branch access.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="priya@royalspice.com"
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98111 22334"
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Assigned Role *
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  >
                    {roles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Assigned Branch *
                  </label>
                  <select
                    value={branchId}
                    onChange={e => setBranchId(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Account Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive / Suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white text-xs font-medium rounded-lg shadow-sm"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
