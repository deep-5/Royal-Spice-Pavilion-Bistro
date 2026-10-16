import React, { useState, useEffect } from 'react';
import { Search, X, Utensils, Calendar, Users, Package, CreditCard, LayoutGrid } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { orders, menuItems, reservations, tables, inventory, customers, staff } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedOrders = q ? orders.filter(o => o.orderNumber.toLowerCase().includes(q) || o.customerName?.toLowerCase().includes(q) || o.tableNumber?.toLowerCase().includes(q)).slice(0, 4) : [];
  const matchedMenu = q ? menuItems.filter(m => m.name.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q)).slice(0, 4) : [];
  const matchedReservations = q ? reservations.filter(r => r.guestName.toLowerCase().includes(q) || r.phone.includes(q)).slice(0, 4) : [];
  const matchedTables = q ? tables.filter(t => t.number.toLowerCase().includes(q) || t.section.toLowerCase().includes(q)).slice(0, 4) : [];
  const matchedInventory = q ? inventory.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)).slice(0, 4) : [];
  const matchedCustomers = q ? customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 4) : [];
  const matchedStaff = q ? staff.filter(s => s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q)).slice(0, 4) : [];

  const hasResults = matchedOrders.length > 0 || matchedMenu.length > 0 || matchedReservations.length > 0 || matchedTables.length > 0 || matchedInventory.length > 0 || matchedCustomers.length > 0 || matchedStaff.length > 0;

  const handleSelect = (pageId: string) => {
    onNavigate(pageId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/20">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xs border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input bar */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 gap-3 bg-white">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, tables, dishes, guests, ingredients, staff..."
            autoFocus
            className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-4 bg-white">
          {!q ? (
            <div className="py-10 text-center text-gray-400">
              <Search className="w-6 h-6 mx-auto mb-2 opacity-30 text-gray-400" />
              <p className="text-xs font-semibold text-gray-600">Quick Navigation & Global Search</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Type an order number (e.g. ORD-101), dish name, customer or ingredient</p>
            </div>
          ) : !hasResults ? (
            <div className="py-10 text-center text-gray-400">
              <p className="text-xs text-gray-500">No matching records found for "{query}"</p>
            </div>
          ) : (
            <>
              {/* Orders */}
              {matchedOrders.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#f5764b]" /> Orders
                  </h4>
                  <div className="space-y-1">
                    {matchedOrders.map(o => (
                      <div
                        key={o.id}
                        onClick={() => handleSelect('orders')}
                        className="p-2 rounded-lg hover:bg-gray-50 flex items-center justify-between cursor-pointer border border-transparent hover:border-gray-200 transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-xs text-gray-900">{o.orderNumber}</span>
                          <span className="text-xs text-gray-500 ml-2">({o.customerName || 'Walk-in'})</span>
                          {o.tableNumber && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 font-medium text-gray-700">{o.tableNumber}</span>}
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900">₹{o.totalAmount.toFixed(2)}</span>
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase font-medium">{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu Items */}
              {matchedMenu.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#f5764b]" /> Menu Items
                  </h4>
                  <div className="space-y-1">
                    {matchedMenu.map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleSelect('menu-items')}
                        className="p-2 rounded-lg hover:bg-gray-50 flex items-center justify-between cursor-pointer border border-transparent hover:border-gray-200 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-gray-900">{m.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">[{m.sku}]</span>
                        </div>
                        <span className="text-xs font-bold text-gray-900">₹{m.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tables */}
              {matchedTables.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-[#f5764b]" /> Dining Tables
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {matchedTables.map(t => (
                      <div
                        key={t.id}
                        onClick={() => handleSelect('floor-plan')}
                        className="p-2 rounded-lg hover:bg-gray-50 flex items-center justify-between cursor-pointer border border-gray-200"
                      >
                        <span className="font-bold text-xs text-gray-900">{t.number} ({t.section})</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">{t.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {matchedCustomers.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#f5764b]" /> Customers
                  </h4>
                  <div className="space-y-1">
                    {matchedCustomers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelect('customers')}
                        className="p-2 rounded-lg hover:bg-gray-50 flex items-center justify-between cursor-pointer border border-transparent hover:border-gray-200"
                      >
                        <div>
                          <span className="font-semibold text-xs text-gray-900">{c.name}</span>
                          <span className="text-xs text-gray-400 ml-2">{c.phone}</span>
                        </div>
                        <span className="text-xs text-gray-600">{c.totalVisits} visits</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
