import React, { useState } from 'react';
import {
  TableProperties,
  Plus,
  Users,
  Clock,
  Receipt,
  UtensilsCrossed,
  Sparkles,
  ArrowRightLeft,
  Merge,
  Split,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Table, TableStatus } from '../../types';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

interface FloorPlanPageProps {
  onNavigate: (pageId: string) => void;
  onOpenPOSWithTable?: (tableId: string) => void;
}

export const FloorPlanPage: React.FC<FloorPlanPageProps> = ({ onNavigate }) => {
  const {
    tables,
    orders,
    reservations,
    updateTableStatus,
    addTable,
    updateTable,
    transferTable,
    mergeTables,
    splitTable,
    currentBranchId
  } = useApp();

  const [sectionFilter, setSectionFilter] = useState<'All' | 'Indoor' | 'Outdoor Terrace' | 'Bar Lounge' | 'Private Dining'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Modals
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [targetTableId, setTargetTableId] = useState('');

  // Add Table Form
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState(4);
  const [newSection, setNewSection] = useState<'Indoor' | 'Outdoor Terrace' | 'Bar Lounge' | 'Private Dining'>('Indoor');

  // Filtered tables
  const filteredTables = tables.filter(t => {
    if (sectionFilter !== 'All' && t.section !== sectionFilter) return false;
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    return true;
  });

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-green-50 border-green-300 text-green-800 hover:border-green-400';
      case 'Reserved':
        return 'bg-orange-50 border-orange-300 text-orange-950 hover:border-[#f5764b]';
      case 'Seated':
        return 'bg-amber-50 border-amber-300 text-amber-800 hover:border-amber-400';
      case 'Ordering':
        return 'bg-purple-50 border-purple-300 text-purple-800 hover:border-purple-400';
      case 'Occupied':
        return 'bg-red-50 border-red-300 text-red-800 hover:border-red-400';
      case 'Bill Requested':
        return 'bg-indigo-50 border-indigo-300 text-indigo-800 hover:border-indigo-400';
      case 'Cleaning':
        return 'bg-orange-50 border-orange-300 text-orange-950 hover:border-[#f5764b]';
      case 'Out of Service':
        return 'bg-gray-100 border-gray-300 text-gray-500';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const activeOrder = selectedTable?.currentOrderId ? orders.find(o => o.id === selectedTable.currentOrderId) : null;
  const linkedReservation = selectedTable?.reservationId ? reservations.find(r => r.id === selectedTable.reservationId) : null;

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;

    // Check duplicate table number
    if (tables.some(t => t.number.toLowerCase() === newTableNumber.toLowerCase().trim())) {
      alert(`Table ${newTableNumber} already exists.`);
      return;
    }

    addTable({
      number: newTableNumber.trim(),
      capacity: newCapacity,
      section: newSection,
      status: 'Available',
      branchId: currentBranchId
    });

    setIsAddTableOpen(false);
    setNewTableNumber('');
  };

  const handleStartOrder = (table: Table) => {
    // Navigate to POS and set active table
    localStorage.setItem('rms_pos_preselect_table', table.id);
    onNavigate('pos');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Floor Plan & Table Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time table occupancy, elapsed dining timers, orders, transfers, and bill requests
          </p>
        </div>

        <button
          onClick={() => setIsAddTableOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Table</span>
        </button>
      </div>

      {/* Legend & Status Badges */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-gray-400 uppercase text-[10px] mr-1">Status:</span>
          <span className="flex items-center gap-1.5 font-medium text-green-700">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Available ({tables.filter(t => t.status === 'Available').length})
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#e05a2b]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f5764b]" /> Reserved ({tables.filter(t => t.status === 'Reserved').length})
          </span>
          <span className="flex items-center gap-1.5 font-medium text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Seated ({tables.filter(t => t.status === 'Seated').length})
          </span>
          <span className="flex items-center gap-1.5 font-medium text-red-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Occupied ({tables.filter(t => t.status === 'Occupied').length})
          </span>
          <span className="flex items-center gap-1.5 font-medium text-indigo-700">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Bill Requested ({tables.filter(t => t.status === 'Bill Requested').length})
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#e05a2b]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f5764b]" /> Cleaning ({tables.filter(t => t.status === 'Cleaning').length})
          </span>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-semibold">
          {(['All', 'Indoor', 'Outdoor Terrace', 'Bar Lounge', 'Private Dining'] as const).map(sec => (
            <button
              key={sec}
              onClick={() => setSectionFilter(sec)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sectionFilter === sec ? 'bg-white text-gray-900 font-bold shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Main Floor Grid & Side Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Floor Cards (responsive 1-2-3 cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredTables.map((table) => {
            const isSelected = selectedTable?.id === table.id;
            const tableOrder = orders.find(o => o.id === table.currentOrderId);

            return (
              <div
                key={table.id}
                onClick={() => {
                  setSelectedTable(table);
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setTimeout(() => {
                      document.getElementById('table-action-panel')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between h-44 shadow-2xs hover:shadow-xs ${getStatusColor(table.status)} ${
                  isSelected ? 'ring-2 ring-[#f5764b] ring-offset-2' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">{table.number}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/80 shadow-2xs border border-black/5">
                      {table.capacity} Guests
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-1 font-medium">{table.section}</p>

                  {table.mergedWith && table.mergedWith.length > 0 && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                      Merged with {table.mergedWith.map(id => tables.find(t => t.id === id)?.number).join(', ')}
                    </span>
                  )}
                </div>

                {/* Middle details */}
                <div className="my-1">
                  {table.status === 'Occupied' || table.status === 'Bill Requested' || table.status === 'Seated' ? (
                    <div className="text-xs space-y-0.5">
                      {tableOrder && (
                        <p className="font-bold text-gray-900 truncate">
                          {tableOrder.orderNumber} • ₹{tableOrder.totalAmount.toFixed(2)}
                        </p>
                      )}
                      {table.seatedAt && (
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" /> Seated at {table.seatedAt}
                        </p>
                      )}
                      {table.assignedServer && (
                        <p className="text-[10px] text-gray-600 truncate">
                          Server: {table.assignedServer}
                        </p>
                      )}
                    </div>
                  ) : table.status === 'Reserved' ? (
                    <div className="text-xs">
                      <p className="font-bold text-orange-950">Reserved</p>
                      <p className="text-[10px] text-[#e05a2b]">Check-in due</p>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-green-800">Ready for Seating</p>
                  )}
                </div>

                {/* Footer status pill */}
                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-[10px]">
                    {table.status}
                  </span>
                  <span className="font-bold text-orange-950 hover:underline">Details →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Table Details Drawer / Action Panel */}
        <div id="table-action-panel" className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs h-fit sticky top-20 space-y-5">
          {selectedTable ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Table {selectedTable.number}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedTable.section} • Capacity: {selectedTable.capacity} guests
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(selectedTable.status)}`}>
                  {selectedTable.status}
                </span>
              </div>

              {/* Status Change Quick Actions */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-2">
                  Update Table Status
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => updateTableStatus(selectedTable.id, 'Available')}
                    className="p-2 rounded-lg border border-green-300 bg-green-50 text-green-800 font-bold hover:bg-green-100"
                  >
                    Mark Available
                  </button>
                  <button
                    onClick={() => updateTableStatus(selectedTable.id, 'Cleaning')}
                    className="p-2 rounded-lg border border-orange-300 bg-orange-50 text-orange-950 font-bold hover:bg-orange-100"
                  >
                    Mark Cleaning
                  </button>
                  <button
                    onClick={() => updateTableStatus(selectedTable.id, 'Bill Requested')}
                    className="p-2 rounded-lg border border-indigo-300 bg-indigo-50 text-indigo-800 font-bold hover:bg-indigo-100"
                  >
                    Request Bill
                  </button>
                  <button
                    onClick={() => updateTableStatus(selectedTable.id, 'Out of Service')}
                    className="p-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                  >
                    Out of Service
                  </button>
                </div>
              </div>

              {/* Active Order Breakdown */}
              {activeOrder ? (
                <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-2 text-xs">
                  <div className="flex justify-between items-baseline font-bold text-gray-900 pb-1.5 border-b border-gray-200">
                    <span>Order {activeOrder.orderNumber}</span>
                    <span className="text-[#e05a2b]">₹{activeOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pt-1">
                    {activeOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between text-gray-700 text-[11px]">
                        <span>{item.quantity}x {item.name}</span>
                        <span>₹{item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={() => handleStartOrder(selectedTable)}
                      className="flex-1 py-1.5 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg font-bold text-xs"
                    >
                      + Add Items in POS
                    </button>
                    <button
                      onClick={() => onNavigate('pos')}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs"
                    >
                      Settle Bill
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-dashed border-gray-200 text-center space-y-2">
                  <p className="text-xs text-gray-500">No active dining order linked to this table.</p>
                  <button
                    onClick={() => handleStartOrder(selectedTable)}
                    className="w-full py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg font-bold text-xs shadow-xs"
                  >
                    Start Order for {selectedTable.number} →
                  </button>
                </div>
              )}

              {/* Table Movement Actions (Transfer, Merge, Split) */}
              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                <span className="block font-bold uppercase text-gray-400 text-[11px]">Operations</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTransferModalOpen(true)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold flex flex-col items-center gap-1 text-gray-700"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-[#f5764b]" />
                    <span>Transfer</span>
                  </button>
                  <button
                    onClick={() => setMergeModalOpen(true)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold flex flex-col items-center gap-1 text-gray-700"
                  >
                    <Merge className="w-4 h-4 text-purple-600" />
                    <span>Merge</span>
                  </button>
                  <button
                    onClick={() => {
                      splitTable(selectedTable.id);
                      alert(`Unlinked any merged tables with ${selectedTable.number}`);
                    }}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold flex flex-col items-center gap-1 text-gray-700"
                  >
                    <Split className="w-4 h-4 text-amber-600" />
                    <span>Split</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-gray-400">
              <TableProperties className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-gray-600">Select a Table</p>
              <p className="text-xs text-gray-400 mt-1">Click any table on the left to view active order details and perform actions</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Table Modal */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">Add New Dining Table</h3>

            <form onSubmit={handleAddTableSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Table Number *</label>
                <input
                  type="text"
                  required
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="e.g. T-12, B-04, PDR-03"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Seating Capacity (Guests)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Section</label>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                >
                  <option value="Indoor">Indoor Dining</option>
                  <option value="Outdoor Terrace">Outdoor Terrace</option>
                  <option value="Bar Lounge">Bar Lounge</option>
                  <option value="Private Dining">Private Dining Room</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTableOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg font-bold shadow-xs"
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Table Modal */}
      {transferModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              Transfer Table {selectedTable.number}
            </h3>
            <p className="text-xs text-gray-500">
              Select destination table to transfer current guests and order:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {tables.filter(t => t.id !== selectedTable.id && t.status === 'Available').map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    transferTable(selectedTable.id, t.id);
                    setTransferModalOpen(false);
                    setSelectedTable(t);
                    alert(`Order & guests successfully transferred to Table ${t.number}`);
                  }}
                  className="p-3 rounded-lg border border-gray-200 hover:border-[#f5764b] hover:bg-orange-50 cursor-pointer flex justify-between items-center text-xs"
                >
                  <span className="font-bold text-gray-900">{t.number} ({t.section} • {t.capacity}p)</span>
                  <span className="px-2 py-0.5 rounded bg-[#f5764b] text-white font-bold text-[10px]">
                    Transfer Here
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setTransferModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Tables Modal */}
      {mergeModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              Merge Table {selectedTable.number}
            </h3>
            <p className="text-xs text-gray-500">
              Select an adjacent table to combine seating:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {tables.filter(t => t.id !== selectedTable.id && t.section === selectedTable.section).map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    mergeTables(selectedTable.id, t.id);
                    setMergeModalOpen(false);
                    alert(`Tables ${selectedTable.number} and ${t.number} merged! Combined capacity: ${selectedTable.capacity + t.capacity}`);
                  }}
                  className="p-3 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 cursor-pointer flex justify-between items-center text-xs"
                >
                  <span className="font-bold text-gray-900">{t.number} (Status: {t.status})</span>
                  <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-bold text-[10px]">
                    Combine Seating
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setMergeModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
