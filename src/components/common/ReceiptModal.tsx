import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  payment?: any;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, order, payment }) => {
  const { settings, currentBranch } = useApp();

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const cgst = (order.taxAmount / 2).toFixed(2);
  const sgst = (order.taxAmount / 2).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xs border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header bar (no-print) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white no-print">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-xs">Customer Tax Invoice / Bill</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${order.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {order.paymentStatus === 'Paid' ? 'PAID' : 'DUE'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="p-1.5 text-gray-600 hover:text-[#f5764b] hover:bg-gray-50 rounded transition-colors flex items-center gap-1 text-xs font-medium"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable thermal receipt view */}
        <div className="p-5 overflow-y-auto print-area bg-white text-gray-900 font-mono text-xs leading-relaxed">
          {/* Restaurant Header */}
          <div className="text-center pb-3 border-b border-dashed border-gray-300">
            <h2 className="text-sm font-bold uppercase tracking-wider font-sans text-gray-900">
              {settings.name}
            </h2>
            <p className="text-[11px] text-gray-500 font-sans mt-0.5">{currentBranch.name} • {currentBranch.address}</p>
            <p className="text-[10px] text-gray-500 font-sans">GSTIN: {settings.gstin}</p>
            <p className="text-[10px] text-gray-500 font-sans">Phone: {currentBranch.phone}</p>
          </div>

          {/* Bill Meta */}
          <div className="py-2.5 border-b border-dashed border-gray-300 text-[11px] text-gray-700 space-y-1">
            <div className="flex justify-between">
              <span>Bill No: <strong className="text-gray-900">{order.orderNumber}</strong></span>
              <span>Table: <strong className="text-gray-900">{order.tableNumber || 'Takeaway'}</strong></span>
            </div>
            <div className="flex justify-between">
              <span>Date: {order.createdAt}</span>
              <span>Type: {order.source}</span>
            </div>
            {order.customerName && (
              <div className="flex justify-between">
                <span>Guest: {order.customerName}</span>
                {order.customerPhone && <span>Ph: {order.customerPhone}</span>}
              </div>
            )}
            {payment?.referenceId && (
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Txn Ref: {payment.referenceId}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-2.5 border-b border-dashed border-gray-300">
            <div className="flex justify-between text-[11px] font-bold text-gray-900 pb-1.5 border-b border-gray-200">
              <span className="w-1/2">Item Description</span>
              <span className="w-12 text-center">Qty</span>
              <span className="w-16 text-right">Rate</span>
              <span className="w-16 text-right">Amount</span>
            </div>
            <div className="divide-y divide-gray-100 pt-1">
              {order.items.map((it, idx) => (
                <div key={idx} className="py-1 flex justify-between text-[11px]">
                  <div className="w-1/2 pr-1">
                    <span className="text-gray-900 font-medium">{it.name}</span>
                    {it.modifiers && it.modifiers.length > 0 && (
                      <span className="block text-[9px] text-gray-500">
                        {it.modifiers.map(m => m.optionName).join(', ')}
                      </span>
                    )}
                  </div>
                  <span className="w-12 text-center text-gray-700">{it.quantity}</span>
                  <span className="w-16 text-right text-gray-700">₹{it.unitPrice.toFixed(2)}</span>
                  <span className="w-16 text-right font-medium text-gray-900">₹{it.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Breakdown & Calculations */}
          <div className="py-2.5 border-b border-dashed border-gray-300 space-y-1 text-gray-800 text-[11px]">
            <div className="flex justify-between">
              <span>Item Subtotal:</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount / Promo:</span>
                <span>-₹{order.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600 text-[10px]">
              <span>CGST @ 2.5%:</span>
              <span>₹{cgst}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-[10px]">
              <span>SGST @ 2.5%:</span>
              <span>₹{sgst}</span>
            </div>

            {order.serviceCharge > 0 && (
              <div className="flex justify-between text-gray-600 text-[10px]">
                <span>Service Charge:</span>
                <span>₹{order.serviceCharge.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs font-bold text-gray-900 pt-1.5 border-t border-gray-200">
              <span>NET PAYABLE:</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="py-2.5 border-b border-dashed border-gray-300 space-y-1 text-gray-700 text-[11px]">
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className="font-bold text-gray-900 uppercase">{order.paymentStatus}</span>
            </div>
            {order.paymentMethod && (
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-semibold">{order.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-3 text-center text-[10px] text-gray-500 font-sans space-y-0.5">
            <p className="font-semibold text-gray-700">Thank you for dining with us!</p>
            <p>Visit us again at {settings.name}</p>
            <p className="text-[9px] text-gray-400">Computer Generated Tax Invoice</p>
          </div>
        </div>

        {/* Footer actions (no-print) */}
        <div className="px-4 py-2.5 border-t border-gray-200 bg-white flex items-center justify-between no-print">
          <button
            onClick={() => {
              const text = `Bill ${order.orderNumber} Total: ₹${order.totalAmount.toFixed(2)}`;
              navigator.clipboard?.writeText(text);
              alert('Invoice text copied to clipboard!');
            }}
            className="text-xs text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Copy Text</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Tax Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors border border-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
