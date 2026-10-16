import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CashClosing } from '../../types';
import {
  Coins,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  History,
  Printer,
  Calendar,
  UserCheck,
  ArrowRight,
  Sparkles,
  Check,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const CashDrawerPage: React.FC = () => {
  const {
    cashClosings,
    recordCashClosing,
    approveCashClosing,
    payments,
    refunds,
    currentUser,
    currentBranchId,
    hasPermission
  } = useApp();

  const [activeTab, setActiveTab] = useState<'closing' | 'history'>('closing');
  const [selectedShift, setSelectedShift] = useState<'Morning Shift' | 'Evening Shift' | 'Full Day'>('Evening Shift');
  const [openingFloat, setOpeningFloat] = useState<number>(5000);
  const [cashIn, setCashIn] = useState<number>(0);
  const [cashOut, setCashOut] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState('');

  // Currency Denominations State
  const [denominations, setDenominations] = useState({
    d2000: 0,
    d500: 18,
    d200: 12,
    d100: 25,
    d50: 14,
    d20: 20,
    d10: 30,
    coins: 150
  });

  // Calculate live cash sales from current payments
  const liveCashSales = payments
    .filter(p => p.status === 'Success' && p.method === 'Cash')
    .reduce((sum, p) => sum + p.amount, 0);

  // Live cash refunds
  const liveCashRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);

  // Expected Closing Cash
  const expectedCash = openingFloat + liveCashSales - liveCashRefunds + cashIn - cashOut;

  // Counted Cash from Denominations
  const countedCash =
    denominations.d2000 * 2000 +
    denominations.d500 * 500 +
    denominations.d200 * 200 +
    denominations.d100 * 100 +
    denominations.d50 * 50 +
    denominations.d20 * 20 +
    denominations.d10 * 10 +
    denominations.coins;

  const variance = countedCash - expectedCash;
  const isBalanced = variance === 0;

  const handleDenominationChange = (key: keyof typeof denominations, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setDenominations(prev => ({ ...prev, [key]: num }));
  };

  const handleSubmitClosing = (e: React.FormEvent) => {
    e.preventDefault();

    recordCashClosing({
      date: new Date().toISOString().substring(0, 10),
      shift: selectedShift,
      cashierName: currentUser.name,
      branchId: currentBranchId,
      openingCash: openingFloat,
      cashSales: liveCashSales,
      cashRefunds: liveCashRefunds,
      cashIn,
      cashOut,
      expectedClosingCash: expectedCash,
      countedCash,
      variance,
      denominations,
      notes: closingNotes.trim()
    });

    setClosingNotes('');
    setActiveTab('history');
  };

  const canApprove = hasPermission('Cash Drawer', 'approve') || currentUser.role === 'Restaurant Owner' || currentUser.role === 'Manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Coins className="w-7 h-7 text-[#f5764b]" />
            Cash Drawer & Shift Closing
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Physical float reconciliation, denomination counting, and cash variance audit
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('closing')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'closing'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Perform Shift Count
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Closing History ({cashClosings.length})
          </button>
        </div>
      </div>

      {activeTab === 'closing' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Register Calculation */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#f5764b]" />
                System Cash Calculation
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Shift Selection
                  </label>
                  <select
                    value={selectedShift}
                    onChange={e => setSelectedShift(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-[#f5764b] font-medium"
                  >
                    <option value="Morning Shift">Morning Shift (10:00 AM - 04:00 PM)</option>
                    <option value="Evening Shift">Evening Shift (05:00 PM - 11:30 PM)</option>
                    <option value="Full Day">Full Day Register Closing</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Opening Float (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={openingFloat}
                      onChange={e => setOpeningFloat(Number(e.target.value) || 0)}
                      className="w-full text-sm font-semibold px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Cash In / Float Top-up (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={cashIn}
                      onChange={e => setCashIn(Number(e.target.value) || 0)}
                      className="w-full text-sm font-semibold px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Cash Sales (Recorded)
                    </label>
                    <div className="w-full text-sm font-bold px-3 py-2 bg-green-50 text-green-800 border border-green-200/60 rounded-lg">
                      + ₹{liveCashSales.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Cash Out / Petty Cash (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={cashOut}
                      onChange={e => setCashOut(Number(e.target.value) || 0)}
                      className="w-full text-sm font-semibold px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                    />
                  </div>
                </div>

                {liveCashRefunds > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Cash Refunds Debited
                    </label>
                    <div className="w-full text-sm font-bold px-3 py-2 bg-red-50 text-red-800 border border-red-200/60 rounded-lg">
                      - ₹{liveCashRefunds.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Expected Total Box */}
              <div className="p-4 rounded-xl bg-[#f5764b] text-white space-y-1">
                <span className="text-xs uppercase font-medium tracking-wider text-gray-400">
                  Calculated Expected Cash
                </span>
                <p className="text-2xl font-bold font-mono">₹{expectedCash.toFixed(2)}</p>
                <p className="text-[11px] text-gray-400">
                  (Opening ₹{openingFloat} + Sales ₹{liveCashSales.toFixed(0)} - Refunds ₹{liveCashRefunds.toFixed(0)} + In ₹{cashIn} - Out ₹{cashOut})
                </p>
              </div>
            </div>

            {/* Reconciliation Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isBalanced
                ? 'bg-green-50/60 border-green-200'
                : variance > 0
                ? 'bg-orange-50/60 border-orange-200'
                : 'bg-red-50/60 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Reconciliation Variance
                  </span>
                  <p className={`text-2xl font-bold font-mono mt-0.5 ${
                    isBalanced ? 'text-green-700' : variance > 0 ? 'text-[#e05a2b]' : 'text-red-700'
                  }`}>
                    {variance >= 0 ? `+₹${variance.toFixed(2)}` : `-₹${Math.abs(variance).toFixed(2)}`}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isBalanced ? 'bg-green-100 text-green-700' : variance > 0 ? 'bg-orange-100 text-[#e05a2b]' : 'bg-red-100 text-red-700'
                }`}>
                  {isBalanced ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2 font-medium">
                {isBalanced
                  ? '✓ Register is perfectly balanced! No shortage or surplus detected.'
                  : variance > 0
                  ? `Register is OVER by ₹${variance.toFixed(2)}. Requires explanation in shift notes.`
                  : `Register is SHORT by ₹${Math.abs(variance).toFixed(2)}. Requires explanation and manager authorization.`}
              </p>
            </div>
          </div>

          {/* Right Column: Denomination Breakdown & Submit */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmitClosing} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Physical Denomination Count</h3>
                  <p className="text-xs text-gray-500">Count physical bills and coins inside the cash drawer.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 uppercase">Total Counted</span>
                  <p className="text-xl font-bold text-[#e05a2b] font-mono">₹{countedCash.toFixed(2)}</p>
                </div>
              </div>

              {/* Denomination Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: '₹2000 Note', key: 'd2000', mult: 2000 },
                  { label: '₹500 Note', key: 'd500', mult: 500 },
                  { label: '₹200 Note', key: 'd200', mult: 200 },
                  { label: '₹100 Note', key: 'd100', mult: 100 },
                  { label: '₹50 Note', key: 'd50', mult: 50 },
                  { label: '₹20 Note', key: 'd20', mult: 20 },
                  { label: '₹10 Note', key: 'd10', mult: 10 },
                  { label: 'Coins (Total ₹)', key: 'coins', mult: 1 }
                ].map(item => {
                  const countVal = denominations[item.key as keyof typeof denominations];
                  const subTotal = countVal * item.mult;

                  return (
                    <div key={item.key} className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span>{item.label}</span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={countVal || ''}
                        onChange={e => handleDenominationChange(item.key as keyof typeof denominations, e.target.value)}
                        placeholder="0"
                        className="w-full text-sm font-semibold px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                      />
                      <span className="block text-right text-[11px] font-mono text-gray-500 mt-1">
                        = ₹{subTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cashier Closing Remarks / Variance Justification
                </label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={e => setClosingNotes(e.target.value)}
                  placeholder="Note any uncollected tips, coin shortage, or unusual register events..."
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                />
              </div>

              {/* Sign-off Banner */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#f5764b]" />
                  Cashier on duty: <strong className="text-gray-900">{currentUser.name}</strong> ({currentUser.role})
                </span>
                <span>Date: {new Date().toISOString().substring(0, 10)}</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-xl text-sm font-semibold shadow-sm transition-all shadow-[#e05a2b]/20 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Submit Shift Closing Report
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200/80 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Historical Shift Closing Statements</h3>
            <span className="text-xs text-gray-500">{cashClosings.length} recorded closes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200/80 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Closing #</th>
                  <th className="py-3 px-4">Shift & Cashier</th>
                  <th className="py-3 px-4">Expected Cash</th>
                  <th className="py-3 px-4">Counted Cash</th>
                  <th className="py-3 px-4">Variance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cashClosings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      No shift closing reports submitted yet.
                    </td>
                  </tr>
                ) : (
                  cashClosings.map(closing => (
                    <tr key={closing.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-gray-800">
                          {closing.closingNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900 text-xs">{closing.shift}</p>
                        <p className="text-[11px] text-gray-500">By {closing.cashierName}</p>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-gray-700">
                        ₹{closing.expectedClosingCash.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        ₹{closing.countedCash.toFixed(2)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-mono text-xs font-bold ${
                            closing.variance === 0
                              ? 'text-green-700'
                              : closing.variance > 0
                              ? 'text-[#e05a2b]'
                              : 'text-red-700'
                          }`}
                        >
                          {closing.variance >= 0 ? `+₹${closing.variance.toFixed(2)}` : `-₹${Math.abs(closing.variance).toFixed(2)}`}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium ${
                            closing.status === 'Approved'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {closing.status === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {closing.status}
                        </span>
                        {closing.approvedBy && (
                          <span className="block text-[11px] text-gray-400 mt-0.5">
                            by {closing.approvedBy}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-500">
                        {closing.date}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {closing.status === 'Pending Approval' && canApprove ? (
                          <button
                            onClick={() => approveCashClosing(closing.id)}
                            className="px-3 py-1 bg-orange-50 text-[#e05a2b] hover:bg-orange-100 rounded-lg text-xs font-semibold border border-orange-200 transition-colors"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => window.print()}
                            title="Print Closing Sheet"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
