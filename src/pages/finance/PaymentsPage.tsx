import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Payment } from '../../types';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Printer,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  ArrowUpRight,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { ReceiptModal } from '../../components/common/ReceiptModal';

export const PaymentsPage: React.FC = () => {
  const { payments, orders, processRefund, hasPermission, settings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Refund modal state
  const [refundPayment, setRefundPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);

  // Receipt Modal state
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  const canRefund = hasPermission('Payments', 'refund');

  // Filter payments
  const filteredPayments = payments.filter(p => {
    const matchesSearch =
      p.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cashierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === 'All' || p.method === methodFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  // Calculate Metrics
  const totalVolume = payments
    .filter(p => p.status === 'Success')
    .reduce((sum, p) => sum + p.amount, 0);

  const cashVolume = payments
    .filter(p => p.status === 'Success' && p.method === 'Cash')
    .reduce((sum, p) => sum + p.amount, 0);

  const cardVolume = payments
    .filter(p => p.status === 'Success' && p.method === 'Card')
    .reduce((sum, p) => sum + p.amount, 0);

  const upiVolume = payments
    .filter(p => p.status === 'Success' && p.method === 'UPI')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleOpenRefund = (payment: Payment) => {
    setRefundPayment(payment);
    setRefundAmount(payment.amount);
    setRefundReason('');
  };

  const handleConfirmRefund = () => {
    if (!refundPayment || !refundReason.trim()) return;

    const linkedOrder = orders.find(o => o.id === refundPayment.orderId);

    processRefund({
      paymentId: refundPayment.id,
      orderId: refundPayment.orderId,
      orderNumber: linkedOrder?.orderNumber || refundPayment.orderId,
      amount: refundAmount,
      reason: refundReason.trim(),
      authorizedBy: 'Manager',
      status: 'Completed'
    });

    setRefundPayment(null);
  };

  const handleExportCSV = () => {
    const headers = ['Reference ID,Order ID,Amount,Method,Status,Cashier,Timestamp\n'];
    const rows = filteredPayments.map(p =>
      `"${p.referenceId}","${p.orderId}",${p.amount},"${p.method}","${p.status}","${p.cashierName}","${p.createdAt}"`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payments_Export_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-[#f5764b]" />
            Payments & Transactions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Settled bills, multi-tender transactions, digital UPI records, and gateway logs
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
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Settled Volume</p>
          <p className="text-2xl font-bold text-[#e05a2b] mt-1">₹{totalVolume.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mt-0.5">{payments.filter(p => p.status === 'Success').length} successful txns</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">UPI / QR Collections</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">₹{upiVolume.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mt-0.5">{((upiVolume / (totalVolume || 1)) * 100).toFixed(0)}% of total</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Card Terminal (POS)</p>
          <p className="text-2xl font-bold text-[#e05a2b] mt-1">₹{cardVolume.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mt-0.5">{((cardVolume / (totalVolume || 1)) * 100).toFixed(0)}% of total</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Register</p>
          <p className="text-2xl font-bold text-green-700 mt-1">₹{cashVolume.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mt-0.5">{((cashVolume / (totalVolume || 1)) * 100).toFixed(0)}% of total</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -trangray-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search reference ID, order ID, cashier..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
          >
            <option value="All">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI / QR</option>
            <option value="Split">Split</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
          >
            <option value="All">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200/80 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">Txn / Ref</th>
                <th className="py-3 px-4">Order Link</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No payment transactions found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => {
                  const linkedOrder = orders.find(o => o.id === payment.orderId);

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-medium text-gray-800 text-xs">
                          {payment.referenceId}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#e05a2b] text-xs">
                          {linkedOrder?.orderNumber || payment.orderId}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900">
                          ₹{payment.amount.toFixed(2)}
                        </span>
                        {payment.changeDue && payment.changeDue > 0 ? (
                          <span className="block text-[11px] text-gray-400">
                            Change: ₹{payment.changeDue.toFixed(2)}
                          </span>
                        ) : null}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            payment.method === 'UPI'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                              : payment.method === 'Card'
                              ? 'bg-orange-50 text-[#e05a2b] border border-orange-200/60'
                              : payment.method === 'Cash'
                              ? 'bg-green-50 text-green-700 border border-green-200/60'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {payment.method}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                            payment.status === 'Success'
                              ? 'bg-green-50 text-green-700'
                              : payment.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {payment.status === 'Success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {payment.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                          {payment.status === 'Failed' && <XCircle className="w-3.5 h-3.5" />}
                          {payment.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-600">
                        {payment.cashierName}
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-500">
                        {payment.createdAt}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print Receipt Action */}
                          <button
                            onClick={() => setReceiptPayment(payment)}
                            title="Print Tax Receipt"
                            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>

                          {/* Initiate Refund Action */}
                          {payment.status === 'Success' && canRefund && (
                            <button
                              onClick={() => handleOpenRefund(payment)}
                              title="Process Refund"
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
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

      {/* Refund Modal */}
      {refundPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30  p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xs border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-red-600" />
              Process Refund
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Original Payment: <strong>{refundPayment.referenceId}</strong> (Max refundable: ₹{refundPayment.amount.toFixed(2)})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Refund Amount (₹) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={refundPayment.amount}
                  value={refundAmount}
                  onChange={e => setRefundAmount(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Refund * (Customer issue, spilled item, billing correction)
                </label>
                <textarea
                  rows={3}
                  required
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  placeholder="Explain why this refund is being authorized..."
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                ⚠️ Processing a refund will record an audit trail entry and debit the daily sales tally.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRefundPayment(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!refundReason.trim() || refundAmount <= 0}
                  onClick={handleConfirmRefund}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow-sm"
                >
                  Authorize Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptPayment && (
        <ReceiptModal
          isOpen={!!receiptPayment}
          onClose={() => setReceiptPayment(null)}
          order={orders.find(o => o.id === receiptPayment.orderId) || orders[0]}
          payment={receiptPayment}
        />
      )}
    </div>
  );
};
