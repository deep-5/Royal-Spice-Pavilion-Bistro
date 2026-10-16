import React, { useState } from 'react';
import {
  TrendingUp,
  Download,
  Printer,
  RotateCcw,
  BarChart2,
  PieChart,
  DollarSign,
  Receipt,
  Percent,
  Calendar,
  Filter,
  CreditCard,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SalesAnalyticsProps {
  onNavigate: (pageId: string) => void;
}

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ onNavigate }) => {
  const { orders, refunds, payments, menuCategories, menuItems, currentBranch, dateFilter, setDateFilter } = useApp();

  const [channelFilter, setChannelFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (channelFilter !== 'All' && o.source !== channelFilter) return false;
    if (methodFilter !== 'All' && o.paymentMethod !== methodFilter) return false;
    return true;
  });

  const grossSales = filteredOrders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.totalAmount : 0), 0);
  const totalDiscounts = filteredOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
  const totalTax = filteredOrders.reduce((sum, o) => sum + (o.taxAmount || 0), 0);
  const totalServiceCharge = filteredOrders.reduce((sum, o) => sum + (o.serviceCharge || 0), 0);
  const totalRefundAmount = refunds.reduce((sum, r) => sum + r.amount, 0);
  const netSales = Math.max(0, grossSales - totalRefundAmount);
  const totalOrdersCount = filteredOrders.length;
  const aov = totalOrdersCount > 0 ? (grossSales / totalOrdersCount) : 0;

  // Category breakdown
  const categorySalesMap: Record<string, number> = {};
  filteredOrders.forEach(o => {
    o.items.forEach(item => {
      const match = menuItems.find(m => m.id === item.menuItemId);
      const cat = menuCategories.find(c => c.id === match?.categoryId)?.name || 'Other';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.totalPrice;
    });
  });
  const categorySales = Object.entries(categorySalesMap).map(([name, amount]) => ({ name, amount }));

  // Payment method breakdown
  const paymentMethodMap: Record<string, number> = {
    UPI: 0,
    Card: 0,
    Cash: 0,
    Split: 0
  };
  payments.forEach(p => {
    if (paymentMethodMap[p.method] !== undefined) {
      paymentMethodMap[p.method] += p.amount;
    }
  });

  const totalPaymentsSum = Object.values(paymentMethodMap).reduce((a, b) => a + b, 0) || 1;
  const upiPct = Math.round((paymentMethodMap.UPI / totalPaymentsSum) * 100);
  const cardPct = Math.round((paymentMethodMap.Card / totalPaymentsSum) * 100);
  const cashPct = Math.round((paymentMethodMap.Cash / totalPaymentsSum) * 100);
  const splitPct = Math.max(0, 100 - upiPct - cardPct - cashPct);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Financial Metric,Amount (INR)\n" +
      `Gross Sales,₹${grossSales.toFixed(2)}\n` +
      `Total Discounts,₹${totalDiscounts.toFixed(2)}\n` +
      `Total Refunds,₹${totalRefundAmount.toFixed(2)}\n` +
      `Net Sales,₹${netSales.toFixed(2)}\n` +
      `CGST Collected,₹${(totalTax / 2).toFixed(2)}\n` +
      `SGST Collected,₹${(totalTax / 2).toFixed(2)}\n` +
      `Service Charges,₹${totalServiceCharge.toFixed(2)}\n` +
      `Total Orders,${totalOrdersCount}\n` +
      `Average Order Value,₹${aov.toFixed(2)}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_analytics_${dateFilter.toLowerCase().replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-7 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Sales Analytics & Audit
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-[#f5764b] border border-orange-200">
              Tax Compliant
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reconciled sales, CGST/SGST tax liabilities, and payment settlement audit
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gray-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon (Moniex Modern Card) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] no-print">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
          <Filter className="w-4 h-4 text-[#f5764b]" />
          <span className="text-xs font-bold text-gray-900">Analytics Filter Matrix</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Time Period</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 font-bold focus:ring-1 focus:ring-[#f5764b]"
            >
              <option value="Today">Today (15 Oct 2026)</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Order Channel</label>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 font-bold focus:ring-1 focus:ring-[#f5764b]"
            >
              <option value="All">All Channels</option>
              <option value="Dine-in">Dine-in Only</option>
              <option value="QR Order">QR Ordering Only</option>
              <option value="Takeaway">Takeaway Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 font-bold focus:ring-1 focus:ring-[#f5764b]"
            >
              <option value="All">All Payment Methods</option>
              <option value="UPI">UPI Digital (QR/VPA)</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Cash">Cash Currency</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Menu Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 font-bold focus:ring-1 focus:ring-[#f5764b]"
            >
              <option value="All">All Categories</option>
              {menuCategories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main KPI Bar (Modern 6-Tile Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 print-area">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Gross Sales</p>
          <p className="text-xl font-extrabold text-gray-900 mt-1">₹{grossSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">Total collected</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Net Sales</p>
          <p className="text-xl font-extrabold text-[#f5764b] mt-1">₹{netSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">Net of refunds</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Discounts</p>
          <p className="text-xl font-extrabold text-red-600 mt-1">₹{totalDiscounts.toFixed(2)}</p>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">Promos applied</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Refunds</p>
          <p className="text-xl font-extrabold text-red-600 mt-1">₹{totalRefundAmount.toFixed(2)}</p>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">{refunds.length} logged</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">GST (5%)</p>
          <p className="text-xl font-extrabold text-gray-900 mt-1">₹{totalTax.toFixed(2)}</p>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">CGST + SGST</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Average Check</p>
          <p className="text-xl font-extrabold text-gray-900 mt-1">₹{aov.toFixed(2)}</p>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">{totalOrdersCount} checks</p>
        </div>
      </div>

      {/* Breakdowns Grid with Moniex Donut Chart & Category Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-area">
        {/* Payment Methods Breakdown (Modern Donut Chart SVG) */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Tender Breakdown (Payment Methods)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">UPI, Card, Cash settlement distribution</p>
              </div>
              <span className="p-2 rounded-xl bg-orange-50 text-[#f5764b]">
                <PieChart className="w-4 h-4" />
              </span>
            </div>

            {/* Donut Chart */}
            <div className="mt-6 flex flex-col items-center justify-center relative">
              <svg width="170" height="170" viewBox="0 0 170 170" className="transform -rotate-90">
                <circle cx="85" cy="85" r="65" fill="none" stroke="#F3F4F6" strokeWidth="18" />
                {/* UPI (Orange) */}
                <circle
                  cx="85"
                  cy="85"
                  r="65"
                  fill="none"
                  stroke="#f5764b"
                  strokeWidth="18"
                  strokeDasharray={`${(upiPct / 100) * 408} 408`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* Card (Dark Charcoal) */}
                <circle
                  cx="85"
                  cy="85"
                  r="65"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="18"
                  strokeDasharray={`${(cardPct / 100) * 408} 408`}
                  strokeDashoffset={`-${(upiPct / 100) * 408}`}
                  strokeLinecap="round"
                />
                {/* Cash (Green) */}
                <circle
                  cx="85"
                  cy="85"
                  r="65"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="18"
                  strokeDasharray={`${(cashPct / 100) * 408} 408`}
                  strokeDashoffset={`-${((upiPct + cardPct) / 100) * 408}`}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Settled</span>
                <span className="text-lg font-extrabold text-gray-900">₹{totalPaymentsSum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* Method Breakdown Rows */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#f5764b]" />
                  <span className="text-xs font-bold text-gray-900">UPI Digital (QR / App)</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-gray-900">₹{paymentMethodMap.UPI.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-[#f5764b] ml-2">({upiPct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#18181B]" />
                  <span className="text-xs font-bold text-gray-900">Credit / Debit Card</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-gray-900">₹{paymentMethodMap.Card.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-gray-700 ml-2">({cardPct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="text-xs font-bold text-gray-900">Cash Currency</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-gray-900">₹{paymentMethodMap.Cash.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-emerald-600 ml-2">({cashPct}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-medium">Reconciled via POS Drawer:</span>
            <button
              onClick={() => onNavigate('cash-drawer')}
              className="text-[#f5764b] font-bold hover:underline"
            >
              Open Cash Drawer Closing →
            </button>
          </div>
        </div>

        {/* Category Sales Breakdown */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Revenue by Food Category
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Sales contribution by menu department</p>
              </div>
              <span className="p-2 rounded-xl bg-orange-50 text-[#f5764b]">
                <BarChart2 className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-5 space-y-3.5">
              {categorySales.map((cat, idx) => {
                const pct = grossSales > 0 ? Math.round((cat.amount / grossSales) * 100) : 0;
                return (
                  <div key={cat.name} className="p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-gray-900 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-orange-100 text-[#f5764b] text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        {cat.name}
                      </span>
                      <span className="text-gray-900">₹{cat.amount.toFixed(2)} <span className="text-[#f5764b] ml-1">({pct}%)</span></span>
                    </div>
                    <div className="h-2 w-full bg-gray-200/70 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-[#f5764b] rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-medium">Looking for recipes & ingredient cost?</span>
            <button
              onClick={() => onNavigate('recipes')}
              className="text-[#f5764b] font-bold hover:underline"
            >
              Recipe Food Costing →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
