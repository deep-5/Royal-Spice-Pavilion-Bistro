import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Printer,
  Calendar,
  PieChart,
  BarChart3,
  Percent,
  Receipt,
  Scale,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const FinanceOverviewPage: React.FC = () => {
  const { orders, payments, refunds, expenses, suppliers, settings } = useApp();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('month');

  // Compute Financial Aggregates
  const grossSales = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.subtotal, 0);

  const totalDiscounts = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.discountAmount, 0);

  const netSales = grossSales - totalDiscounts;

  const totalTaxCollected = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.taxAmount, 0);

  const totalServiceCharges = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.serviceCharge, 0);

  const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);

  const totalApprovedExpenses = expenses
    .filter(e => e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  // Approximate COGS at 32% industry benchmark for premium dining
  const estimatedCOGS = Math.round(netSales * 0.32);
  const grossProfit = netSales - estimatedCOGS;
  const grossProfitMargin = netSales > 0 ? ((grossProfit / netSales) * 100).toFixed(1) : '0.0';

  const operatingIncome = grossProfit - totalApprovedExpenses;
  const operatingMargin = netSales > 0 ? ((operatingIncome / netSales) * 100).toFixed(1) : '0.0';

  const outstandingPayables = suppliers.reduce((sum, s) => sum + s.outstandingAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const data = [
      ['Metric', 'Amount (INR)'],
      ['Gross F&B Sales', grossSales.toFixed(2)],
      ['Discounts & Promotions', `-${totalDiscounts.toFixed(2)}`],
      ['Net Sales', netSales.toFixed(2)],
      ['Estimated COGS (Raw Ingredients 32%)', `-${estimatedCOGS.toFixed(2)}`],
      ['Gross Profit', grossProfit.toFixed(2)],
      ['Total Operating Expenses', `-${totalApprovedExpenses.toFixed(2)}`],
      ['Net Operating Income (EBITDA)', operatingIncome.toFixed(2)],
      ['GST Collected (CGST + SGST)', totalTaxCollected.toFixed(2)],
      ['Service Charge Collected', totalServiceCharges.toFixed(2)],
      ['Total Refunds Authorized', totalRefunds.toFixed(2)],
      ['Outstanding Supplier Payables', outstandingPayables.toFixed(2)]
    ];

    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Profit_Loss_Statement_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-[#f5764b]" />
            Financial Health & P&L Statement
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Profit and loss breakdown, cost of goods, margins, and statutory GST reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
            {(['today', 'week', 'month', 'quarter'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md font-medium capitalize transition-all ${
                  period === p
                    ? 'bg-white text-gray-900 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-200 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-200 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            Print P&L
          </button>
        </div>
      </div>

      {/* High-level Metric Banners */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wider">
            <span>Net Sales Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{netSales.toLocaleString('en-IN')}</p>
          <p className="text-xs text-green-600 font-medium mt-0.5">Post ₹{totalDiscounts} discounts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wider">
            <span>Gross Operating Margin</span>
            <Percent className="w-4 h-4 text-[#f5764b]" />
          </div>
          <p className="text-2xl font-bold text-[#e05a2b] mt-1">{grossProfitMargin}%</p>
          <p className="text-xs text-gray-400 mt-0.5">₹{grossProfit.toLocaleString('en-IN')} gross profit</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wider">
            <span>Net Operating Income</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className={`text-2xl font-bold mt-1 ${operatingIncome >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            ₹{operatingIncome.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{operatingMargin}% operating EBITDA</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wider">
            <span>Supplier Payables</span>
            <ArrowDownRight className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{outstandingPayables.toLocaleString('en-IN')}</p>
          <p className="text-xs text-amber-600 font-medium mt-0.5">Due across active POs</p>
        </div>
      </div>

      {/* Main P&L Statement Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Executive Profit & Loss Statement</h3>
              <p className="text-xs text-gray-500">Standard accounting breakdown for hospitality operations</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
              Currency: INR (₹)
            </span>
          </div>

          <div className="divide-y divide-gray-100 text-sm">
            {/* Revenue Section */}
            <div className="p-4 bg-gray-50/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">1. Revenue</h4>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-gray-50/40">
              <span className="text-gray-700">Gross Food & Beverage Sales</span>
              <span className="font-semibold text-gray-900 font-mono">₹{grossSales.toFixed(2)}</span>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-gray-50/40">
              <span className="text-gray-500 italic pl-4">Less: Promotional Discounts & Loyalty Offsets</span>
              <span className="font-semibold text-red-600 font-mono">-₹{totalDiscounts.toFixed(2)}</span>
            </div>

            <div className="p-4 flex items-center justify-between bg-orange-50/30 font-semibold">
              <span className="text-gray-900">Net Sales Revenue</span>
              <span className="text-orange-950 font-mono text-base">₹{netSales.toFixed(2)}</span>
            </div>

            {/* Cost of Goods */}
            <div className="p-4 bg-gray-50/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">2. Cost of Sales (COGS)</h4>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-gray-50/40">
              <div>
                <span className="text-gray-700">Raw Food & Beverage Ingredients Consumed</span>
                <span className="block text-xs text-gray-400">Inventory depletions & supplier deliveries (32% benchmark)</span>
              </div>
              <span className="font-semibold text-red-600 font-mono">-₹{estimatedCOGS.toFixed(2)}</span>
            </div>

            <div className="p-4 flex items-center justify-between bg-gray-50 font-bold">
              <span className="text-gray-900">Gross Profit (F&B Margin: {grossProfitMargin}%)</span>
              <span className="text-gray-900 font-mono text-base">₹{grossProfit.toFixed(2)}</span>
            </div>

            {/* Operating Expenses */}
            <div className="p-4 bg-gray-50/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">3. Operating Expenses (OPEX)</h4>
            </div>

            {expenses
              .filter(e => e.status === 'Approved')
              .map(exp => (
                <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-gray-50/40">
                  <div className="pl-4">
                    <span className="text-gray-700 text-xs">{exp.title}</span>
                    <span className="text-[11px] text-gray-400 block">{exp.category} · {exp.vendor}</span>
                  </div>
                  <span className="font-mono text-xs text-gray-700">-₹{exp.amount.toFixed(2)}</span>
                </div>
              ))}

            <div className="p-4 flex items-center justify-between bg-gray-100/70 font-semibold text-xs">
              <span className="text-gray-700 uppercase">Total Operating Disbursements</span>
              <span className="font-mono text-red-700 text-sm">-₹{totalApprovedExpenses.toFixed(2)}</span>
            </div>

            {/* Bottom Line EBITDA */}
            <div className="p-5 flex items-center justify-between bg-[#f5764b] text-white rounded-b-2xl">
              <div>
                <h4 className="text-base font-bold">Net Operating Income (EBITDA)</h4>
                <p className="text-xs text-gray-400">Operating Margin: {operatingMargin}%</p>
              </div>
              <span className="text-2xl font-bold font-mono text-[#f5764b]">
                ₹{operatingIncome.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Tax Reconciliation & Payment Methods */}
        <div className="lg:col-span-4 space-y-6">
          {/* Statutory Tax Box */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#f5764b]" />
              Statutory Tax Collection (GST)
            </h3>
            <p className="text-xs text-gray-500">
              F&B restaurant services GST liability breakdown (5% aggregate rate)
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-700">Central GST (CGST 2.5%)</span>
                  <span className="block text-[11px] text-gray-400">Deposited to Central Govt</span>
                </div>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  ₹{(totalTaxCollected / 2).toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-700">State GST (SGST 2.5%)</span>
                  <span className="block text-[11px] text-gray-400">Deposited to State Govt</span>
                </div>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  ₹{(totalTaxCollected / 2).toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-orange-50/70 border border-orange-200/60 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-orange-950">Total GST Liability</span>
                <span className="font-mono font-bold text-orange-950 text-base">
                  ₹{totalTaxCollected.toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-700">Service Charges Collected</span>
                  <span className="block text-[11px] text-gray-400">Staff welfare pool</span>
                </div>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  ₹{totalServiceCharges.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Refund Risk Indicator */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900">Credit Adjustments & Refunds</h3>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Total Reversals Authorized:</span>
              <span className="font-mono font-bold text-red-600">₹{totalRefunds.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${Math.min(100, (totalRefunds / (grossSales || 1)) * 100 * 5)}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500">
              Refunds represent {grossSales > 0 ? ((totalRefunds / grossSales) * 100).toFixed(2) : 0}% of gross billing volume.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
