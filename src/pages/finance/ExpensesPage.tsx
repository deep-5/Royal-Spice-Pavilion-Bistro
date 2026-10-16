import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';
import {
  DollarSign,
  Plus,
  Filter,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Building,
  Tag,
  Paperclip,
  Check,
  X
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { expenses, addExpense, approveExpense, rejectExpense, hasPermission, currentUser, currentBranchId } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Food Supplies');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [amount, setAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('Bank Transfer');
  const [notes, setNotes] = useState('');
  const [receiptSimulated, setReceiptSimulated] = useState(false);

  // Reject Modal
  const [rejectExpenseId, setRejectExpenseId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const canApprove = hasPermission('Expenses', 'approve');

  const categories: Expense['category'][] = [
    'Rent & Lease',
    'Food Supplies',
    'Utilities & Power',
    'Repairs & Maintenance',
    'Salaries & Wages',
    'Marketing',
    'Transport',
    'Other'
  ];

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch =
      e.expenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vendor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = categoryFilter === 'All' || e.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const totalExpenseVal = expenses
    .filter(e => e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingVal = expenses
    .filter(e => e.status === 'Pending Approval')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !vendor.trim() || amount <= 0) return;

    addExpense({
      title: title.trim(),
      category,
      vendor: vendor.trim(),
      date,
      amount,
      taxAmount,
      paymentMethod,
      branchId: currentBranchId,
      receiptUrl: receiptSimulated ? '/invoices/sample_receipt.pdf' : undefined,
      notes: notes.trim(),
      submittedBy: currentUser.name
    });

    // Reset
    setTitle('');
    setVendor('');
    setAmount(0);
    setTaxAmount(0);
    setNotes('');
    setReceiptSimulated(false);
    setShowAddModal(false);
  };

  const handleConfirmReject = () => {
    if (!rejectExpenseId || !rejectionReason.trim()) return;
    rejectExpense(rejectExpenseId, rejectionReason.trim());
    setRejectExpenseId(null);
    setRejectionReason('');
  };

  const handleExportCSV = () => {
    const headers = ['Expense #,Title,Category,Vendor,Amount,Tax,Method,Date,Status,Submitted By,Approved By\n'];
    const rows = filteredExpenses.map(e =>
      `"${e.expenseNumber}","${e.title}","${e.category}","${e.vendor}",${e.amount},${e.taxAmount},"${e.paymentMethod}","${e.date}","${e.status}","${e.submittedBy}","${e.approvedBy || ''}"`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Expenses_Log_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-7 h-7 text-[#f5764b]" />
            Operating Expenses & Outlays
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Vendor vouchers, utility bills, maintenance disbursements, and manager approval queues
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500" />
            Export CSV
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg text-sm font-medium shadow-sm transition-all shadow-[#e05a2b]/20"
          >
            <Plus className="w-4 h-4" />
            Record Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved Expenses</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalExpenseVal.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mt-0.5">{expenses.filter(e => e.status === 'Approved').length} verified vouchers</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">₹{pendingVal.toLocaleString('en-IN')}</p>
          <p className="text-xs text-amber-600/80 mt-0.5">{expenses.filter(e => e.status === 'Pending Approval').length} awaiting audit</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Claims</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{expenses.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Across all branch categories</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Rate</p>
          <p className="text-2xl font-bold text-[#f5764b] mt-1">
            {expenses.length > 0
              ? `${Math.round((expenses.filter(e => e.status === 'Approved').length / expenses.length) * 100)}%`
              : '0%'}
          </p>
          <p className="text-xs text-[#f5764b]/80 mt-0.5">Fiscal governance standard</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -trangray-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search expense #, title, vendor..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200/80 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">Voucher #</th>
                <th className="py-3 px-4">Title & Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No expense vouchers found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-gray-800">
                        {exp.expenseNumber}
                      </span>
                      {exp.receiptUrl && (
                        <span className="flex items-center gap-1 text-[11px] text-[#f5764b] mt-0.5">
                          <Paperclip className="w-3 h-3" />
                          Receipt Attached
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900 text-sm leading-snug">{exp.title}</p>
                      <p className="text-xs text-gray-500">Vendor: {exp.vendor}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        <Tag className="w-3 h-3 text-gray-400" />
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900">
                        ₹{exp.amount.toFixed(2)}
                      </span>
                      {exp.taxAmount > 0 && (
                        <span className="block text-[11px] text-gray-400">
                          Incl. ₹{exp.taxAmount.toFixed(2)} GST
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-600">
                      {exp.paymentMethod}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium ${
                          exp.status === 'Approved'
                            ? 'bg-green-50 text-green-700 border border-green-200/60'
                            : exp.status === 'Pending Approval'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-red-50 text-red-700 border border-red-200/60'
                        }`}
                      >
                        {exp.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {exp.status === 'Pending Approval' && <Clock className="w-3.5 h-3.5" />}
                        {exp.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                        {exp.status}
                      </span>
                      {exp.approvedBy && (
                        <span className="block text-[11px] text-gray-400 mt-0.5">
                          by {exp.approvedBy}
                        </span>
                      )}
                      {exp.rejectionReason && (
                        <span className="block text-[11px] text-red-600 mt-0.5">
                          {exp.rejectionReason}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {exp.date}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {exp.status === 'Pending Approval' && canApprove ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => approveExpense(exp.id)}
                            title="Approve Expense"
                            className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                          >
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={() => {
                              setRejectExpenseId(exp.id);
                              setRejectionReason('');
                            }}
                            title="Reject Expense"
                            className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                          >
                            <X className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30  p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xs border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#f5764b]" />
              Record New Expense Voucher
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter expense details and bill voucher for manager sign-off.
            </p>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Expense Title / Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Commercial Gas Cylinder Refill (5 units)"
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Vendor / Merchant *
                  </label>
                  <input
                    type="text"
                    required
                    value={vendor}
                    onChange={e => setVendor(e.target.value)}
                    placeholder="e.g. Indane Commercial Gas"
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Total Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={amount || ''}
                    onChange={e => setAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tax / GST (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={taxAmount || ''}
                    onChange={e => setTaxAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Voucher Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="Cash">Cash (Petty Cash)</option>
                    <option value="Corporate Card">Corporate Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Receipt Attachment
                  </label>
                  <button
                    type="button"
                    onClick={() => setReceiptSimulated(!receiptSimulated)}
                    className={`w-full py-2 px-3 text-xs rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      receiptSimulated
                        ? 'bg-orange-50 text-[#e05a2b] border-orange-300'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    {receiptSimulated ? 'Receipt Attached (sample.pdf)' : 'Upload Receipt Scan'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Invoice number, payment reference, or approval justification..."
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white text-xs font-medium rounded-lg shadow-sm"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectExpenseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30  p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xs border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Reject Expense Voucher
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Specify a justification for rejecting this expense claim.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. Duplicate claim or missing GST invoice..."
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRejectExpenseId(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!rejectionReason.trim()}
                  onClick={handleConfirmReject}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
