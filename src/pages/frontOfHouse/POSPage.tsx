import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Minus,
  Trash2,
  TableProperties,
  User,
  Percent,
  Clock,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  Flame,
  ChevronRight,
  Split,
  PauseCircle,
  PlayCircle,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuItem, Order, OrderItem, Table, Payment } from '../../types';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const POSPage: React.FC = () => {
  const {
    menuCategories,
    menuItems,
    modifierGroups,
    tables,
    customers,
    currentUser,
    createOrder,
    processPayment,
    currentBranchId
  } = useApp();

  // Active Category & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Order Meta
  const [orderType, setOrderType] = useState<'Dine-in' | 'Takeaway' | 'Delivery'>('Dine-in');
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState('');

  interface POSCartItem {
    id: string;
    item: MenuItem;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    modifiers?: { groupId: string; groupName: string; optionId: string; optionName: string; price: number }[];
    notes?: string;
  }
  const [posCart, setPosCart] = useState<POSCartItem[]>([]);

  // Discounts
  const [discountType, setDiscountType] = useState<'none' | 'percent' | 'flat'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [isServiceChargeEnabled, setIsServiceChargeEnabled] = useState(true);

  // Held Orders (Hold / Recall)
  const [heldOrders, setHeldOrders] = useState<{ id: string; name: string; cart: POSCartItem[]; tableId?: string; time: string }[]>([]);

  // Modifiers Selection Modal
  const [modifyingItem, setModifyingItem] = useState<MenuItem | null>(null);
  const [selectedMods, setSelectedMods] = useState<Record<string, string>>({});
  const [itemNote, setItemNote] = useState('');

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'menu' | 'cart'>('menu');
  const [payMethod, setPayMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Split'>('Cash');
  const [tenderedCash, setTenderedCash] = useState<number>(0);
  const [txnRef, setTxnRef] = useState('');
  const [splitAmounts, setSplitAmounts] = useState<{ cash: number; card: number; upi: number }>({ cash: 0, card: 0, upi: 0 });

  // Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [printedOrder, setPrintedOrder] = useState<Order | null>(null);

  // Table selector modal
  const [tableModalOpen, setTableModalOpen] = useState(false);

  // Pre-selected table from navigation
  useEffect(() => {
    const preselect = localStorage.getItem('rms_pos_preselect_table');
    if (preselect) {
      setSelectedTableId(preselect);
      localStorage.removeItem('rms_pos_preselect_table');
    }
  }, []);

  const activeTable = tables.find(t => t.id === selectedTableId);
  const activeCustomer = customers.find(c => c.id === selectedCustomerId);

  // Filtered menu
  const filteredMenu = menuItems.filter(item => {
    if (item.isArchived) return false;
    if (selectedCategory !== 'All' && item.categoryId !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
    }
    return true;
  });

  // Handle Add Item to Cart
  const handleItemClick = (item: MenuItem) => {
    if (!item.isAvailable) {
      alert(`${item.name} is currently marked Sold Out.`);
      return;
    }

    // If item has modifiers, open customization popup
    if (item.modifierGroupIds && item.modifierGroupIds.length > 0) {
      setModifyingItem(item);
      setItemNote('');
      const defaults: Record<string, string> = {};
      item.modifierGroupIds.forEach(gid => {
        const group = modifierGroups.find(g => g.id === gid);
        if (group && group.options.length > 0) {
          const def = group.options.find(o => o.isDefault) || group.options[0];
          defaults[group.id] = def.id;
        }
      });
      setSelectedMods(defaults);
      return;
    }

    // Direct add
    addToCartDirect(item, [], '');
  };

  const addToCartDirect = (
    item: MenuItem,
    mods: { groupId: string; groupName: string; optionId: string; optionName: string; price: number }[],
    note: string
  ) => {
    const modCost = mods.reduce((sum, m) => sum + m.price, 0);
    const unitPrice = item.price + modCost;

    setPosCart(prev => {
      // Check if exact same item with same modifiers already exists in cart
      const existingIdx = prev.findIndex(p => p.item.id === item.id && (!mods.length || JSON.stringify(p.modifiers) === JSON.stringify(mods)));
      if (existingIdx >= 0) {
        const updated = [...prev];
        const nextQty = updated[existingIdx].quantity + 1;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: nextQty,
          totalPrice: updated[existingIdx].unitPrice * nextQty
        };
        return updated;
      }

      return [
        ...prev,
        {
          id: `pos-${Date.now()}-${Math.random()}`,
          item,
          quantity: 1,
          unitPrice,
          totalPrice: unitPrice,
          modifiers: mods,
          notes: note || undefined
        }
      ];
    });
  };

  const handleConfirmModifiers = () => {
    if (!modifyingItem) return;

    const modsList: { groupId: string; groupName: string; optionId: string; optionName: string; price: number }[] = [];
    Object.entries(selectedMods).forEach(([gid, optId]) => {
      const group = modifierGroups.find(g => g.id === gid);
      const opt = group?.options.find(o => o.id === optId);
      if (group && opt) {
        modsList.push({
          groupId: group.id,
          groupName: group.name,
          optionId: opt.id,
          optionName: opt.name,
          price: opt.price
        });
      }
    });

    addToCartDirect(modifyingItem, modsList, itemNote);
    setModifyingItem(null);
  };

  // Cart operations
  const updateQty = (id: string, delta: number) => {
    setPosCart(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = p.quantity + delta;
        if (newQty <= 0) return null as any;
        return {
          ...p,
          quantity: newQty,
          totalPrice: p.unitPrice * newQty
        };
      }
      return p;
    }).filter(Boolean));
  };

  const removeItem = (id: string) => {
    setPosCart(prev => prev.filter(p => p.id !== id));
  };

  const clearCart = () => {
    setPosCart([]);
    setDiscountType('none');
    setDiscountValue(0);
    setDiscountReason('');
  };

  // Calculations
  const cartSubtotal = posCart.reduce((sum, item) => sum + item.totalPrice, 0);
  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = +((cartSubtotal * discountValue) / 100).toFixed(2);
  } else if (discountType === 'flat') {
    discountAmount = Math.min(cartSubtotal, discountValue);
  }

  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const gstAmount = +(taxableAmount * 0.05).toFixed(2);
  const serviceChargeAmount = isServiceChargeEnabled ? +(taxableAmount * 0.05).toFixed(2) : 0;
  const netTotal = +(taxableAmount + gstAmount + serviceChargeAmount).toFixed(2);

  // Hold Order
  const handleHoldOrder = () => {
    if (posCart.length === 0) return;
    const holdItem = {
      id: `hold-${Date.now()}`,
      name: `${orderType} - ${activeTable?.number || 'Counter'} (₹${netTotal})`,
      cart: [...posCart],
      tableId: selectedTableId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHeldOrders(prev => [...prev, holdItem]);
    clearCart();
    alert('Current order placed on hold.');
  };

  const handleRecallOrder = (id: string) => {
    const match = heldOrders.find(h => h.id === id);
    if (!match) return;
    setPosCart(match.cart);
    if (match.tableId) setSelectedTableId(match.tableId);
    setHeldOrders(prev => prev.filter(h => h.id !== id));
  };

  // Send to Kitchen without paying yet (e.g. for Dine-in orders)
  const handleSendToKitchen = () => {
    if (posCart.length === 0) return;

    const orderItems: OrderItem[] = posCart.map(c => ({
      id: `oi-${Date.now()}-${Math.random()}`,
      menuItemId: c.item.id,
      name: c.item.name,
      quantity: c.quantity,
      unitPrice: c.unitPrice,
      totalPrice: c.totalPrice,
      modifiers: c.modifiers,
      notes: c.notes,
      status: 'Preparing',
      prepStation: c.item.prepStation
    }));

    const newOrder = createOrder({
      tableId: orderType === 'Dine-in' ? selectedTableId : undefined,
      tableNumber: orderType === 'Dine-in' ? activeTable?.number : undefined,
      source: orderType,
      customerName: activeCustomer?.name || customCustomerName || (orderType === 'Dine-in' ? `Table ${activeTable?.number} Guest` : 'Counter Guest'),
      customerPhone: activeCustomer?.phone || customCustomerPhone,
      items: orderItems,
      subtotal: cartSubtotal,
      discountAmount,
      discountType: discountType !== 'none' ? (discountType === 'percent' ? 'percentage' : 'fixed') : undefined,
      discountReason: discountReason || undefined,
      taxAmount: gstAmount,
      serviceCharge: serviceChargeAmount,
      totalAmount: netTotal
    }, true);

    setPrintedOrder(newOrder);
    setReceiptModalOpen(true);
    clearCart();
  };

  // Charge / Pay Flow
  const handleOpenPayment = () => {
    if (posCart.length === 0) return;
    setTenderedCash(Math.ceil(netTotal / 100) * 100); // round up to next 100
    setTxnRef(`UPI-${Date.now().toString().substring(5)}`);
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    // 1. Create Order first
    const orderItems: OrderItem[] = posCart.map(c => ({
      id: `oi-${Date.now()}-${Math.random()}`,
      menuItemId: c.item.id,
      name: c.item.name,
      quantity: c.quantity,
      unitPrice: c.unitPrice,
      totalPrice: c.totalPrice,
      modifiers: c.modifiers,
      notes: c.notes,
      status: 'Preparing',
      prepStation: c.item.prepStation
    }));

    const order = createOrder({
      tableId: orderType === 'Dine-in' ? selectedTableId : undefined,
      tableNumber: orderType === 'Dine-in' ? activeTable?.number : undefined,
      source: orderType,
      customerName: activeCustomer?.name || customCustomerName || (orderType === 'Dine-in' ? `Table ${activeTable?.number} Guest` : 'Counter Guest'),
      customerPhone: activeCustomer?.phone || customCustomerPhone,
      items: orderItems,
      subtotal: cartSubtotal,
      discountAmount,
      discountType: discountType !== 'none' ? (discountType === 'percent' ? 'percentage' : 'fixed') : undefined,
      discountReason: discountReason || undefined,
      taxAmount: gstAmount,
      serviceCharge: serviceChargeAmount,
      totalAmount: netTotal
    }, true);

    // 2. Process payment
    const changeDue = payMethod === 'Cash' ? Math.max(0, tenderedCash - netTotal) : 0;
    processPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      branchId: currentBranchId,
      amount: netTotal,
      method: payMethod,
      status: 'Success',
      referenceId: payMethod === 'Cash' ? `CSH-${Date.now().toString().substring(6)}` : txnRef,
      cashierName: currentUser.name,
      tenderedAmount: payMethod === 'Cash' ? tenderedCash : undefined,
      changeDue: payMethod === 'Cash' ? changeDue : undefined
    });

    setPaymentModalOpen(false);
    setPrintedOrder(order);
    setReceiptModalOpen(true);
    clearCart();
  };

  const changeDue = Math.max(0, tenderedCash - netTotal);

  return (
    <div className="space-y-4 pb-8">
      {/* Top POS Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Order Type Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg font-bold">
          {(['Dine-in', 'Takeaway', 'Delivery'] as const).map(type => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                orderType === type ? 'bg-[#f5764b] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Dine-in Table Selector */}
        {orderType === 'Dine-in' && (
          <button
            onClick={() => setTableModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-300 bg-orange-50 text-orange-950 font-bold hover:bg-orange-100 transition-colors"
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>Table: {activeTable ? `${activeTable.number} (${activeTable.section})` : 'Select Table'}</span>
          </button>
        )}

        {/* Customer Selector */}
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-700 outline-none max-w-[160px]"
          >
            <option value="">Walk-in Guest</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.phone.substring(0, 10)})</option>
            ))}
          </select>
        </div>

        {/* Held Orders Count */}
        {heldOrders.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-amber-700">Held Orders ({heldOrders.length}):</span>
            {heldOrders.map(h => (
              <button
                key={h.id}
                onClick={() => handleRecallOrder(h.id)}
                className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold hover:bg-amber-200 text-[10px]"
              >
                Recall {h.time}
              </button>
            ))}
          </div>
        )}

        {/* New Sale Button */}
        <button
          onClick={clearCart}
          className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Sale</span>
        </button>
      </div>

      {/* Mobile Tab Toggle (Menu Catalog vs Cart) */}
      <div className="flex lg:hidden items-center justify-between bg-white p-1.5 rounded-xl border border-gray-200 shadow-2xs">
        <button
          onClick={() => setMobileView('menu')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            mobileView === 'menu' ? 'bg-[#18181B] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Menu ({filteredMenu.length})
        </button>
        <button
          onClick={() => setMobileView('cart')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileView === 'cart' ? 'bg-[#f5764b] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span>Order Cart</span>
          {posCart.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              mobileView === 'cart' ? 'bg-white text-[#f5764b]' : 'bg-[#f5764b] text-white'
            }`}>
              {posCart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Main 3-Column Touch POS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Menu Categories (horizontal scroll on mobile) */}
        <div className={`lg:col-span-2 bg-white rounded-xl border border-gray-200 p-2 sm:p-3 shadow-2xs ${
          mobileView === 'cart' ? 'hidden lg:block' : 'block'
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 block mb-2 hidden lg:block">
            Categories
          </span>
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto gap-1.5 lg:space-y-1 lg:max-h-[78vh] pb-1 lg:pb-0">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`whitespace-nowrap lg:w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                selectedCategory === 'All' ? 'bg-[#f5764b] text-white' : 'text-gray-700 bg-gray-50 lg:bg-transparent hover:bg-gray-100'
              }`}
            >
              All Items ({menuItems.filter(i => !i.isArchived).length})
            </button>
            {menuCategories.map(cat => {
              const count = menuItems.filter(m => m.categoryId === cat.id && !m.isArchived).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap lg:w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between gap-2 ${
                    selectedCategory === cat.id ? 'bg-[#f5764b] text-white' : 'text-gray-700 bg-gray-50 lg:bg-transparent hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Item Cards (6 cols) */}
        <div className={`lg:col-span-6 space-y-3 ${
          mobileView === 'cart' ? 'hidden lg:block' : 'block'
        }`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food items or SKU code..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none shadow-2xs focus:ring-1 focus:ring-[#f5764b]"
            />
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto max-h-[70vh] pr-1">
            {filteredMenu.map(item => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between hover:border-[#f5764b] ${
                  !item.isAvailable ? 'opacity-50 grayscale' : ''
                }`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-24 object-cover"
                />
                <div className="p-2.5">
                  <div className="flex items-start justify-between gap-1">
                    <p className="font-bold text-xs text-gray-900 truncate leading-tight">{item.name}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="font-extrabold text-orange-950">₹{item.price}</span>
                    <span className={`text-[10px] font-bold ${item.dietaryTags.includes('Vegetarian') ? 'text-green-700' : 'text-red-700'}`}>
                      {item.dietaryTags.includes('Vegetarian') ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: POS Order Cart & Checkout (4 cols) */}
        <div className={`lg:col-span-4 bg-white rounded-xl border border-gray-200 p-4 shadow-2xs flex-col justify-between max-h-[82vh] ${
          mobileView === 'menu' ? 'hidden lg:flex' : 'flex'
        }`}>
          <div>
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">
                  {orderType === 'Dine-in' ? `Table ${activeTable?.number}` : orderType} Cart
                </h3>
                <p className="text-[10px] text-gray-400">Cashier: {currentUser.name}</p>
              </div>
              <button
                onClick={clearCart}
                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                title="Clear Cart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="overflow-y-auto max-h-[38vh] divide-y divide-gray-100 my-2 pr-1">
              {posCart.length === 0 ? (
                <div className="py-14 text-center text-gray-400">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold text-gray-600">Cart is empty</p>
                  <p className="text-[10px] text-gray-400">Click items on the left to add to bill</p>
                </div>
              ) : (
                posCart.map(item => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-gray-900 truncate">{item.item.name}</p>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <p className="text-[10px] text-gray-500 truncate">
                          {item.modifiers.map(m => m.optionName).join(', ')}
                        </p>
                      )}
                      <p className="font-semibold text-orange-950 text-[11px]">₹{item.totalPrice.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Bottom Summary & Actions */}
          <div className="pt-3 border-t border-gray-200 space-y-2 text-xs">
            {/* Discount selector */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <Percent className="w-3 h-3" /> Discount
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setDiscountType('percent');
                    setDiscountValue(10);
                    setDiscountReason('Staff Privilege 10%');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${discountValue === 10 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}
                >
                  10%
                </button>
                <button
                  onClick={() => {
                    setDiscountType('percent');
                    setDiscountValue(15);
                    setDiscountReason('VIP Privilege 15%');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${discountValue === 15 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}
                >
                  15%
                </button>
                {discountAmount > 0 && (
                  <button onClick={() => setDiscountType('none')} className="text-red-500 text-[10px]">✕</button>
                )}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-gray-600 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{cartSubtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Discount ({discountReason || `${discountValue}%`}):</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Service Charge (5%):</span>
                <span>₹{serviceChargeAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-gray-900 pt-1 border-t border-gray-200">
                <span>Net Payable:</span>
                <span className="text-orange-950 text-base">₹{netTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* POS Actions Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleHoldOrder}
                disabled={posCart.length === 0}
                className="py-2 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Hold Order</span>
              </button>
              <button
                onClick={handleSendToKitchen}
                disabled={posCart.length === 0}
                className="py-2 px-2 bg-orange-50 hover:bg-orange-100 text-orange-950 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>To Kitchen</span>
              </button>
            </div>

            <button
              onClick={handleOpenPayment}
              disabled={posCart.length === 0}
              className="w-full py-3 bg-[#f5764b] hover:bg-[#e05a2b] disabled:bg-gray-300 text-white rounded-xl font-black text-xs shadow-xs transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Charge / Pay Bill (₹{netTotal.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Item Modifiers Modal */}
      {modifyingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-gray-900">{modifyingItem.name}</h3>
                <p className="text-xs text-[#e05a2b] font-bold">Base Price: ₹{modifyingItem.price}</p>
              </div>
              <button onClick={() => setModifyingItem(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto text-xs">
              {modifyingItem.modifierGroupIds?.map(gid => {
                const group = modifierGroups.find(g => g.id === gid);
                if (!group) return null;

                return (
                  <div key={group.id} className="pt-2 border-t border-gray-100">
                    <span className="font-bold text-gray-800 block mb-1.5">{group.name}</span>
                    <div className="space-y-1">
                      {group.options.map(opt => (
                        <label
                          key={opt.id}
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer ${
                            selectedMods[group.id] === opt.id ? 'border-[#f5764b] bg-orange-50 font-bold text-orange-950' : 'border-gray-200 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={group.id}
                              checked={selectedMods[group.id] === opt.id}
                              onChange={() => setSelectedMods(prev => ({ ...prev, [group.id]: opt.id }))}
                            />
                            <span>{opt.name}</span>
                          </div>
                          {opt.price > 0 && <span className="text-gray-500">+₹{opt.price}</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Special Cooking Note</label>
                <input
                  type="text"
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  placeholder="e.g. Extra butter, mild spice"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setModifyingItem(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModifiers}
                className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg text-xs font-bold"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="font-bold text-base text-gray-900">Settlement & Payment</h3>
                <p className="text-xs text-gray-500">
                  {orderType === 'Dine-in' ? `Table ${activeTable?.number}` : orderType} • Net Due: <span className="font-extrabold text-orange-950">₹{netTotal.toFixed(2)}</span>
                </p>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Payment Method Selector */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Select Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Cash', 'Card', 'UPI', 'Split'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setPayMethod(method)}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        payMethod === method
                          ? 'border-[#f5764b] bg-orange-50 text-orange-950 shadow-xs'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {method === 'Cash' && <Banknote className="w-5 h-5 mx-auto mb-1 text-green-600" />}
                      {method === 'Card' && <CreditCard className="w-5 h-5 mx-auto mb-1 text-[#f5764b]" />}
                      {method === 'UPI' && <QrCode className="w-5 h-5 mx-auto mb-1 text-purple-600" />}
                      {method === 'Split' && <Split className="w-5 h-5 mx-auto mb-1 text-amber-600" />}
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Calculator */}
              {payMethod === 'Cash' && (
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-gray-800">Cash Tendered (₹)</label>
                    <input
                      type="number"
                      value={tenderedCash}
                      onChange={(e) => setTenderedCash(Number(e.target.value))}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-right font-bold text-base w-36 outline-none bg-white"
                    />
                  </div>
                  <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t border-gray-200">
                    <span>Change Due to Guest:</span>
                    <span className="text-green-700 text-base">₹{changeDue.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* UPI Digital QR Sandbox */}
              {payMethod === 'UPI' && (
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 text-center space-y-2">
                  <p className="font-bold text-purple-900">Simulated Dynamic UPI QR Code</p>
                  <p className="text-[11px] text-purple-700">Scan via BHIM, GPay, PhonePe, Paytm</p>
                  <div className="w-36 h-36 bg-white border border-purple-200 mx-auto rounded-xl p-2 flex items-center justify-center shadow-xs">
                    <QrCode className="w-28 h-28 text-purple-800" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono">UPI Ref: {txnRef}</span>
                  </div>
                </div>
              )}

              {/* Card Terminal Sandbox */}
              {payMethod === 'Card' && (
                <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 space-y-2">
                  <p className="font-bold text-orange-950">Card POS Terminal (Simulated)</p>
                  <p className="text-[11px] text-[#e05a2b]">Swipe, Dip or Tap guest card on card terminal.</p>
                  <input
                    type="text"
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    placeholder="Terminal Approval Auth Code (e.g. AUTH-88219)"
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg text-xs bg-white"
                  />
                </div>
              )}

              {/* Split Payment */}
              {payMethod === 'Split' && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                  <p className="font-bold text-amber-900">Split Tender Across Modes</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600">Cash (₹)</label>
                      <input
                        type="number"
                        value={splitAmounts.cash}
                        onChange={(e) => setSplitAmounts(prev => ({ ...prev, cash: Number(e.target.value) }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600">Card (₹)</label>
                      <input
                        type="number"
                        value={splitAmounts.card}
                        onChange={(e) => setSplitAmounts(prev => ({ ...prev, card: Number(e.target.value) }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600">UPI (₹)</label>
                      <input
                        type="number"
                        value={splitAmounts.upi}
                        onChange={(e) => setSplitAmounts(prev => ({ ...prev, upi: Number(e.target.value) }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="text-[10px] text-gray-400 italic">
                * Note: Test simulation mode active. Transactions are saved to internal financial ledger.
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold"
              >
                Back to POS
              </button>
              <button
                onClick={handleConfirmPayment}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-extrabold shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Settlement & Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Selection Modal */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">Select Dining Table</h3>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {tables.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTableId(t.id);
                    setTableModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-center font-bold text-xs ${
                    selectedTableId === t.id
                      ? 'border-[#f5764b] bg-orange-50 text-orange-950 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <p>{t.number}</p>
                  <p className="text-[10px] font-normal text-gray-500">{t.section}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setTableModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        order={printedOrder}
      />

      {/* Sticky Mobile Floating Cart Summary */}
      {mobileView === 'menu' && posCart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
          <button
            onClick={() => setMobileView('cart')}
            className="w-full py-3.5 px-5 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-2xl shadow-xl flex items-center justify-between font-bold text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-[#f5764b] flex items-center justify-center text-xs font-black">
                {posCart.reduce((s, i) => s + i.quantity, 0)}
              </span>
              <span>Review Cart & Pay</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>₹{netTotal.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
