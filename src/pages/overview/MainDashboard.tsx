import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  Calendar,
  Layers,
  AlertCircle,
  Package,
  Receipt,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UtensilsCrossed,
  Filter,
  Download,
  CreditCard,
  QrCode,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  PieChart as PieIcon,
  Activity,
  SlidersHorizontal
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';

interface MainDashboardProps {
  onNavigate: (pageId: string) => void;
  onOpenQuickAction: (actionType: string) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ onNavigate, onOpenQuickAction }) => {
  const {
    orders,
    reservations,
    tables,
    inventory,
    payments,
    refunds,
    kitchenTickets,
    auditLogs,
    currentBranch,
    dateFilter,
    setDateFilter
  } = useApp();

  const [chartPeriod, setChartPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [activeHoverBar, setActiveHoverBar] = useState<number | null>(9); // Default to 8 PM peak dinner
  const [transactionTab, setTransactionTab] = useState<'All' | 'Paid' | 'Unpaid'>('All');

  // Calculations
  const grossSales = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.totalAmount : 0), 0);
  const totalDiscounts = orders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
  const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);
  const netSales = Math.max(0, grossSales - totalRefunds);
  const totalOrdersCount = orders.length;
  const paidOrdersCount = orders.filter(o => o.paymentStatus === 'Paid').length;
  const aov = paidOrdersCount > 0 ? (grossSales / paidOrdersCount) : 0;

  const todayReservations = reservations.filter(r => r.date === '2026-10-15');
  const occupiedTables = tables.filter(t => t.status === 'Occupied' || t.status === 'Seated' || t.status === 'Ordering' || t.status === 'Bill Requested');
  const availableTablesCount = tables.filter(t => t.status === 'Available').length;
  const occupancyRate = tables.length > 0 ? Math.round((occupiedTables.length / tables.length) * 100) : 0;

  const pendingPaymentsAmount = orders
    .filter(o => o.paymentStatus === 'Unpaid' && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lowStockItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');
  const delayedTickets = kitchenTickets.filter(k => k.isDelayed || (k.status === 'Preparing' && k.priority === 'Rush'));

  // Sales by channel
  const dineInSales = orders.filter(o => o.source === 'Dine-in').reduce((s, o) => s + o.totalAmount, 0) || 36800;
  const qrSales = orders.filter(o => o.source === 'QR Order').reduce((s, o) => s + o.totalAmount, 0) || 12450;
  const takeawaySales = orders.filter(o => o.source === 'Takeaway').reduce((s, o) => s + o.totalAmount, 0) || 5100;
  const totalChannelSales = (dineInSales + qrSales + takeawaySales) || 1;

  const dineInPct = Math.round((dineInSales / totalChannelSales) * 100);
  const qrPct = Math.round((qrSales / totalChannelSales) * 100);
  const takeawayPct = Math.max(0, 100 - dineInPct - qrPct);

  // Top selling items
  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 };
      }
      itemCounts[item.name].count += item.quantity;
      itemCounts[item.name].revenue += item.totalPrice;
    });
  });
  const topItems = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  // Hourly velocity dataset for the modern chart
  const hourlyData = [
    { hour: '11 AM', actual: 1800, target: 1500, orders: 12 },
    { hour: '12 PM', actual: 3600, target: 3000, orders: 24 },
    { hour: '1 PM', actual: 7850, target: 6000, orders: 58 },
    { hour: '2 PM', actual: 6400, target: 5500, orders: 46 },
    { hour: '3 PM', actual: 2900, target: 3000, orders: 18 },
    { hour: '4 PM', actual: 1800, target: 2000, orders: 14 },
    { hour: '5 PM', actual: 2400, target: 2500, orders: 19 },
    { hour: '6 PM', actual: 4800, target: 4000, orders: 36 },
    { hour: '7 PM', actual: 9200, target: 8000, orders: 74 },
    { hour: '8 PM', actual: 12400, target: 10000, orders: 98, isPeak: true },
    { hour: '9 PM', actual: 10800, target: 8500, orders: 82 },
    { hour: '10 PM', actual: 4200, target: 4000, orders: 28 },
  ];

  // SVG Spline curve generator for Cashflow Area Chart
  const svgWidth = 640;
  const svgHeight = 200;
  const maxChartVal = 14000;
  const paddingX = 30;
  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - 40;

  const points = hourlyData.map((d, i) => {
    const x = paddingX + (i / (hourlyData.length - 1)) * usableWidth;
    const y = svgHeight - 20 - (d.actual / maxChartVal) * usableHeight;
    return { x, y, ...d };
  });

  // Calculate smooth SVG cubic bezier path
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpx = (curr.x + next.x) / 2;
    pathD += ` C ${cpx},${curr.y} ${cpx},${next.y} ${next.x},${next.y}`;
  }
  const areaPathD = `${pathD} L ${points[points.length - 1].x},${svgHeight - 10} L ${points[0].x},${svgHeight - 10} Z`;

  // Target trajectory curve
  const targetPoints = hourlyData.map((d, i) => {
    const x = paddingX + (i / (hourlyData.length - 1)) * usableWidth;
    const y = svgHeight - 20 - (d.target / maxChartVal) * usableHeight;
    return { x, y };
  });
  let targetPathD = `M ${targetPoints[0].x},${targetPoints[0].y}`;
  for (let i = 0; i < targetPoints.length - 1; i++) {
    const curr = targetPoints[i];
    const next = targetPoints[i + 1];
    const cpx = (curr.x + next.x) / 2;
    targetPathD += ` C ${cpx},${curr.y} ${cpx},${next.y} ${next.x},${next.y}`;
  }

  // Filtered Payments
  const filteredPayments = payments.filter(p => {
    if (transactionTab === 'Paid') return p.status === 'Success';
    if (transactionTab === 'Unpaid') return p.status !== 'Success';
    return true;
  });

  const exportSummaryCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Metric,Value\n" +
      `Gross Sales,₹${grossSales.toFixed(2)}\n` +
      `Net Sales,₹${netSales.toFixed(2)}\n` +
      `Total Orders,${totalOrdersCount}\n` +
      `Average Order Value,₹${aov.toFixed(2)}\n` +
      `Reservations Today,${todayReservations.length}\n` +
      `Table Occupancy,${occupancyRate}%\n` +
      `Pending Payments,₹${pendingPaymentsAmount.toFixed(2)}\n` +
      `Low Stock Alerts,${lowStockItems.length}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daily_kpi_summary_${dateFilter.toLowerCase().replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-7 pb-16">
      {/* Top Welcome & Filter Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Restaurant Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-[#f5764b] border border-orange-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5764b] animate-pulse" /> Live Ops
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500 mt-1">
            Real-time operations for <span className="font-semibold text-gray-900">{currentBranch.name}</span> • Updated just now
          </p>
        </div>

        {/* Date Filter & Export Pill Group */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-2xs">
            {['Today', 'Week', 'Month'].map((period) => (
              <button
                key={period}
                onClick={() => setChartPeriod(period.toLowerCase() as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartPeriod === period.toLowerCase()
                    ? 'bg-[#18181B] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <button
            onClick={exportSummaryCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-2xs transition-all hover:border-[#f5764b]/40"
          >
            <Download className="w-3.5 h-3.5 text-gray-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Moniex-style 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Today's Gross Sales"
          value={`₹${grossSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`₹${totalDiscounts.toFixed(2)} discounts applied`}
          icon={DollarSign}
          trend={{ value: 14.8, isPositive: true }}
          sparkline={[32, 45, 40, 68, 55, 80, 72, 95]}
          onClick={() => onNavigate('sales-analytics')}
        />
        <StatCard
          title="Net Revenue"
          value={`₹${netSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`After ₹${totalRefunds.toFixed(2)} total refunds`}
          icon={TrendingUp}
          trend={{ value: 12.4, isPositive: true }}
          sparkline={[28, 38, 48, 52, 60, 75, 70, 88]}
          onClick={() => onNavigate('sales-analytics')}
        />
        <StatCard
          title="Total Orders"
          value={totalOrdersCount}
          subtitle={`${paidOrdersCount} completed & paid`}
          icon={ShoppingBag}
          trend={{ value: 8.5, isPositive: true }}
          sparkline={[15, 25, 30, 42, 38, 50, 48, 62]}
          onClick={() => onNavigate('orders')}
        />
        <StatCard
          title="Table Occupancy"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedTables.length} of ${tables.length} tables active`}
          icon={Layers}
          badge={`${availableTablesCount} Free`}
          sparkline={[40, 50, 65, 55, 70, 80, 75, 85]}
          onClick={() => onNavigate('floor-plan')}
        />
      </div>

      {/* Modern Quick Action Bar (Moniex Style) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-[#f5764b]">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-gray-900">
            Quick Operations
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenQuickAction('reservation')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#f5764b] hover:bg-[#e05a2b] text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>New Reservation</span>
          </button>

          <button
            onClick={() => onNavigate('pos')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#18181B] hover:bg-black text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Open POS Terminal</span>
          </button>

          <button
            onClick={() => onOpenQuickAction('order')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#f5764b]" />
            <span>Add Order</span>
          </button>

          <button
            onClick={() => onNavigate('floor-plan')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-gray-500" />
            <span>Floor Plan</span>
          </button>

          <button
            onClick={() => onOpenQuickAction('menu-item')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 transition-colors"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-gray-500" />
            <span>Add Menu Item</span>
          </button>

          <button
            onClick={() => onOpenQuickAction('expense')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5 text-gray-500" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: HERO GRAPHS (Moniex Spline Area Chart + Channel Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Hero Graph: Smooth Cashflow & Sales Velocity Spline Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Graph Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-gray-100">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                  <span>Cashflow & Hourly Revenue Trend</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Actual gross revenue curve vs projected sales target
                </p>
              </div>

              {/* Chart Legend & Peak Indicator */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f5764b]" /> Sales Curve
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Target
                </span>
              </div>
            </div>

            {/* Metric Summary Ribbon */}
            <div className="mt-5 grid grid-cols-3 gap-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Today Peak Sales</span>
                <p className="text-lg font-extrabold text-gray-900 mt-0.5">₹12,400.00</p>
                <span className="text-[11px] font-bold text-[#f5764b]">8:00 PM Dinner Rush</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Target Achieved</span>
                <p className="text-lg font-extrabold text-emerald-600 mt-0.5">124.6%</p>
                <span className="text-[11px] text-gray-500 font-medium">₹54,350 vs ₹43,600</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Avg Check / Table</span>
                <p className="text-lg font-extrabold text-gray-900 mt-0.5">₹{aov.toFixed(2)}</p>
                <span className="text-[11px] text-gray-500 font-medium">+4.2% vs last week</span>
              </div>
            </div>

            {/* Moniex High-Fidelity SVG Spline Chart */}
            <div className="mt-6 relative">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 overflow-visible select-none">
                <defs>
                  {/* Moniex Coral Orange Area Gradient */}
                  <linearGradient id="moniexAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f5764b" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#f5764b" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#f5764b" stopOpacity="0.0" />
                  </linearGradient>

                  <filter id="glowOrange" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#f5764b" floodOpacity="0.3" />
                  </filter>
                </defs>

                {/* Horizontal Reference Gridlines */}
                {[0, 1, 2, 3].map((gridIdx) => {
                  const yVal = 20 + gridIdx * 45;
                  const labelVal = `₹${((3 - gridIdx) * 4).toFixed(0)}k`;
                  return (
                    <g key={gridIdx}>
                      <line
                        x1={paddingX}
                        y1={yVal}
                        x2={svgWidth - paddingX}
                        y2={yVal}
                        stroke="#E5E7EB"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 6}
                        y={yVal + 4}
                        textAnchor="end"
                        fontSize="10"
                        fontWeight="600"
                        fill="#9CA3AF"
                      >
                        {labelVal}
                      </text>
                    </g>
                  );
                })}

                {/* Target Baseline Curve (Dotted Slate) */}
                <path
                  d={targetPathD}
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />

                {/* Smooth Area Gradient Fill */}
                <path d={areaPathD} fill="url(#moniexAreaGrad)" />

                {/* Main Glowing Smooth Spline Curve */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#f5764b"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glowOrange)"
                />

                {/* Interactive Points on Curve */}
                {points.map((pt, idx) => {
                  const isHovered = activeHoverBar === idx;
                  const isPeak = pt.isPeak;

                  return (
                    <g key={idx} className="cursor-pointer" onMouseEnter={() => setActiveHoverBar(idx)}>
                      {/* Vertical line indicator when active */}
                      {isHovered && (
                        <line
                          x1={pt.x}
                          y1={pt.y}
                          x2={pt.x}
                          y2={svgHeight - 15}
                          stroke="#f5764b"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Circle dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered || isPeak ? 6 : 4}
                        fill={isHovered || isPeak ? '#f5764b' : '#FFFFFF'}
                        stroke="#f5764b"
                        strokeWidth={isHovered || isPeak ? 3 : 2}
                        className="transition-all duration-200"
                      />

                      {/* Floating Moniex-style Tooltip Pill over Active Point */}
                      {(isHovered || (isPeak && activeHoverBar === null)) && (
                        <g>
                          <rect
                            x={Math.min(svgWidth - 110, Math.max(10, pt.x - 55))}
                            y={Math.max(5, pt.y - 36)}
                            width="110"
                            height="28"
                            rx="14"
                            fill="#18181B"
                            className="shadow-lg"
                          />
                          <text
                            x={Math.min(svgWidth - 110, Math.max(10, pt.x - 55)) + 55}
                            y={Math.max(5, pt.y - 36) + 18}
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="11"
                            fontWeight="bold"
                          >
                            {pt.hour} • ₹{pt.actual.toLocaleString('en-IN')}
                          </text>
                        </g>
                      )}

                      {/* X-axis time label */}
                      <text
                        x={pt.x}
                        y={svgHeight}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight={isHovered ? 'bold' : '600'}
                        fill={isHovered ? '#f5764b' : '#6B7280'}
                      >
                        {pt.hour}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Graph Footer Note */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-[#f5764b]" />
              Hover over data points to inspect hourly order velocity and sales breakdown.
            </span>
            <button
              onClick={() => onNavigate('sales-analytics')}
              className="font-bold text-[#f5764b] hover:text-[#e05a2b] flex items-center gap-1"
            >
              Detailed Analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Graph 2: Moniex Expense & Channel Breakdown (Segmented Modern Donut Chart) */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Revenue Breakdown
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">By service channel & ordering mode</p>
              </div>
              <span className="p-2 rounded-xl bg-gray-50 text-gray-600 border border-gray-100">
                <PieIcon className="w-4 h-4" />
              </span>
            </div>

            {/* Modern Donut Chart Graphic */}
            <div className="mt-6 flex flex-col items-center justify-center relative">
              <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="#F3F4F6"
                  strokeWidth="20"
                />

                {/* Slice 1: Dine-in Dining (Coral Orange) */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="#f5764b"
                  strokeWidth="20"
                  strokeDasharray={`${(dineInPct / 100) * 440} 440`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />

                {/* Slice 2: Table QR Ordering (Dark Charcoal) */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="20"
                  strokeDasharray={`${(qrPct / 100) * 440} 440`}
                  strokeDashoffset={`-${(dineInPct / 100) * 440}`}
                  strokeLinecap="round"
                />

                {/* Slice 3: Takeaway & Counter (Light Peach) */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="#FED7AA"
                  strokeWidth="20"
                  strokeDasharray={`${(takeawayPct / 100) * 440} 440`}
                  strokeDashoffset={`-${((dineInPct + qrPct) / 100) * 440}`}
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Gross</span>
                <span className="text-xl font-extrabold text-gray-900 tracking-tight">₹{grossSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">+14.8%</span>
              </div>
            </div>

            {/* Channels Legend List (Moniex Style) */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#f5764b]" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Dine-in Tables</p>
                    <p className="text-[10px] text-gray-400">Traditional server order</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-gray-900">₹{dineInSales.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] font-bold text-[#f5764b]">{dineInPct}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#18181B]" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Table QR Ordering</p>
                    <p className="text-[10px] text-gray-400">Direct customer scan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-gray-900">₹{qrSales.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] font-bold text-gray-700">{qrPct}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#FED7AA]" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Takeaway & Counters</p>
                    <p className="text-[10px] text-gray-400">Pick-up counter</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-gray-900">₹{takeawaySales.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] font-bold text-amber-600">{takeawayPct}%</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('sales-analytics')}
            className="w-full mt-5 py-2.5 text-center text-xs font-bold text-[#f5764b] hover:text-white hover:bg-[#f5764b] border border-orange-200 rounded-xl transition-all shadow-2xs"
          >
            Audit Channel Taxes & Metrics →
          </button>
        </div>
      </div>

      {/* SECTION 3: MODERN CAPSULE BAR CHART + SAVING GOAL / OCCUPANCY GAUGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modern Pill Capsule Bar Chart: Transfer & Order Velocity */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-5 border-b border-gray-100">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                Hourly Order Velocity (Capsule Bars)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Order volume and gross sales per time window</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-[#f5764b] border border-orange-200/50">
                Peak: 8 PM (98 Orders)
              </span>
            </div>
          </div>

          {/* Moniex-style Sleek Capsule Bar Chart */}
          <div className="mt-8 h-56 flex items-end justify-between gap-2 sm:gap-3 px-2">
            {hourlyData.map((bar, idx) => {
              const maxVal = 13000;
              const barHeightPct = Math.min(100, Math.round((bar.actual / maxVal) * 100));
              const isPeak = bar.isPeak;
              const isHovered = activeHoverBar === idx;

              return (
                <div
                  key={bar.hour}
                  className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setActiveHoverBar(idx)}
                >
                  {/* Pinned / Hover Tooltip Pill */}
                  {(isHovered || (isPeak && activeHoverBar === null)) && (
                    <div className="mb-2 px-2 py-0.5 rounded-full bg-[#18181B] text-white text-[10px] font-bold shadow-md whitespace-nowrap animate-fade-in">
                      ₹{bar.actual.toLocaleString('en-IN')}
                    </div>
                  )}

                  {/* Dual Capsule Pill Bars */}
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    {/* Actual Sales Bar (Capsule Pill) */}
                    <div
                      style={{ height: `${barHeightPct}%` }}
                      className={`w-full max-w-[14px] rounded-full transition-all duration-300 ${
                        isPeak || isHovered
                          ? 'bg-[#f5764b] shadow-[0_4px_12px_rgba(245,118,75,0.4)]'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    />
                  </div>

                  <span className={`text-[10px] font-semibold mt-1 transition-colors ${
                    isHovered || isPeak ? 'text-[#f5764b] font-bold' : 'text-gray-400'
                  }`}>
                    {bar.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Moniex Semi-Circular Gauge: Table Capacity & Occupancy */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Dining Room Capacity
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Real-time floor utilization</p>
              </div>
              <button
                onClick={() => onNavigate('floor-plan')}
                className="text-xs font-bold text-[#f5764b] hover:text-[#e05a2b]"
              >
                Floor Plan →
              </button>
            </div>

            {/* Moniex Semi-Circular Gauge SVG (like Saving Goal 68%) */}
            <div className="mt-6 flex flex-col items-center justify-center relative">
              <svg width="220" height="130" viewBox="0 0 220 130" className="overflow-visible">
                {/* Background Arc */}
                <path
                  d="M 20 120 A 90 90 0 0 1 200 120"
                  fill="none"
                  stroke="#F3F4F6"
                  strokeWidth="20"
                  strokeLinecap="round"
                />

                {/* Progress Arc */}
                <path
                  d="M 20 120 A 90 90 0 0 1 200 120"
                  fill="none"
                  stroke="#f5764b"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * (occupancyRate / 100))}
                />
              </svg>

              {/* Gauge Center Text */}
              <div className="absolute bottom-2 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                  {occupancyRate}%
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  Capacity In Use
                </span>
              </div>
            </div>

            {/* Gauge Key Metric Chips */}
            <div className="mt-8 grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Occupied Tables</span>
                <p className="text-base font-extrabold text-gray-900 mt-0.5">{occupiedTables.length} Active</p>
                <span className="text-[10px] text-gray-500 font-medium">52 Guests Seated</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Available Tables</span>
                <p className="text-base font-extrabold text-emerald-700 mt-0.5">{availableTablesCount} Ready</p>
                <span className="text-[10px] text-emerald-600 font-medium">Ready to seat</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('floor-plan')}
            className="w-full mt-5 py-2.5 text-center text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-xl transition-all shadow-xs"
          >
            Manage Floor Plan & Seating
          </button>
        </div>
      </div>

      {/* SECTION 4: LIVE FLOOR GRID, KITCHEN DELAYS & INVENTORY ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Table Grid */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Floor Tables Status</h3>
              <p className="text-xs text-gray-500">{occupiedTables.length} busy • {availableTablesCount} ready</p>
            </div>
            <button
              onClick={() => onNavigate('floor-plan')}
              className="text-xs font-bold text-[#f5764b] hover:text-[#e05a2b]"
            >
              All Tables →
            </button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {tables.slice(0, 12).map((t) => {
              const statusColors: Record<string, string> = {
                'Available': 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:border-emerald-400',
                'Reserved': 'bg-orange-50 border-orange-200 text-[#f5764b] hover:border-orange-400',
                'Seated': 'bg-amber-50 border-amber-200 text-amber-800 hover:border-amber-400',
                'Occupied': 'bg-red-50 border-red-200 text-red-800 hover:border-red-400',
                'Bill Requested': 'bg-purple-50 border-purple-200 text-purple-800 hover:border-purple-400',
                'Cleaning': 'bg-gray-100 border-gray-200 text-gray-600',
                'Out of Service': 'bg-gray-100 border-gray-200 text-gray-400'
              };

              return (
                <div
                  key={t.id}
                  onClick={() => onNavigate('floor-plan')}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all hover:scale-105 shadow-2xs ${statusColors[t.status] || 'bg-gray-50 border-gray-200'}`}
                >
                  <p className="font-extrabold text-xs">{t.number}</p>
                  <p className="text-[10px] truncate capitalize font-semibold mt-0.5">{t.status === 'Bill Requested' ? 'Bill Due' : t.status}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2 text-[10px] text-gray-500 font-semibold">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Free</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f5764b]" /> Reserved</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Occupied</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Bill Due</span>
          </div>
        </div>

        {/* Kitchen Rush Alerts */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Kitchen Delays</h3>
                <p className="text-xs text-gray-500">{delayedTickets.length} rush tickets flagged</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('kds')}
              className="text-xs font-bold text-[#f5764b] hover:text-[#e05a2b]"
            >
              Open KDS →
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {delayedTickets.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                <p className="font-bold text-gray-700">Kitchen Running Smoothly</p>
                <p className="text-[11px] text-gray-400">All tickets within SLA target prep times</p>
              </div>
            ) : (
              delayedTickets.map((t) => (
                <div key={t.id} className="p-3 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-gray-900">{t.orderNumber}</span>
                    <span className="text-gray-600 ml-2 font-medium">({t.tableNumber ? 'Table ' + t.tableNumber : t.source})</span>
                    <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                      Station: {t.station} • {t.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-950 font-bold text-[10px] uppercase">
                    {t.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Reorder Alerts */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-700">
                <Package className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Stock Reorder Alerts</h3>
                <p className="text-xs text-gray-500">{lowStockItems.length} items low</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-bold text-[#f5764b] hover:text-[#e05a2b]"
            >
              Manage Stock →
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {lowStockItems.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                <p className="font-bold text-gray-700">Inventory Well Stocked</p>
                <p className="text-[11px] text-gray-400">All pantry and ingredient counts optimal</p>
              </div>
            ) : (
              lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 rounded-2xl border border-red-200 bg-red-50/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-gray-900">{item.name}</span>
                    <span className="text-gray-500 text-[11px] ml-1.5">({item.supplierName})</span>
                    <p className="text-[11px] text-red-700 font-medium mt-0.5">
                      Current: <span className="font-bold">{item.currentStock} {item.unit}</span> (Min: {item.reorderLevel} {item.unit})
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenQuickAction('po')}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition-colors shadow-2xs"
                  >
                    PO
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: MONIEX-STYLE RECENT TRANSACTIONS TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
        {/* Table Header & Pill Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Recent Transactions</h3>
            <p className="text-xs text-gray-500 mt-0.5">Settled bills, cash drawers, and UPI payments</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs font-bold">
              {(['All', 'Paid', 'Unpaid'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTransactionTab(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    transactionTab === tab
                      ? 'bg-[#18181B] text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate('payments')}
              className="text-xs font-bold text-[#f5764b] hover:text-[#e05a2b] px-3 py-2"
            >
              See All →
            </button>
          </div>
        </div>

        {/* Modern Moniex Table Rows */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Transaction / Order</th>
                <th className="pb-3">Payment Channel</th>
                <th className="pb-3">Cashier / Staff</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.slice(0, 6).map((pay) => (
                <tr key={pay.id} className="hover:bg-gray-50/70 transition-colors group">
                  <td className="py-3.5 pl-2 font-extrabold text-gray-900 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-[#f5764b] font-bold text-xs shrink-0">
                      ₹
                    </span>
                    <div>
                      <p className="font-bold text-gray-900">{pay.orderNumber}</p>
                      <p className="text-[10px] text-gray-400 font-medium">Ref: {pay.referenceId || 'TRX-' + pay.id.slice(-6)}</p>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 font-semibold text-gray-700 text-[11px]">
                      {pay.method}
                    </span>
                  </td>
                  <td className="py-3.5 font-medium text-gray-600">{pay.cashierName}</td>
                  <td className="py-3.5 text-gray-400 font-medium">{pay.createdAt}</td>
                  <td className="py-3.5 font-extrabold text-gray-900 text-sm">₹{pay.amount.toFixed(2)}</td>
                  <td className="py-3.5 text-right pr-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      pay.status === 'Success'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {pay.status === 'Success' ? 'Completed' : pay.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
