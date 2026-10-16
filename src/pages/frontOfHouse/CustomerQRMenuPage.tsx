import React, { useState } from 'react';
import {
  Utensils,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  AlertCircle,
  BellRing,
  Receipt,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuItem, OrderItem, ModifierGroup, Order } from '../../types';

interface CustomerQRMenuPageProps {
  tableId?: string;
  onBackToDashboard: () => void;
}

export const CustomerQRMenuPage: React.FC<CustomerQRMenuPageProps> = ({ tableId: propTableId, onBackToDashboard }) => {
  const {
    settings,
    currentBranch,
    tables,
    menuCategories,
    menuItems,
    modifierGroups,
    createOrder,
    updateTableStatus,
    addNotification,
    orders
  } = useApp();

  const [activeTableId, setActiveTableId] = useState<string>(propTableId || tables[0]?.id || 't1');
  const activeTable = tables.find(t => t.id === activeTableId) || tables[0];

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [dietaryFilter, setDietaryFilter] = useState<'All' | 'Vegetarian' | 'Non-Veg' | 'Chef Special'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  interface CartEntry {
    cartId: string;
    item: MenuItem;
    quantity: number;
    selectedModifiers: { groupId: string; groupName: string; optionId: string; optionName: string; price: number }[];
    notes: string;
    totalPrice: number;
  }
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Item customization modal
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalModifiers, setModalModifiers] = useState<Record<string, string>>({});
  const [modalNotes, setModalNotes] = useState('');

  // Placed Order state for live tracking
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buzzerMessage, setBuzzerMessage] = useState<string | null>(null);

  // Filter items
  const filteredItems = menuItems.filter(item => {
    if (item.isArchived) return false;
    if (activeCategory !== 'All' && item.categoryId !== activeCategory) return false;
    if (dietaryFilter !== 'All' && !item.dietaryTags.includes(dietaryFilter as any)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  // Open item customization
  const handleItemClick = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setCustomizingItem(item);
    setModalQty(1);
    setModalNotes('');

    // Pre-select default options for required groups
    const defaults: Record<string, string> = {};
    if (item.modifierGroupIds) {
      item.modifierGroupIds.forEach(gid => {
        const group = modifierGroups.find(g => g.id === gid);
        if (group && group.options.length > 0) {
          const defaultOpt = group.options.find(o => o.isDefault) || group.options[0];
          defaults[group.id] = defaultOpt.id;
        }
      });
    }
    setModalModifiers(defaults);
  };

  const handleAddToCart = () => {
    if (!customizingItem) return;

    // Calculate modifier costs
    const selectedMods: CartEntry['selectedModifiers'] = [];
    let modExtra = 0;

    Object.entries(modalModifiers).forEach(([groupId, optionId]) => {
      const group = modifierGroups.find(g => g.id === groupId);
      const option = group?.options.find(o => o.id === optionId);
      if (group && option) {
        selectedMods.push({
          groupId: group.id,
          groupName: group.name,
          optionId: option.id,
          optionName: option.name,
          price: option.price
        });
        modExtra += option.price;
      }
    });

    const itemUnitPrice = customizingItem.price + modExtra;
    const itemTotalPrice = itemUnitPrice * modalQty;

    const newEntry: CartEntry = {
      cartId: `cart-${Date.now()}-${Math.random()}`,
      item: customizingItem,
      quantity: modalQty,
      selectedModifiers: selectedMods,
      notes: modalNotes,
      totalPrice: itemTotalPrice
    };

    setCart(prev => [...prev, newEntry]);
    setCustomizingItem(null);
  };

  // Cart calculations
  const subtotal = cart.reduce((sum, entry) => sum + entry.totalPrice, 0);
  const gst = +(subtotal * 0.05).toFixed(2);
  const serviceCharge = +(subtotal * 0.05).toFixed(2);
  const grandTotal = +(subtotal + gst + serviceCharge).toFixed(2);

  const handlePlaceOrder = () => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    // Build OrderItems with server-safe snapshot
    const orderItems: OrderItem[] = cart.map(c => ({
      id: `oi-${Date.now()}-${Math.random()}`,
      menuItemId: c.item.id,
      name: c.item.name,
      quantity: c.quantity,
      unitPrice: c.item.price,
      totalPrice: c.totalPrice,
      modifiers: c.selectedModifiers,
      notes: c.notes || undefined,
      status: 'Preparing',
      prepStation: c.item.prepStation
    }));

    const newOrder = createOrder({
      tableId: activeTable.id,
      tableNumber: activeTable.number,
      source: 'QR Order',
      customerName: `Table ${activeTable.number} Guest`,
      items: orderItems,
      subtotal,
      discountAmount: 0,
      taxAmount: gst,
      serviceCharge,
      totalAmount: grandTotal,
      specialInstructions: `Direct QR order submitted from ${activeTable.number}`
    }, true);

    setPlacedOrder(newOrder);
    setCart([]);
    setIsCartOpen(false);
    setIsSubmitting(false);
  };

  const handleCallStaff = () => {
    addNotification('order', `Table ${activeTable.number} Assistance Requested`, `Guest at table ${activeTable.number} pressed Call Attendant`, 'tables', activeTable.id);
    setBuzzerMessage(`Table attendant has been notified and is coming to Table ${activeTable.number}!`);
    setTimeout(() => setBuzzerMessage(null), 5000);
  };

  const handleRequestBill = () => {
    updateTableStatus(activeTable.id, 'Bill Requested');
    addNotification('payment', `Table ${activeTable.number} Requested Bill`, `Guest at table ${activeTable.number} is ready for check settlement`, 'orders');
    setBuzzerMessage(`Bill settlement requested! Cashier will bring the bill to Table ${activeTable.number}.`);
    setTimeout(() => setBuzzerMessage(null), 5000);
  };

  // Order tracking live lookup
  const currentLiveOrder = placedOrder ? orders.find(o => o.id === placedOrder.id) || placedOrder : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-28">
      {/* Top Banner (Simulated Mobile Container) */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToDashboard}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Return to Staff Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-extrabold text-sm text-gray-900 truncate tracking-tight">
                {settings.name}
              </h1>
              <p className="text-[11px] text-[#e05a2b] font-bold flex items-center gap-1">
                <span>{currentBranch.name}</span> • <span className="underline">Table {activeTable.number}</span>
              </p>
            </div>
          </div>

          {/* Table Switcher (for testing any table's QR session) */}
          <div className="flex items-center gap-2">
            <select
              value={activeTableId}
              onChange={(e) => {
                setActiveTableId(e.target.value);
                setPlacedOrder(null);
              }}
              className="text-[11px] font-bold bg-orange-50 border border-orange-300 text-orange-950 rounded-lg px-2 py-1 outline-none"
              title="Switch scanned table"
            >
              {tables.map(t => (
                <option key={t.id} value={t.id}>
                  {t.number} ({t.section})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Buzzer Toast */}
        {buzzerMessage && (
          <div className="bg-[#f5764b] text-white text-xs font-semibold px-4 py-2 text-center shadow-xs animate-in fade-in">
            {buzzerMessage}
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Active Order Live Tracker (if order placed) */}
        {currentLiveOrder && (
          <div className="bg-white rounded-2xl border-2 border-[#f5764b] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-[#f5764b] animate-ping" />
                <span className="font-bold text-xs text-gray-900">
                  Order {currentLiveOrder.orderNumber}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-100 text-orange-950">
                {currentLiveOrder.status}
              </span>
            </div>

            <div className="grid grid-cols-4 text-center text-[10px] font-bold gap-1 py-1">
              <div className="text-[#e05a2b]">
                <div className="h-1.5 w-full bg-[#f5764b] rounded-full mb-1" />
                Received
              </div>
              <div className={['Preparing', 'Ready', 'Served', 'Completed'].includes(currentLiveOrder.status) ? 'text-[#e05a2b]' : 'text-gray-300'}>
                <div className={`h-1.5 w-full rounded-full mb-1 ${['Preparing', 'Ready', 'Served', 'Completed'].includes(currentLiveOrder.status) ? 'bg-[#f5764b]' : 'bg-gray-200'}`} />
                Cooking
              </div>
              <div className={['Ready', 'Served', 'Completed'].includes(currentLiveOrder.status) ? 'text-[#e05a2b]' : 'text-gray-300'}>
                <div className={`h-1.5 w-full rounded-full mb-1 ${['Ready', 'Served', 'Completed'].includes(currentLiveOrder.status) ? 'bg-[#f5764b]' : 'bg-gray-200'}`} />
                Ready
              </div>
              <div className={['Served', 'Completed'].includes(currentLiveOrder.status) ? 'text-[#e05a2b]' : 'text-gray-300'}>
                <div className={`h-1.5 w-full rounded-full mb-1 ${['Served', 'Completed'].includes(currentLiveOrder.status) ? 'bg-[#f5764b]' : 'bg-gray-200'}`} />
                Served
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleCallStaff}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-[11px] font-bold text-gray-700 flex items-center gap-1 hover:bg-gray-50"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-600" />
                <span>Call Attendant</span>
              </button>
              <button
                onClick={handleRequestBill}
                className="px-3 py-1.5 rounded-lg bg-[#e05a2b] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#c84518]"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Request Bill</span>
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search our royal specialties..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none shadow-2xs focus:ring-1 focus:ring-[#f5764b]"
          />
        </div>

        {/* Dietary Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {(['All', 'Vegetarian', 'Non-Veg', 'Chef Special'] as const).map(tag => (
            <button
              key={tag}
              onClick={() => setDietaryFilter(tag)}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap text-xs transition-colors ${
                dietaryFilter === tag
                  ? 'bg-[#f5764b] text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {tag === 'Vegetarian' ? '🟢 Pure Veg' : tag === 'Non-Veg' ? '🔴 Non-Veg' : tag === 'Chef Special' ? '⭐ Chef Special' : 'All Items'}
            </button>
          ))}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
              activeCategory === 'All'
                ? 'bg-[#f5764b] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            All Menu
          </button>
          {menuCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-[#f5764b] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="space-y-3">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`bg-white rounded-2xl border border-gray-200 p-3 shadow-2xs flex gap-3 cursor-pointer transition-all hover:shadow-xs ${
                !item.isAvailable ? 'opacity-60 grayscale-50' : ''
              }`}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 rounded-xl object-cover shrink-0"
              />

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-bold text-xs text-gray-900 leading-tight">
                      {item.name}
                    </h3>
                    <span className="font-extrabold text-xs text-orange-950 shrink-0">
                      ₹{item.price}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-[10px]">
                    {item.dietaryTags.includes('Vegetarian') ? (
                      <span className="text-green-700 font-bold">🟢 Veg</span>
                    ) : (
                      <span className="text-red-700 font-bold">🔴 Non-Veg</span>
                    )}
                    {item.prepTimeMinutes && (
                      <span className="text-gray-400 flex items-center gap-0.5 ml-1">
                        <Clock className="w-2.5 h-2.5" /> {item.prepTimeMinutes}m
                      </span>
                    )}
                  </div>

                  {item.isAvailable ? (
                    <button className="px-3 py-1 bg-orange-50 hover:bg-[#f5764b] text-orange-950 hover:text-white rounded-lg font-bold text-xs border border-orange-200 transition-colors">
                      + Add
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-red-500">Sold Out</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#e05a2b] hover:bg-[#c84518] text-white rounded-2xl p-3.5 shadow-xs flex items-center justify-between font-bold text-xs transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-orange-950 text-xs">
                {cart.reduce((s, c) => s + c.quantity, 0)}
              </div>
              <span>View Table Order Cart</span>
            </div>
            <div className="flex items-center gap-1">
              <span>₹{grandTotal.toFixed(2)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Item Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/30  p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xs overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-6">
            <div className="relative">
              <img
                src={customizingItem.image}
                alt={customizingItem.name}
                className="w-full h-44 object-cover"
              />
              <button
                onClick={() => setCustomizingItem(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-base font-extrabold text-gray-900">{customizingItem.name}</h3>
                  <span className="text-sm font-bold text-orange-950">₹{customizingItem.price}</span>
                </div>
                <p className="text-gray-500 mt-1 leading-relaxed text-[11px]">{customizingItem.description}</p>
              </div>

              {/* Modifiers */}
              {customizingItem.modifierGroupIds && customizingItem.modifierGroupIds.map(gid => {
                const group = modifierGroups.find(g => g.id === gid);
                if (!group) return null;

                return (
                  <div key={group.id} className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">{group.name}</span>
                      <span className="text-[10px] text-gray-400">
                        {group.required ? 'Required' : 'Optional'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {group.options.map(opt => (
                        <label
                          key={opt.id}
                          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-colors ${
                            modalModifiers[group.id] === opt.id
                              ? 'border-[#f5764b] bg-orange-50/50 font-bold text-orange-950'
                              : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={group.id}
                              checked={modalModifiers[group.id] === opt.id}
                              onChange={() => setModalModifiers(prev => ({ ...prev, [group.id]: opt.id }))}
                              className="text-[#f5764b] focus:ring-[#f5764b]"
                            />
                            <span>{opt.name}</span>
                          </div>
                          {opt.price > 0 && <span className="text-gray-500 font-medium">+₹{opt.price}</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Special Cooking Instructions */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block font-bold text-gray-800 mb-1">Cooking Instructions</label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="e.g. Less spicy, no onion garlic, extra crisp"
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-xl text-xs outline-none"
                />
              </div>

              {/* Quantity Picker */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-800">Quantity</span>
                <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                    className="p-1.5 rounded-lg bg-white shadow-2xs text-gray-700 hover:bg-gray-200"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-xs px-2">{modalQty}</span>
                  <button
                    onClick={() => setModalQty(modalQty + 1)}
                    className="p-1.5 rounded-lg bg-white shadow-2xs text-gray-700 hover:bg-gray-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
              >
                Add to Table Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/30  p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xs overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Table {activeTable.number} Cart</h3>
                <p className="text-[10px] text-gray-500">{cart.length} items selected</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-gray-100 space-y-3 text-xs flex-1">
              {cart.map((entry) => (
                <div key={entry.cartId} className="pt-3 first:pt-0 flex justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{entry.item.name}</p>
                    {entry.selectedModifiers.length > 0 && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {entry.selectedModifiers.map(m => m.optionName).join(', ')}
                      </p>
                    )}
                    {entry.notes && (
                      <p className="text-[10px] italic text-amber-700 mt-0.5">
                        Note: {entry.notes}
                      </p>
                    )}
                    <p className="font-semibold text-orange-950 text-[11px] mt-1">₹{entry.totalPrice.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    <button
                      onClick={() => {
                        if (entry.quantity === 1) {
                          setCart(prev => prev.filter(c => c.cartId !== entry.cartId));
                        } else {
                          setCart(prev => prev.map(c => c.cartId === entry.cartId ? { ...c, quantity: c.quantity - 1, totalPrice: (c.totalPrice / c.quantity) * (c.quantity - 1) } : c));
                        }
                      }}
                      className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs px-1">{entry.quantity}</span>
                    <button
                      onClick={() => {
                        setCart(prev => prev.map(c => c.cartId === entry.cartId ? { ...c, quantity: c.quantity + 1, totalPrice: (c.totalPrice / c.quantity) * (c.quantity + 1) } : c));
                      }}
                      className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-[11px]">
                <span>GST (5%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-[11px]">
                <span>Service Charge (5%)</span>
                <span>₹{serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Payable</span>
                <span className="text-orange-950">₹{grandTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-3 bg-[#f5764b] hover:bg-[#e05a2b] disabled:bg-orange-300 text-white rounded-xl font-bold text-xs shadow-xs transition-colors mt-2"
              >
                {isSubmitting ? 'Sending to Kitchen...' : `Confirm & Send to Kitchen (₹${grandTotal.toFixed(2)})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
