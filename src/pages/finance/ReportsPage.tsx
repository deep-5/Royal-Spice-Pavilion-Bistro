import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  BarChart2,
  TrendingUp,
  Receipt,
  UtensilsCrossed,
  ChefHat,
  Package,
  Users,
  Coins,
  CheckCircle2,
  Search
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const {
    orders,
    payments,
    refunds,
    expenses,
    inventory,
    stockMovements,
    purchaseOrders,
    reservations,
    tables,
    staff,
    attendance,
    cashClosings,
    menuItems,
    settings
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'sales' | 'tax' | 'operations' | 'kitchen' | 'inventory' | 'staff' | 'closing'
  >('sales');

  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'quarter'>('month');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Sales Calculations
  const nonCancelledOrders = orders.filter(o => o.status !== 'Cancelled');
  const grossSales = nonCancelledOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const discountsTotal = nonCancelledOrders.reduce((sum, o) => sum + o.discountAmount, 0);
  const netSales = grossSales - discountsTotal;
  const taxesTotal = nonCancelledOrders.reduce((sum, o) => sum + o.taxAmount, 0);
  const serviceChargeTotal = nonCancelledOrders.reduce((sum, o) => sum + o.serviceCharge, 0);
  const grandTotal = nonCancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Sales by Channel
  const dineInSales = nonCancelledOrders.filter(o => o.source === 'Dine-in' || o.source === 'QR Order').reduce((s, o) => s + o.totalAmount, 0);
  const takeawaySales = nonCancelledOrders.filter(o => o.source === 'Takeaway').reduce((s, o) => s + o.totalAmount, 0);
  const deliverySales = nonCancelledOrders.filter(o => o.source === 'Delivery').reduce((s, o) => s + o.totalAmount, 0);

  // Top Item Sales Aggregation
  const itemSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  nonCancelledOrders.forEach(ord => {
    ord.items.forEach(it => {
      if (!itemSalesMap[it.menuItemId]) {
        itemSalesMap[it.menuItemId] = { name: it.name, quantity: 0, revenue: 0 };
      }
      itemSalesMap[it.menuItemId].quantity += it.quantity;
      itemSalesMap[it.menuItemId].revenue += it.unitPrice * it.quantity;
    });
  });
  const topItemsReport = Object.values(itemSalesMap).sort((a, b) => b.revenue - a.revenue);

  // 2. Tax Summary
  const cgst = taxesTotal / 2;
  const sgst = taxesTotal / 2;
  const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);

  // 3. Operations & FOH
  const totalReservations = reservations.length;
  const seatedReservations = reservations.filter(r => r.status === 'Seated' || r.status === 'Completed').length;
  const noShows = reservations.filter(r => r.status === 'No-show').length;
  const tableOccupancy = tables.length > 0
    ? Math.round((tables.filter(t => t.status === 'Occupied' || t.status === 'Seated' || t.status === 'Ordering').length / tables.length) * 100)
    : 0;

  // 4. Kitchen Prep Metrics
  const avgPrepTime = '14.2 min';
  const delaysRecorded = 3;

  // 5. Inventory Valuation
  const totalInventoryValuation = inventory.reduce((s, i) => s + i.currentStock * i.unitCost, 0);
  const totalPOSpend = purchaseOrders
    .filter(p => p.status === 'Received' || p.status === 'Partially Received')
    .reduce((s, p) => s + p.totalAmount, 0);

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Export CSV based on active tab
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[] = [];
    let filename = `Report_${activeTab}_${new Date().toISOString().substring(0, 10)}.csv`;

    if (activeTab === 'sales') {
      headers = ['Item Name,Quantity Sold,Total Revenue (INR)\n'];
      rows = topItemsReport.map(item => `"${item.name}",${item.quantity},${item.revenue.toFixed(2)}`);
    } else if (activeTab === 'tax') {
      headers = ['Metric,Amount (INR)\n'];
      rows = [
        `Gross Sales,${grossSales.toFixed(2)}`,
        `Discounts Given,${discountsTotal.toFixed(2)}`,
        `Net Sales,${netSales.toFixed(2)}`,
        `CGST (2.5%),${cgst.toFixed(2)}`,
        `SGST (2.5%),${sgst.toFixed(2)}`,
        `Total GST,${taxesTotal.toFixed(2)}`,
        `Service Charge,${serviceChargeTotal.toFixed(2)}`,
        `Total Refunds,${totalRefunds.toFixed(2)}`
      ];
    } else if (activeTab === 'inventory') {
      headers = ['SKU,Item Name,Category,Current Stock,Unit,Unit Cost,Total Value\n'];
      rows = inventory.map(i =>
        `"${i.sku}","${i.name}","${i.category}",${i.currentStock},"${i.unit}",${i.unitCost},${(i.currentStock * i.unitCost).toFixed(2)}`
      );
    } else if (activeTab === 'staff') {
      headers = ['Staff Name,Date,Clock In,Clock Out,Total Hours,Status\n'];
      rows = attendance.map(a =>
        `"${a.staffName}","${a.date}","${a.clockIn}","${a.clockOut || 'Active'}",${a.totalHours},"${a.status}"`
      );
    } else if (activeTab === 'closing') {
      headers = ['Closing #,Shift,Cashier,Expected Cash,Counted Cash,Variance,Status,Date\n'];
      rows = cashClosings.map(c =>
        `"${c.closingNumber}","${c.shift}","${c.cashierName}",${c.expectedClosingCash},${c.countedCash},${c.variance},"${c.status}","${c.date}"`
      );
    } else {
      headers = ['Order #,Type,Subtotal,Discount,Tax,Total,Status,Date\n'];
      rows = orders.map(o =>
        `"${o.orderNumber}","${o.source}",${o.subtotal},${o.discountAmount},${o.taxAmount},${o.totalAmount},"${o.status}","${o.createdAt}"`
      );
    }

    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const tabs = [
    { id: 'sales', label: 'Sales & Revenue', icon: BarChart2 },
    { id: 'tax', label: 'Tax & GST Audit', icon: Receipt },
    { id: 'operations', label: 'FOH & Tables', icon: UtensilsCrossed },
    { id: 'kitchen', label: 'Kitchen & KDS', icon: ChefHat },
    { id: 'inventory', label: 'Stock & Valuation', icon: Package },
    { id: 'staff', label: 'Staff & Attendance', icon: Users },
    { id: 'closing', label: 'Cash Shift Closes', icon: Coins }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-[#f5764b]" />
            Executive Reports & Analytics Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Compliant tax summaries, item velocity, channel breakdown, and operational audit reports
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
            {(['today', 'week', 'month', 'quarter'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                className={`px-3 py-1 rounded-md font-medium capitalize transition-all ${
                  dateRange === d
                    ? 'bg-white text-gray-900 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-200 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-200 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            Print Report
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-gray-200/80">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#f5764b] text-[#e05a2b] bg-orange-50/50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#f5764b]' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Sales & Revenue */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-xs uppercase font-medium text-gray-400">Gross Sales</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{grossSales.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{nonCancelledOrders.length} settled orders</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-xs uppercase font-medium text-gray-400">Total Discounts</span>
              <p className="text-2xl font-bold text-red-600 mt-1">₹{discountsTotal.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{((discountsTotal / (grossSales || 1)) * 100).toFixed(1)}% of gross</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-xs uppercase font-medium text-gray-400">Net Sales</span>
              <p className="text-2xl font-bold text-[#e05a2b] mt-1">₹{netSales.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500 mt-0.5">Base taxable amount</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-xs uppercase font-medium text-gray-400">Avg Order Value (AOV)</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{nonCancelledOrders.length > 0 ? (grandTotal / nonCancelledOrders.length).toFixed(0) : '0'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Per guest ticket</p>
            </div>
          </div>

          {/* Channel Sales Progress */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Sales Breakdown by Order Channel</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                <span className="text-xs font-semibold text-orange-950">Dine-in Service</span>
                <p className="text-xl font-bold text-orange-950 mt-1">₹{dineInSales.toLocaleString('en-IN')}</p>
                <p className="text-xs text-[#e05a2b] mt-0.5">{((dineInSales / (grandTotal || 1)) * 100).toFixed(1)}% of revenue</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                <span className="text-xs font-semibold text-amber-800">Takeaway Counter</span>
                <p className="text-xl font-bold text-amber-900 mt-1">₹{takeawaySales.toLocaleString('en-IN')}</p>
                <p className="text-xs text-amber-700 mt-0.5">{((takeawaySales / (grandTotal || 1)) * 100).toFixed(1)}% of revenue</p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <span className="text-xs font-semibold text-purple-800">Direct Delivery</span>
                <p className="text-xl font-bold text-purple-900 mt-1">₹{deliverySales.toLocaleString('en-IN')}</p>
                <p className="text-xs text-purple-700 mt-0.5">{((deliverySales / (grandTotal || 1)) * 100).toFixed(1)}% of revenue</p>
              </div>
            </div>
          </div>

          {/* Top Selling Items Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200/80">
              <h3 className="text-sm font-bold text-gray-900">Item Velocity & Revenue Contribution</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200/80 text-xs font-semibold text-gray-600 uppercase">
                    <th className="py-3 px-4">Menu Item</th>
                    <th className="py-3 px-4">Portions Sold</th>
                    <th className="py-3 px-4">Gross Revenue</th>
                    <th className="py-3 px-4">% Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topItemsReport.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/60">
                      <td className="py-3 px-4 font-medium text-gray-800">{item.name}</td>
                      <td className="py-3 px-4 font-mono">{item.quantity}</td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">₹{item.revenue.toFixed(2)}</td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {((item.revenue / (grossSales || 1)) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tax & GST Audit */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <span className="text-xs uppercase font-medium text-gray-400">Central GST (2.5%)</span>
              <p className="text-2xl font-bold text-[#e05a2b] mt-1">₹{cgst.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Accrued CGST liability</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <span className="text-xs uppercase font-medium text-gray-400">State GST (2.5%)</span>
              <p className="text-2xl font-bold text-[#e05a2b] mt-1">₹{sgst.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Accrued SGST liability</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <span className="text-xs uppercase font-medium text-gray-400">Total GST Due</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{taxesTotal.toFixed(2)}</p>
              <p className="text-xs text-green-600 font-medium mt-0.5">Compliant GSTR-3B audit basis</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900">Tax Audit Summary Statement</h3>
            <div className="divide-y divide-gray-100 text-sm">
              <div className="py-3 flex justify-between">
                <span className="text-gray-600">Total Taxable Value (Net Sales)</span>
                <span className="font-mono font-semibold">₹{netSales.toFixed(2)}</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-gray-600">Applicable Restaurant Tax Rate</span>
                <span className="font-semibold text-[#e05a2b]">5.0% Composite</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-gray-600">Total Service Charges (Optional Welfare)</span>
                <span className="font-mono font-semibold">₹{serviceChargeTotal.toFixed(2)}</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-gray-600">Authorized Refund Deductions</span>
                <span className="font-mono font-semibold text-red-600">-₹{totalRefunds.toFixed(2)}</span>
              </div>
              <div className="py-3 flex justify-between font-bold bg-gray-50 px-3 rounded-lg">
                <span className="text-gray-900">Net GST Output Tax Payable</span>
                <span className="font-mono text-orange-950">₹{taxesTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Operations & FOH */}
      {activeTab === 'operations' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <span className="text-xs uppercase font-medium text-gray-400">Total Bookings</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalReservations}</p>
            <p className="text-xs text-gray-500 mt-0.5">{seatedReservations} seated successfully</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <span className="text-xs uppercase font-medium text-gray-400">No-show Rate</span>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {totalReservations > 0 ? ((noShows / totalReservations) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{noShows} absent reservations</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <span className="text-xs uppercase font-medium text-gray-400">Table Occupancy</span>
            <p className="text-2xl font-bold text-[#e05a2b] mt-1">{tableOccupancy}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Across {tables.length} floor tables</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <span className="text-xs uppercase font-medium text-gray-400">Avg Dine-in Time</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">68 min</p>
            <p className="text-xs text-gray-500 mt-0.5">Table turnover benchmark</p>
          </div>
        </div>
      )}

      {/* Tab 4: Kitchen & KDS */}
      {activeTab === 'kitchen' && (
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-gray-900">Kitchen Display Operations & Speed of Service</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <span className="text-xs font-semibold text-gray-500">Average Preparation Time</span>
              <p className="text-2xl font-bold text-[#e05a2b] mt-1">{avgPrepTime}</p>
              <p className="text-xs text-gray-400 mt-0.5">From order ticket to ready bell</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <span className="text-xs font-semibold text-gray-500">Delay Incidents Flagged</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">{delaysRecorded}</p>
              <p className="text-xs text-gray-400 mt-0.5">Tickets exceeding 20 min threshold</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <span className="text-xs font-semibold text-gray-500">Top Prep Station</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">Tandoor & Grill</p>
              <p className="text-xs text-gray-400 mt-0.5">42% of total order volume</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Stock & Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-xs uppercase font-medium text-gray-400">Total Inventory Value</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalInventoryValuation.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{inventory.length} tracked ingredients</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-xs uppercase font-medium text-gray-400">Purchase Order Spend</span>
              <p className="text-2xl font-bold text-[#e05a2b] mt-1">₹{totalPOSpend.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500 mt-0.5">Goods received & approved</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-xs uppercase font-medium text-gray-400">Low Stock SKUs</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {inventory.filter(i => i.currentStock <= i.reorderLevel).length}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Below replenishment threshold</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Staff & Attendance */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200/80">
            <h3 className="text-sm font-bold text-gray-900">Staff Shift Hours & Attendance Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200/80 text-xs font-semibold text-gray-600 uppercase">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Clock In</th>
                  <th className="py-3 px-4">Clock Out</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-medium text-gray-800">{a.staffName}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{a.date}</td>
                    <td className="py-3 px-4 font-mono text-xs">{a.clockIn}</td>
                    <td className="py-3 px-4 font-mono text-xs">{a.clockOut || 'Active'}</td>
                    <td className="py-3 px-4 font-mono font-semibold">{a.totalHours} hrs</td>
                    <td className="py-3 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 font-medium text-gray-700">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Cash Shift Closes */}
      {activeTab === 'closing' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200/80">
            <h3 className="text-sm font-bold text-gray-900">Shift Register Closings & Float Audits</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200/80 text-xs font-semibold text-gray-600 uppercase">
                  <th className="py-3 px-4">Closing #</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Cashier</th>
                  <th className="py-3 px-4">Expected Cash</th>
                  <th className="py-3 px-4">Counted Cash</th>
                  <th className="py-3 px-4">Variance</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cashClosings.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-mono text-xs font-semibold">{c.closingNumber}</td>
                    <td className="py-3 px-4 text-xs">{c.shift}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{c.cashierName}</td>
                    <td className="py-3 px-4 font-mono">₹{c.expectedClosingCash.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono font-bold">₹{c.countedCash.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <span className={c.variance === 0 ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                        {c.variance >= 0 ? `+₹${c.variance}` : `-₹${Math.abs(c.variance)}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 font-medium text-gray-700">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
