import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  Eye,
  Edit,
  Download,
  Merge,
  Star,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

interface CustomersPageProps {
  onNavigate: (pageId: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ onNavigate }) => {
  const { customers, addCustomer, updateCustomer, orders } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('All');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [tags, setTags] = useState<Customer['tags']>(['Regular']);
  const [preferences, setPreferences] = useState('');
  const [allergyNotes, setAllergyNotes] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(c => {
    if (tagFilter !== 'All' && !c.tags.includes(tagFilter as any)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q));
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setBirthday('');
    setTags(['Regular']);
    setPreferences('');
    setAllergyNotes('');
    setMarketingConsent(true);
    setNotes('');
    setAddModalOpen(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setPhone(cust.phone);
    setEmail(cust.email || '');
    setBirthday(cust.birthday || '');
    setTags(cust.tags);
    setPreferences(cust.dietaryPreferences || '');
    setAllergyNotes(cust.allergyNotes || '');
    setMarketingConsent(cust.marketingConsent);
    setNotes(cust.notes || '');
    setAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        birthday: birthday || undefined,
        tags,
        dietaryPreferences: preferences || undefined,
        allergyNotes: allergyNotes || undefined,
        marketingConsent,
        notes: notes || undefined
      });
    } else {
      addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        birthday: birthday || undefined,
        tags,
        dietaryPreferences: preferences || undefined,
        allergyNotes: allergyNotes || undefined,
        marketingConsent,
        notes: notes || undefined,
        lastVisitDate: new Date().toISOString().substring(0, 10)
      });
    }

    setAddModalOpen(false);
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Customer Name,Phone,Email,Total Visits,Total Spend,Loyalty Points,Last Visit,Tags\n" +
      filteredCustomers.map(c => 
        `"${c.name}","${c.phone}","${c.email || ''}",${c.totalVisits},₹${c.totalSpend},${c.loyaltyPoints},"${c.lastVisitDate}","${c.tags.join(', ')}"`
      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_crm_${new Date().toISOString().substring(0, 10)}.csv`);
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
            Customer Relationship Management (CRM)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Guest hospitality profiles, lifetime spend, visit frequency, loyalty points, and dietary sensitivities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
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
            placeholder="Search customer name, phone, email..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none"
          />
        </div>

        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none"
        >
          <option value="All">All Customer Tags</option>
          <option value="VIP">VIP Patrons</option>
          <option value="Regular">Regular Diners</option>
          <option value="Corporate">Corporate Accounts</option>
          <option value="Weekend Diner">Weekend Diners</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4 text-center">Total Visits</th>
                <th className="py-3 px-4">Total Spend</th>
                <th className="py-3 px-4">Loyalty Points</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map(cust => (
                <tr key={cust.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{cust.name}</td>
                  <td className="py-3 px-4 font-mono text-gray-600">{cust.phone}</td>
                  <td className="py-3 px-4 text-gray-500">{cust.email || '—'}</td>
                  <td className="py-3 px-4 text-center font-bold text-gray-800">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100">{cust.totalVisits}</span>
                  </td>
                  <td className="py-3 px-4 font-black text-gray-900">₹{cust.totalSpend.toFixed(2)}</td>
                  <td className="py-3 px-4 font-bold text-amber-700">{cust.loyaltyPoints} pts</td>
                  <td className="py-3 px-4 text-gray-500">{cust.lastVisitDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {cust.tags.map(t => (
                        <span key={t} className="px-1.5 py-0.2 rounded bg-orange-50 text-orange-950 font-semibold text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setProfileModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(cust)}
                        className="p-1 text-[#f5764b] hover:text-orange-950 rounded"
                        title="Edit Profile"
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

      {/* Add / Edit Customer Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30  overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-base text-gray-900">
                {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3 text-xs">
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
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Birthday</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Dietary Preferences</label>
                <input
                  type="text"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="e.g. Vegetarian, loves butter chicken, likes spicy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Allergy & Dietary Warnings</label>
                <input
                  type="text"
                  value={allergyNotes}
                  onChange={(e) => setAllergyNotes(e.target.value)}
                  placeholder="e.g. Peanut allergy, gluten sensitive"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Internal Staff Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <label className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                />
                <span className="text-gray-700 font-medium">Guest consented to WhatsApp/SMS promotional offers</span>
              </label>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg font-bold shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Profile Details Modal */}
      {profileModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedCustomer.name}</h3>
                <p className="text-xs text-gray-500">{selectedCustomer.phone} • {selectedCustomer.email || 'No email'}</p>
              </div>
              <button onClick={() => setProfileModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Visits</span>
                <span className="text-lg font-bold text-gray-900">{selectedCustomer.totalVisits}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Lifetime Spend</span>
                <span className="text-lg font-bold text-orange-950">₹{selectedCustomer.totalSpend.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Loyalty Points</span>
                <span className="text-lg font-bold text-amber-700">{selectedCustomer.loyaltyPoints}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {selectedCustomer.dietaryPreferences && (
                <p><span className="font-bold text-gray-700">Food Preferences:</span> {selectedCustomer.dietaryPreferences}</p>
              )}
              {selectedCustomer.allergyNotes && (
                <p className="text-red-700 font-bold bg-red-50 p-2 rounded border border-red-200">
                  ⚠️ Allergy Alert: {selectedCustomer.allergyNotes}
                </p>
              )}
              {selectedCustomer.notes && (
                <p className="text-gray-600 italic bg-gray-50 p-2 rounded">
                  Notes: {selectedCustomer.notes}
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold"
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
