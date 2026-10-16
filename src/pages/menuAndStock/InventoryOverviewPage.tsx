import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Package,
  Layers,
  ArrowRightLeft,
  Trash2,
  Calculator,
  Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem, StockMovement } from '../../types';

interface InventoryOverviewPageProps {
  onNavigate: (pageId: string) => void;
}

export const InventoryOverviewPage: React.FC<InventoryOverviewPageProps> = ({ onNavigate }) => {
  const {
    inventory,
    suppliers,
    addInventoryItem,
    updateInventoryItem,
    adjustStock,
    currentBranchId
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [countModalOpen, setCountModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Add Item State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('Produce & Veg');
  const [stock, setStock] = useState<number>(10);
  const [unit, setUnit] = useState<InventoryItem['unit']>('kg');
  const [reorderLevel, setReorderLevel] = useState<number>(5);
  const [unitCost, setUnitCost] = useState<number>(150);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || 'sup-1');
  const [storageLocation, setStorageLocation] = useState('Main Walk-in Pantry');

  // Adjust Form State
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<StockMovement['type']>('Correction');
  const [adjustReason, setAdjustReason] = useState('');

  // Physical Count State
  const [countedQty, setCountedQty] = useState<number>(0);
  const [countNotes, setCountNotes] = useState('');

  // Totals
  const totalValuation = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = inventory.filter(i => i.status === 'Out of Stock').length;

  const filteredInventory = inventory.filter(item => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setName('');
    setSku(`STK-${Math.floor(Math.random() * 900 + 100)}`);
    setStock(10);
    setReorderLevel(5);
    setUnitCost(150);
    setStorageLocation('Dry Pantry Shelf');
    setAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const supplier = suppliers.find(s => s.id === supplierId);

    addInventoryItem({
      name: name.trim(),
      sku: sku.trim(),
      category,
      currentStock: stock,
      unit,
      reorderLevel,
      unitCost,
      supplierId,
      supplierName: supplier?.name || 'Local Vendor',
      storageLocation,
      branchId: currentBranchId
    });

    setAddModalOpen(false);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || adjustDelta === 0) return;

    adjustStock(
      selectedItem.id,
      adjustDelta,
      adjustReason || `${adjustType} manual update`,
      adjustType
    );

    setAdjustModalOpen(false);
    setAdjustDelta(0);
    setAdjustReason('');
  };

  const handleReconcileCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const diff = countedQty - selectedItem.currentStock;
    adjustStock(
      selectedItem.id,
      diff,
      `Physical Stock Count Reconciliation: Actual was ${countedQty} (diff ${diff > 0 ? '+' : ''}${diff})`,
      'Correction'
    );

    setCountModalOpen(false);
    alert(`Reconciled stock for ${selectedItem.name}! System count set to ${countedQty} ${selectedItem.unit}.`);
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Item Name,SKU,Category,Current Stock,Unit,Reorder Level,Unit Cost,Valuation,Supplier,Status\n" +
      filteredInventory.map(i => 
        `"${i.name}","${i.sku}","${i.category}",${i.currentStock},"${i.unit}",${i.reorderLevel},₹${i.unitCost},₹${(i.currentStock * i.unitCost).toFixed(2)},"${i.supplierName}","${i.status}"`
      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_valuation_${new Date().toISOString().substring(0, 10)}.csv`);
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
            Inventory & Stock Operations
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time warehouse ingredients, unit costs, reorder alerts, and physical reconciliation audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-gray-400">Total Stock Items</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{inventory.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-[#e05a2b]">Total Inventory Valuation</p>
          <p className="text-xl font-bold text-orange-950 mt-0.5">₹{totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-amber-600">Low Stock Reorders</p>
          <p className="text-xl font-bold text-amber-700 mt-0.5">{lowStockCount} items</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-red-600">Out of Stock (Zero)</p>
          <p className="text-xl font-bold text-red-700 mt-0.5">{outOfStockCount} items</p>
        </div>
      </div>

      {/* Filters & Actions Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stock item, SKU, or supplier..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Produce & Veg">Produce & Veg</option>
            <option value="Meat & Poultry">Meat & Poultry</option>
            <option value="Dairy">Dairy</option>
            <option value="Spices & Staples">Spices & Staples</option>
            <option value="Packaging">Packaging</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          <button
            onClick={() => onNavigate('stock-movements')}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold flex items-center gap-1 transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Movements Log</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Ingredient Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.storageLocation}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500">{item.sku}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{item.category}</td>
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-sm text-gray-900">
                      {item.currentStock} {item.unit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{item.reorderLevel} {item.unit}</td>
                  <td className="py-3 px-4 font-semibold text-gray-700">₹{item.unitCost}/{item.unit}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    ₹{(item.currentStock * item.unitCost).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.supplierName}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                      item.status === 'Low Stock' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setAdjustDelta(0);
                          setAdjustModalOpen(true);
                        }}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-semibold text-[10px]"
                        title="Adjust Quantity"
                      >
                        Adjust
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setCountedQty(item.currentStock);
                          setCountModalOpen(true);
                        }}
                        className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-950 rounded font-semibold text-[10px]"
                        title="Physical Stock Count"
                      >
                        Audit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Item Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">Add Inventory Stock Item</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Saffron Strands"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Produce & Veg">Produce & Veg</option>
                    <option value="Meat & Poultry">Meat & Poultry</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Spices & Staples">Spices & Staples</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Opening Stock</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Unit of Measure</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="g">g (Gram)</option>
                    <option value="L">L (Litre)</option>
                    <option value="ml">ml (Millilitre)</option>
                    <option value="pcs">pcs (Pieces)</option>
                    <option value="packs">packs (Packets)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Reorder Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Preferred Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="e.g. Dairy Chiller A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg font-bold shadow-xs"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Quantity Modal */}
      {adjustModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              Adjust Stock: {selectedItem.name}
            </h3>
            <p className="text-xs text-gray-500">
              Current system balance: <span className="font-bold text-gray-800">{selectedItem.currentStock} {selectedItem.unit}</span>
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                >
                  <option value="Correction">Manual Inventory Correction</option>
                  <option value="Waste / Spoilage">Waste / Spoilage Deduction (-)</option>
                  <option value="Return">Supplier Return / Rejection (-)</option>
                  <option value="PO Received">Goods Received Manual (+)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Quantity Delta (+ to add, - to deduct)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  placeholder="e.g. -2.5 or +5.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason / Notes *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Reason for stock delta audit..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg font-bold shadow-xs"
                >
                  Apply Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Count Audit & Reconcile Modal */}
      {countModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              Physical Stock Count: {selectedItem.name}
            </h3>
            <p className="text-xs text-gray-500">
              Expected System Quantity: <span className="font-bold">{selectedItem.currentStock} {selectedItem.unit}</span>
            </p>

            <form onSubmit={handleReconcileCountSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Actual Physically Counted Quantity ({selectedItem.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={countedQty}
                  onChange={(e) => setCountedQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-bold text-base"
                />
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Variance Discrepancy:</span>
                  <span className={countedQty - selectedItem.currentStock < 0 ? 'text-red-600' : 'text-green-700'}>
                    {(countedQty - selectedItem.currentStock).toFixed(2)} {selectedItem.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Audit Notes</label>
                <input
                  type="text"
                  value={countNotes}
                  onChange={(e) => setCountNotes(e.target.value)}
                  placeholder="e.g. End of shift physical scale measurement"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCountModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg font-bold shadow-xs"
                >
                  Reconcile & Update Count
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
