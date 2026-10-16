import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Search,
  Filter,
  Eye,
  Printer,
  XCircle,
  RotateCcw,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  Download,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

interface OrdersPageProps {
  onNavigate: (pageId: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const {
    orders,
    tables,
    updateOrderStatus,
    cancelOrder,
    processRefund,
    hasPermission,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('All');
  const [payFilter, setPayFilter] = useState('All');

  // Modals & Details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const tabs = ['All', 'New', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled', 'Refunded'];

  const filteredOrders = orders.filter(o => {
    if (activeTab !== 'All' && o.status !== activeTab) return false;
    if (channelFilter !== 'All' && o.source !== channelFilter) return false;
    if (payFilter !== 'All' && o.paymentStatus !== payFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.tableNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handlePrintReceipt = (order: Order) => {
    setReceiptOrder(order);
    setReceiptModalOpen(true);
  };

  const handleStatusTransition = (orderId: string, nextStatus: OrderStatus) => {
    updateOrderStatus(orderId, nextStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Order Management & Dispatch
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track dining tickets across table sessions, QR orders, counter takeaways, and settlements
          </p>
        </div>

        <button
          onClick={() => onNavigate('pos')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
        >
          <Receipt className="w-4 h-4" />
          <span>New POS Order</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-2 overflow-x-auto pb-1 text-xs">
          {tabs.map(tab => {
            const count = tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 font-bold whitespace-nowrap rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
                  isActive
                    ? 'border-[#f5764b] text-orange-950 bg-orange-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span>{tab} Orders</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-[#f5764b] text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search order #, guest, or table..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none"
          >
            <option value="All">All Channels</option>
            <option value="Dine-in">Dine-in</option>
            <option value="QR Order">QR Ordering</option>
            <option value="Takeaway">Takeaway</option>
          </select>

          <select
            value={payFilter}
            onChange={(e) => setPayFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none"
          >
            <option value="All">All Payment States</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid (Due)</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    No orders found matching selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{order.orderNumber}</td>
                    <td className="py-3 px-4 text-gray-500">{order.createdAt}</td>
                    <td className="py-3 px-4">
                      {order.tableNumber ? (
                        <span className="font-bold text-orange-950 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                          Table {order.tableNumber}
                        </span>
                      ) : (
                        <span className="font-medium text-gray-800">{order.customerName || 'Walk-in'}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-gray-100 font-medium text-gray-700">
                        {order.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-gray-800">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} items
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      ₹{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'New' ? 'bg-orange-100 text-orange-950' :
                        order.status === 'Preparing' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'Ready' ? 'bg-green-100 text-green-800' :
                        order.status === 'Served' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 border border-green-200' :
                        order.paymentStatus === 'Refunded' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Status workflow quick buttons */}
                        {order.status === 'New' && (
                          <button
                            onClick={() => handleStatusTransition(order.id, 'Preparing')}
                            className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-[10px]"
                            title="Send order to kitchen preparation"
                          >
                            To Kitchen
                          </button>
                        )}
                        {order.status === 'Preparing' && (
                          <button
                            onClick={() => handleStatusTransition(order.id, 'Ready')}
                            className="px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[10px]"
                            title="Mark order ready to serve"
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === 'Ready' && (
                          <button
                            onClick={() => handleStatusTransition(order.id, 'Served')}
                            className="px-2 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-[10px]"
                            title="Mark served at table"
                          >
                            Mark Served
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setDetailModalOpen(true);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-800 rounded"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(order)}
                          className="p-1 text-gray-500 hover:text-gray-800 rounded"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal / Drawer */}
      {detailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="font-bold text-base text-gray-900">{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-gray-500">
                  {selectedOrder.source} • Table: {selectedOrder.tableNumber || 'N/A'} • Cashier: {selectedOrder.cashierName || 'Staff'}
                </p>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Status Timeline */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">
                  Order Status Progression
                </span>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className={['New', 'Preparing', 'Ready', 'Served', 'Completed'].includes(selectedOrder.status) ? 'text-[#e05a2b]' : 'text-gray-400'}>
                    ● Received
                  </span>
                  <span>→</span>
                  <span className={['Preparing', 'Ready', 'Served', 'Completed'].includes(selectedOrder.status) ? 'text-amber-700' : 'text-gray-400'}>
                    ● Preparing
                  </span>
                  <span>→</span>
                  <span className={['Ready', 'Served', 'Completed'].includes(selectedOrder.status) ? 'text-green-700' : 'text-gray-400'}>
                    ● Ready
                  </span>
                  <span>→</span>
                  <span className={['Served', 'Completed'].includes(selectedOrder.status) ? 'text-purple-700' : 'text-gray-400'}>
                    ● Served
                  </span>
                  <span>→</span>
                  <span className={selectedOrder.status === 'Completed' ? 'text-orange-950 font-extrabold' : 'text-gray-400'}>
                    ● Settled
                  </span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Itemized Check</span>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl p-3 bg-white space-y-2">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="pt-2 first:pt-0 flex justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{item.quantity}x {item.name}</p>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <p className="text-[10px] text-gray-500">
                            {item.modifiers.map(m => m.optionName).join(', ')}
                          </p>
                        )}
                        {item.notes && <p className="text-[10px] text-amber-700 italic">Note: {item.notes}</p>}
                      </div>
                      <span className="font-bold text-gray-900">₹{item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Discount:</span>
                    <span>-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (5%):</span>
                  <span>₹{selectedOrder.taxAmount.toFixed(2)}</span>
                </div>
                {selectedOrder.serviceCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Service Charge (5%):</span>
                    <span>₹{selectedOrder.serviceCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm text-gray-900 pt-1.5 border-t border-gray-200">
                  <span>Total Amount:</span>
                  <span className="text-orange-950">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex flex-wrap gap-2">
                {selectedOrder.status !== 'Completed' && selectedOrder.status !== 'Cancelled' && (
                  <>
                    <button
                      onClick={() => handleStatusTransition(selectedOrder.id, 'Completed')}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs"
                    >
                      Complete Order
                    </button>
                    <button
                      onClick={() => {
                        setDetailModalOpen(false);
                        setCancelModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold text-xs"
                    >
                      Cancel Order
                    </button>
                  </>
                )}

                {selectedOrder.paymentStatus === 'Paid' && (
                  <button
                    onClick={() => {
                      setDetailModalOpen(false);
                      setRefundModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg font-bold text-xs"
                  >
                    Initiate Refund
                  </button>
                )}

                <button
                  onClick={() => handlePrintReceipt(selectedOrder)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={(reason) => {
          if (selectedOrder) {
            cancelOrder(selectedOrder.id, reason || 'Order cancelled by staff');
          }
        }}
        title="Cancel Dining Order"
        message={`Are you sure you want to cancel order ${selectedOrder?.orderNumber}? If dine-in, table will be marked Available.`}
        confirmText="Confirm Cancel"
        requireReason={true}
        reasonPlaceholder="Provide cancellation reason (e.g. Guest left, item mistake)..."
      />

      {/* Refund Confirmation Modal */}
      <ConfirmationModal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        onConfirm={(reason) => {
          if (selectedOrder) {
            processRefund({
              paymentId: `pay-ref-${selectedOrder.id}`,
              orderId: selectedOrder.id,
              orderNumber: selectedOrder.orderNumber,
              amount: selectedOrder.totalAmount,
              reason: reason || 'Customer refund requested',
              authorizedBy: `${currentUser.name} (${currentUser.role})`,
              status: 'Completed'
            });
            alert(`Refund of ₹${selectedOrder.totalAmount.toFixed(2)} recorded.`);
          }
        }}
        title="Authorize Order Refund"
        message={`Confirm refund of ₹${selectedOrder?.totalAmount.toFixed(2)} for ${selectedOrder?.orderNumber}?`}
        confirmText="Process Refund"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Reason for refund (e.g. food quality issue, customer return)..."
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        order={receiptOrder}
      />
    </div>
  );
};
