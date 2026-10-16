import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RotateCcw,
  Search,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
  Receipt
} from 'lucide-react';

export const RefundsPage: React.FC = () => {
  const { refunds, payments, orders } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Pending'>('All');

  const filteredRefunds = refunds.filter(r => {
    const matchesSearch =
      r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.authorizedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRefundAmount = refunds.reduce((sum, r) => sum + r.amount, 0);
  const totalSettledPayments = payments.filter(p => p.status === 'Success').reduce((sum, p) => sum + p.amount, 0);
  const refundRate = totalSettledPayments > 0 ? ((totalRefundAmount / totalSettledPayments) * 100).toFixed(2) : '0.00';
  const averageRefund = refunds.length > 0 ? (totalRefundAmount / refunds.length).toFixed(2) : '0.00';

  const handleExportCSV = () => {
    const headers = ['Refund ID,Order #,Amount,Reason,Authorized By,Status,Date\n'];
    const rows = filteredRefunds.map(r =>
      `"${r.id}","${r.orderNumber}",${r.amount},"${r.reason}","${r.authorizedBy}","${r.status}","${r.createdAt}"`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Refunds_Log_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <RotateCcw className="w-7 h-7 text-red-600" />
            Refunds & Credit Adjustments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Reversals, guest compensation logs, and authorized credit vouchers
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200 shadow-2xs transition-colors"
        >
          <Download className="w-4 h-4 text-gray-500" />
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Refunded</p>
          <p className="text-2xl font-bold text-red-600 mt-1">₹{totalRefundAmount.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{refunds.length} credit reversals</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Rate</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{refundRate}%</p>
          <p className="text-xs text-gray-400 mt-0.5">Of gross sales settled</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average Reversal</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">₹{averageRefund}</p>
          <p className="text-xs text-gray-400 mt-0.5">Per approved incident</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Compliance</p>
          <p className="text-2xl font-bold text-green-600 mt-1">100%</p>
          <p className="text-xs text-green-600/80 mt-0.5">Manager sign-off recorded</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -trangray-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search order number, reason, authorized manager..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-red-500"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200/80 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">Refund ID</th>
                <th className="py-3 px-4">Order Link</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Authorized By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No refunds recorded in this period.
                  </td>
                </tr>
              ) : (
                filteredRefunds.map(refund => (
                  <tr key={refund.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-gray-800">
                        {refund.id}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#e05a2b] text-xs">
                        {refund.orderNumber}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-red-600 text-sm">
                        ₹{refund.amount.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-600 max-w-xs truncate">
                      {refund.reason}
                    </td>

                    <td className="py-3 px-4 text-xs font-medium text-gray-700">
                      {refund.authorizedBy}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                          refund.status === 'Completed'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {refund.status === 'Completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        {refund.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-500">
                      {refund.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
