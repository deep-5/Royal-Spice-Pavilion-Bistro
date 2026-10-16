import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Package
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StockMovementsPage: React.FC = () => {
  const { stockMovements } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredMovements = stockMovements.filter(m => {
    if (typeFilter !== 'All' && m.type !== typeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return m.itemName.toLowerCase().includes(q) || m.reason.toLowerCase().includes(q) || m.performedBy.toLowerCase().includes(q);
    }
    return true;
  });

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Item Name,Type,Delta,Balance After,Reason,Performed By\n" +
      filteredMovements.map(m => 
        `"${m.createdAt}","${m.itemName}","${m.type}",${m.delta},${m.balanceAfter},"${m.reason}","${m.performedBy}"`
      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stock_movements_${new Date().toISOString().substring(0, 10)}.csv`);
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
            Stock Movements Audit Log
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete immutable ledger of every ingredient inflow, recipe depletion, and kitchen wastage
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-2xs transition-colors"
        >
          <Download className="w-4 h-4 text-gray-500" />
          <span>Export Ledger CSV</span>
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
            placeholder="Search ingredient, reason, or staff..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none"
        >
          <option value="All">All Movement Types</option>
          <option value="Recipe Deduction">Recipe Deduction</option>
          <option value="PO Received">PO Received (Inflow)</option>
          <option value="Waste / Spoilage">Waste / Spoilage</option>
          <option value="Correction">Manual Correction</option>
        </select>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4">Quantity Delta</th>
                <th className="py-3 px-4">New Balance</th>
                <th className="py-3 px-4">Audit Reason</th>
                <th className="py-3 px-4 text-right">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMovements.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-gray-500">{m.createdAt}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{m.itemName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                      {m.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-black font-mono">
                    <span className={m.delta > 0 ? 'text-green-700' : 'text-red-600'}>
                      {m.delta > 0 ? `+${m.delta}` : m.delta}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-800">{m.balanceAfter}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-sm truncate">{m.reason}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-700">{m.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
