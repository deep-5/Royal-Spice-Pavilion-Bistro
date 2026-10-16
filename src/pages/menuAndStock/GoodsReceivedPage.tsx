import React, { useState } from 'react';
import {
  PackageCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Building2,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GoodsReceivedPage: React.FC = () => {
  const { purchaseOrders, stockMovements } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // POs that have had goods received
  const receivedPOs = purchaseOrders.filter(p => p.status === 'Received' || p.status === 'Partially Received');
  const poStockReceipts = stockMovements.filter(m => m.type === 'PO Received');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Goods Received Registry (GRN)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Audit history of accepted shipments, supplier discrepancies, and warehouse inventory stock additions
          </p>
        </div>
      </div>

      {/* Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-gray-400">Total Shipments Received</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{receivedPOs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-green-600">Stock Movements Logged</p>
          <p className="text-xl font-bold text-green-700 mt-0.5">{poStockReceipts.length} entries</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-[#f5764b]">Inventory Status</p>
          <p className="text-xl font-bold text-orange-950 mt-0.5">Automated Sync Active</p>
        </div>
      </div>

      {/* Goods Received Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier Partner</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Items Delivered</th>
                <th className="py-3 px-4">Receipt Status</th>
                <th className="py-3 px-4 text-right">Received Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {receivedPOs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No goods receipts recorded yet.
                  </td>
                </tr>
              ) : (
                receivedPOs.map(po => (
                  <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{po.poNumber}</td>
                    <td className="py-3 px-4 font-bold text-gray-800">{po.supplierName}</td>
                    <td className="py-3 px-4 text-gray-500">{po.orderDate}</td>
                    <td className="py-3 px-4">
                      {po.items.map(i => (
                        <span key={i.inventoryItemId} className="block text-[11px] text-gray-700">
                          ✓ {i.name}: {i.receivedQuantity} / {i.quantity} {i.unit}
                        </span>
                      ))}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        po.status === 'Received' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-950'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-gray-900">
                      ₹{po.totalAmount.toFixed(2)}
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
