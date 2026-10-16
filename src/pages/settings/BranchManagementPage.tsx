import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Branch } from '../../types';
import {
  MapPin,
  Plus,
  Edit2,
  Clock,
  Phone,
  Building,
  CheckCircle2,
  Check,
  Globe,
  Sparkles
} from 'lucide-react';

export const BranchManagementPage: React.FC = () => {
  const { branches, currentBranchId, setCurrentBranchId, addBranch, updateBranch } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [operatingHours, setOperatingHours] = useState('11:00 AM - 11:30 PM');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [status, setStatus] = useState<Branch['status']>('Active');

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setName('');
    setCode('');
    setAddress('');
    setCity('');
    setPhone('');
    setOperatingHours('11:00 AM - 11:30 PM');
    setTimezone('Asia/Kolkata');
    setStatus('Active');
    setShowModal(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setName(branch.name);
    setCode(branch.code);
    setAddress(branch.address);
    setCity(branch.city);
    setPhone(branch.phone);
    setOperatingHours(branch.operatingHours);
    setTimezone(branch.timezone);
    setStatus(branch.status);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingBranch) {
      updateBranch({
        ...editingBranch,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address.trim(),
        city: city.trim(),
        phone: phone.trim(),
        operatingHours,
        timezone,
        status
      });
    } else {
      addBranch({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address.trim(),
        city: city.trim(),
        phone: phone.trim(),
        operatingHours,
        timezone,
        status,
        isDefault: branches.length === 0
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Building className="w-7 h-7 text-[#f5764b]" />
            Branch & Location Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure multi-location outlets, dining capacity, local operating hours, and active branch context
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg text-sm font-medium shadow-sm transition-all shadow-[#e05a2b]/20"
        >
          <Plus className="w-4 h-4" />
          Add New Branch
        </button>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map(branch => {
          const isCurrentActive = branch.id === currentBranchId;

          return (
            <div
              key={branch.id}
              className={`bg-white rounded-2xl border p-6 shadow-xs transition-all relative ${
                isCurrentActive
                  ? 'border-[#f5764b] ring-2 ring-[#f5764b]/20 shadow-xs'
                  : 'border-gray-200/80 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{branch.name}</h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold">
                      {branch.code}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {branch.address}, {branch.city}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenEdit(branch)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Edit Branch"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 py-3 border-y border-gray-100 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone:
                  </span>
                  <span className="font-medium text-gray-800">{branch.phone}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400" /> Hours:
                  </span>
                  <span className="font-medium text-gray-800">{branch.operatingHours}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Globe className="w-3.5 h-3.5 text-gray-400" /> Timezone:
                  </span>
                  <span className="font-medium text-gray-800">{branch.timezone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    branch.status === 'Active'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {branch.status === 'Active' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {branch.status}
                </span>

                {isCurrentActive ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-950 text-xs font-bold border border-orange-200">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Currently Active
                  </span>
                ) : (
                  <button
                    onClick={() => setCurrentBranchId(branch.id)}
                    className="px-3.5 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200 shadow-2xs transition-colors"
                  >
                    Switch to this Branch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30  p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xs border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Building className="w-5 h-5 text-[#f5764b]" />
              {editingBranch ? 'Edit Branch Location' : 'Add New Restaurant Branch'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Configure outlet details, billing prefix, and operational hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Connaught Place Flagship"
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Branch Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="e.g. DEL-01"
                    className="w-full text-sm font-mono uppercase px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. Block B, Inner Circle"
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    City / State *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 11 4152 8800"
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={e => setOperatingHours(e.target.value)}
                    placeholder="11:00 AM - 11:30 PM"
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="Asia/Dubai">Asia/Dubai</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
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
                  {editingBranch ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
