import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit,
  ShoppingCart,
  Eye,
  Building2,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';

interface SuppliersPageProps {
  onNavigate: (pageId: string) => void;
  onOpenCreatePOWithSupplier?: (supplierId: string) => void;
}

export const SuppliersPage: React.FC<SuppliersPageProps> = ({ onNavigate }) => {
  const { suppliers, purchaseOrders, addSupplier, updateSupplier } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState<Supplier['paymentTerms']>('Net 30');
  const [categories, setCategories] = useState('Produce, Spices');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const filteredSuppliers = suppliers.filter(s => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q) || s.phone.includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('New Delhi Wholesale Market');
    setTaxId('07AAAAA1234A1Z1');
    setPaymentTerms('Net 30');
    setCategories('Produce & Veg');
    setStatus('Active');
    setModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setContactPerson(sup.contactPerson);
    setPhone(sup.phone);
    setEmail(sup.email);
    setAddress(sup.address);
    setTaxId(sup.taxId || '');
    setPaymentTerms(sup.paymentTerms);
    setCategories(sup.categories.join(', '));
    setStatus(sup.status);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactPerson.trim() || !phone.trim()) return;

    const catsList = categories.split(',').map(c => c.trim()).filter(Boolean);

    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        taxId: taxId.trim() || undefined,
        paymentTerms,
        categories: catsList,
        status
      });
    } else {
      addSupplier({
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        taxId: taxId.trim() || undefined,
        paymentTerms,
        categories: catsList,
        outstandingAmount: 0,
        status
      });
    }

    setModalOpen(false);
  };

  const handleCreatePO = (supplier: Supplier) => {
    localStorage.setItem('rms_preselect_supplier', supplier.id);
    onNavigate('purchase-orders');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Suppliers & Vendors Directory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage procurement partner contacts, GSTIN numbers, and credit payment terms
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
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
            placeholder="Search vendor name or contact..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none"
          />
        </div>

        <span className="text-xs text-gray-500 font-medium">
          {filteredSuppliers.length} registered vendors
        </span>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Supplier / Company</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Communication</th>
                <th className="py-3 px-4">Payment Terms</th>
                <th className="py-3 px-4">Supplied Categories</th>
                <th className="py-3 px-4">Outstanding Payables</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSuppliers.map(sup => (
                <tr key={sup.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    <p>{sup.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">GSTIN: {sup.taxId || 'N/A'}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{sup.contactPerson}</td>
                  <td className="py-3 px-4 text-gray-600">
                    <p className="flex items-center gap-1 font-mono text-[11px]"><Phone className="w-3 h-3 text-gray-400" /> {sup.phone}</p>
                    <p className="flex items-center gap-1 text-[10px] text-gray-400"><Mail className="w-3 h-3 text-gray-400" /> {sup.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-gray-100 font-bold text-gray-700 text-[10px]">
                      {sup.paymentTerms}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {sup.categories.map(c => (
                        <span key={c} className="px-1.5 py-0.2 rounded bg-orange-50 text-orange-950 text-[10px] font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    ₹{sup.outstandingAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                      {sup.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleCreatePO(sup)}
                        className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-950 rounded font-bold text-[10px] flex items-center gap-1"
                        title="Create Purchase Order"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Create PO</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSupplier(sup);
                          setDetailModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded"
                        title="View Supplier Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(sup)}
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. SpiceCraft Organics Ltd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Arun Singhal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
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
                    placeholder="+91 98110 55443"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="orders@vendor.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="COD">Cash On Delivery (COD)</option>
                    <option value="Immediate">Immediate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Supplied Categories (comma separated)</label>
                <input
                  type="text"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  placeholder="Produce & Veg, Spices & Staples"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Warehouse Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Profile Modal with PO History */}
      {detailModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedSupplier.name}</h3>
                <p className="text-xs text-gray-500">{selectedSupplier.contactPerson} • {selectedSupplier.phone}</p>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <p><span className="font-bold text-gray-700">Address:</span> {selectedSupplier.address}</p>
                <p><span className="font-bold text-gray-700">GSTIN:</span> {selectedSupplier.taxId || 'N/A'}</p>
                <p><span className="font-bold text-gray-700">Payment Terms:</span> {selectedSupplier.paymentTerms}</p>
              </div>

              <div>
                <span className="font-bold text-gray-700 uppercase text-[10px] block mb-1">
                  Purchase Order History with this Supplier
                </span>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {purchaseOrders.filter(p => p.supplierId === selectedSupplier.id).map(p => (
                    <div key={p.id} className="p-2 rounded border border-gray-200 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-900">{p.poNumber}</span>
                        <span className="text-gray-400 text-[10px] ml-2">{p.orderDate}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">₹{p.totalAmount.toFixed(2)}</span>
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-gray-100 uppercase">{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDetailModalOpen(false)}
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
