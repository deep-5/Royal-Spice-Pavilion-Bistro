import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Send,
  PackageCheck,
  Printer,
  Eye,
  Trash2,
  AlertTriangle,
  Building2,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PurchaseOrder, PurchaseOrderItem } from '../../types';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

interface PurchaseOrdersPageProps {
  onNavigate: (pageId: string) => void;
}

export const PurchaseOrdersPage: React.FC<PurchaseOrdersPageProps> = ({ onNavigate }) => {
  const {
    purchaseOrders,
    suppliers,
    inventory,
    createPurchaseOrder,
    approvePurchaseOrder,
    rejectPurchaseOrder,
    sendPurchaseOrder,
    receiveGoods,
    hasPermission,
    currentBranchId
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [viewDetailModalOpen, setViewDetailModalOpen] = useState(false);

  // Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [expectedDate, setExpectedDate] = useState('2026-10-18');
  const [poNotes, setPoNotes] = useState('');
  const [lineItems, setLineItems] = useState<PurchaseOrderItem[]>([]);

  // Item selector for PO
  const [selectedInvId, setSelectedInvId] = useState(inventory[0]?.id || '');
  const [itemQty, setItemQty] = useState(10);

  // Goods receipt inputs: { itemId: { received: number, rejected: number } }
  const [receiptInputs, setReceiptInputs] = useState<Record<string, { received: number; rejected: number }>>({});

  useEffect(() => {
    const preselectSup = localStorage.getItem('rms_preselect_supplier');
    if (preselectSup) {
      setSupplierId(preselectSup);
      setCreateModalOpen(true);
      localStorage.removeItem('rms_preselect_supplier');
    }
  }, []);

  const tabs = ['All', 'Pending Approval', 'Approved', 'Sent', 'Partially Received', 'Received', 'Cancelled'];

  const filteredPOs = purchaseOrders.filter(po => {
    if (activeTab !== 'All' && po.status !== activeTab) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return po.poNumber.toLowerCase().includes(q) || po.supplierName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleAddLineItem = () => {
    const inv = inventory.find(i => i.id === selectedInvId);
    if (!inv || itemQty <= 0) return;

    const lineTotal = +(inv.unitCost * itemQty).toFixed(2);
    setLineItems(prev => [
      ...prev,
      {
        inventoryItemId: inv.id,
        name: inv.name,
        quantity: itemQty,
        unit: inv.unit,
        unitCost: inv.unitCost,
        lineTotal,
        receivedQuantity: 0
      }
    ]);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === supplierId);
    if (!sup || lineItems.length === 0) {
      alert('Please select a supplier and add at least one line item.');
      return;
    }

    const subtotal = lineItems.reduce((s, i) => s + i.lineTotal, 0);
    const tax = +(subtotal * 0.05).toFixed(2);
    const totalAmount = +(subtotal + tax).toFixed(2);

    createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      branchId: currentBranchId,
      items: lineItems,
      subtotal,
      tax,
      totalAmount,
      orderDate: new Date().toISOString().substring(0, 10),
      expectedDeliveryDate: expectedDate,
      notes: poNotes
    });

    setCreateModalOpen(false);
    setLineItems([]);
    setPoNotes('');
  };

  const handleOpenReceive = (po: PurchaseOrder) => {
    setSelectedPO(po);
    const initialInputs: Record<string, { received: number; rejected: number }> = {};
    po.items.forEach(item => {
      const remaining = Math.max(0, item.quantity - item.receivedQuantity);
      initialInputs[item.inventoryItemId] = { received: remaining, rejected: 0 };
    });
    setReceiptInputs(initialInputs);
    setReceiveModalOpen(true);
  };

  const handleConfirmReceipt = () => {
    if (!selectedPO) return;

    const itemsReceived = Object.entries(receiptInputs).map(([itemId, val]) => ({
      inventoryItemId: itemId,
      receivedQty: val.received,
      rejectedQty: val.rejected
    }));

    receiveGoods(selectedPO.id, itemsReceived);
    setReceiveModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Purchase Orders (Procurement)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Supplier requisitions, approval gates, dispatch tracking, and warehouse goods receipts
          </p>
        </div>

        <button
          onClick={() => {
            setLineItems([]);
            setCreateModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 no-print">
        <nav className="flex space-x-2 overflow-x-auto pb-1 text-xs">
          {tabs.map(tab => {
            const count = tab === 'All' ? purchaseOrders.length : purchaseOrders.filter(p => p.status === tab).length;
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
                <span>{tab}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-[#f5764b] text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs no-print">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search PO # or supplier..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none"
          />
        </div>

        <button
          onClick={() => onNavigate('goods-received')}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold flex items-center gap-1"
        >
          <PackageCheck className="w-3.5 h-3.5 text-[#f5764b]" />
          <span>Goods Received Registry →</span>
        </button>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden print-area">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Expected Delivery</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPOs.map(po => (
                <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">{po.poNumber}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{po.supplierName}</td>
                  <td className="py-3 px-4 text-gray-500">{po.orderDate}</td>
                  <td className="py-3 px-4 text-gray-500">{po.expectedDeliveryDate}</td>
                  <td className="py-3 px-4 font-black text-gray-900">₹{po.totalAmount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      po.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                      po.approvalStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {po.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      po.status === 'Received' ? 'bg-green-50 text-green-700 border border-green-200' :
                      po.status === 'Partially Received' ? 'bg-orange-50 text-[#e05a2b] border border-orange-200' :
                      po.status === 'Sent' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right no-print">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Approval gate for authorized roles */}
                      {po.approvalStatus === 'Pending' && (
                        <>
                          <button
                            onClick={() => approvePurchaseOrder(po.id)}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[10px]"
                            title="Approve PO"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPO(po);
                              setRejectModalOpen(true);
                            }}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded font-bold text-[10px]"
                            title="Reject PO"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* Send to supplier */}
                      {po.status === 'Approved' && (
                        <button
                          onClick={() => sendPurchaseOrder(po.id)}
                          className="px-2 py-1 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded font-bold text-[10px] flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send PO</span>
                        </button>
                      )}

                      {/* Receive Items */}
                      {(po.status === 'Sent' || po.status === 'Partially Received') && (
                        <button
                          onClick={() => handleOpenReceive(po)}
                          className="px-2 py-1 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded font-bold text-[10px] flex items-center gap-1"
                        >
                          <PackageCheck className="w-3 h-3" />
                          <span>Receive Goods</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedPO(po);
                          setViewDetailModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded"
                        title="View PO Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => window.print()}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded"
                        title="Print PO"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Purchase Order Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30  overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-base text-gray-900">Create Purchase Requisition</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Select Supplier *</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.paymentTerms})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  />
                </div>
              </div>

              {/* Add Line Items Section */}
              <div className="pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-800 block mb-1.5">Add Ingredients / Supplies</span>
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedInvId}
                    onChange={(e) => setSelectedInvId(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg outline-none bg-white text-xs"
                  >
                    {inventory.map(i => (
                      <option key={i.id} value={i.id}>{i.name} (₹{i.unitCost}/{i.unit})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={itemQty}
                    onChange={(e) => setItemQty(Number(e.target.value))}
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg outline-none"
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-3 py-1.5 bg-[#f5764b] text-white rounded-lg font-bold"
                  >
                    + Add Line
                  </button>
                </div>

                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {lineItems.map((li, idx) => (
                    <div key={idx} className="p-2 rounded bg-gray-50 border border-gray-200 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-gray-900">{li.name}</span>
                        <span className="text-gray-500 ml-2">({li.quantity} {li.unit} @ ₹{li.unitCost})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">₹{li.lineTotal.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Procurement Notes</label>
                <textarea
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Ensure cold chain for dairy and meat..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg font-bold shadow-xs"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Goods Dialog */}
      {receiveModalOpen && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              Receive Goods: {selectedPO.poNumber} ({selectedPO.supplierName})
            </h3>
            <p className="text-xs text-gray-500">
              Record accepted and damaged quantities. Only actually accepted quantities will update warehouse stock.
            </p>

            <div className="space-y-3 max-h-64 overflow-y-auto text-xs">
              {selectedPO.items.map(item => {
                const currentVal = receiptInputs[item.inventoryItemId] || { received: 0, rejected: 0 };
                return (
                  <div key={item.inventoryItemId} className="p-3 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                    <div className="flex justify-between items-baseline font-bold text-gray-900">
                      <span>{item.name}</span>
                      <span className="text-[11px] text-gray-500">Ordered: {item.quantity} {item.unit}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-green-800">Accepted Quantity</label>
                        <input
                          type="number"
                          step="0.1"
                          value={currentVal.received}
                          onChange={(e) => setReceiptInputs(prev => ({
                            ...prev,
                            [item.inventoryItemId]: { ...currentVal, received: Number(e.target.value) }
                          }))}
                          className="w-full px-2.5 py-1 border border-gray-300 rounded bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-red-800">Damaged / Rejected</label>
                        <input
                          type="number"
                          step="0.1"
                          value={currentVal.rejected}
                          onChange={(e) => setReceiptInputs(prev => ({
                            ...prev,
                            [item.inventoryItemId]: { ...currentVal, rejected: Number(e.target.value) }
                          }))}
                          className="w-full px-2.5 py-1 border border-gray-300 rounded bg-white font-bold"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setReceiveModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReceipt}
                className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg text-xs font-bold"
              >
                Confirm Goods Inflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PO View Detail Modal */}
      {viewDetailModalOpen && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedPO.poNumber}</h3>
                <p className="text-xs text-gray-500">{selectedPO.supplierName} • {selectedPO.orderDate}</p>
              </div>
              <button onClick={() => setViewDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl p-3 bg-gray-50">
                {selectedPO.items.map((i, idx) => (
                  <div key={idx} className="py-2 first:pt-0 flex justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{i.name}</p>
                      <p className="text-[10px] text-gray-500">
                        Ordered: {i.quantity} {i.unit} • Received: {i.receivedQuantity} {i.unit}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">₹{i.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <div className="flex justify-between"><span>Subtotal:</span><span>₹{selectedPO.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax (5%):</span><span>₹{selectedPO.tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total Amount:</span><span>₹{selectedPO.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Print PO
              </button>
              <button
                onClick={() => setViewDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject PO Confirmation Modal */}
      <ConfirmationModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={(reason) => {
          if (selectedPO) {
            rejectPurchaseOrder(selectedPO.id, reason || 'PO rejected by manager');
          }
        }}
        title="Reject Purchase Order"
        message={`Are you sure you want to reject PO ${selectedPO?.poNumber}?`}
        confirmText="Confirm Rejection"
        requireReason={true}
        reasonPlaceholder="Specify reason for rejecting purchase request..."
      />
    </div>
  );
};
