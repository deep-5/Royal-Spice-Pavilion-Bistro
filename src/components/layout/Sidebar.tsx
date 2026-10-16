import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  Clock,
  TableProperties,
  QrCode,
  Smartphone,
  Receipt,
  UtensilsCrossed,
  ChefHat,
  History,
  FolderTree,
  Utensils,
  Layers,
  BookOpen,
  Boxes,
  ArrowLeftRight,
  Truck,
  ShoppingCart,
  PackageCheck,
  Users,
  MessageSquareQuote,
  UserCheck,
  Clock3,
  CalendarCheck,
  CheckSquare,
  CreditCard,
  RotateCcw,
  ReceiptText,
  WalletCards,
  PieChart,
  FileSpreadsheet,
  Settings,
  Building,
  Timer,
  Percent,
  Sliders,
  UserCog,
  PlugZap,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (pageId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  module: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) => {
  const {
    settings,
    hasPermission,
    orders,
    kitchenTickets,
    inventory,
    purchaseOrders,
    expenses,
    waitlist
  } = useApp();

  // Dynamic badges
  const activeOrdersCount = orders.filter(o => o.status === 'New' || o.status === 'Preparing' || o.status === 'Ready').length;
  const activeTicketsCount = kitchenTickets.filter(k => k.status === 'New' || k.status === 'Preparing').length;
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;
  const pendingPOCount = purchaseOrders.filter(p => p.approvalStatus === 'Pending').length;
  const pendingExpCount = expenses.filter(e => e.status === 'Pending Approval').length;
  const waitingGuestsCount = waitlist.filter(w => w.status === 'Waiting').length;

  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard, module: 'Dashboard' },
        { id: 'sales-analytics', label: 'Sales Analytics', icon: BarChart3, module: 'Analytics' }
      ]
    },
    {
      title: 'Front of House',
      items: [
        { id: 'reservations', label: 'Reservations & Booking', icon: CalendarDays, module: 'Reservations' },
        { id: 'waitlist', label: 'Waitlist', icon: Clock, badge: waitingGuestsCount || undefined, badgeColor: 'bg-orange-50 text-[#e05a2b] border border-orange-200', module: 'Waitlist' },
        { id: 'floor-plan', label: 'Floor Plan / Tables', icon: TableProperties, module: 'Tables' },
        { id: 'qr-codes', label: 'QR Code Management', icon: QrCode, module: 'QR Menu' },
        { id: 'customer-qr-menu', label: 'Customer QR Menu', icon: Smartphone, module: 'QR Menu' },
        { id: 'pos', label: 'POS Terminal', icon: Receipt, module: 'POS' },
        { id: 'orders', label: 'Orders', icon: UtensilsCrossed, badge: activeOrdersCount || undefined, badgeColor: 'bg-orange-50 text-[#e05a2b] border border-orange-200', module: 'Orders' }
      ]
    },
    {
      title: 'Kitchen',
      items: [
        { id: 'kds', label: 'Kitchen Display (KDS)', icon: ChefHat, badge: activeTicketsCount || undefined, badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200', module: 'KDS' },
        { id: 'prep-history', label: 'Preparation History', icon: History, module: 'Prep History' }
      ]
    },
    {
      title: 'Menu & Stock',
      items: [
        { id: 'menu-categories', label: 'Menu Categories', icon: FolderTree, module: 'Menu' },
        { id: 'menu-items', label: 'Menu Items', icon: Utensils, module: 'Menu' },
        { id: 'modifiers', label: 'Modifiers & Add-ons', icon: Layers, module: 'Menu' },
        { id: 'recipes', label: 'Recipes & Yields', icon: BookOpen, module: 'Recipes' },
        { id: 'inventory', label: 'Inventory Overview', icon: Boxes, badge: lowStockCount || undefined, badgeColor: 'bg-red-50 text-red-700 border border-red-200', module: 'Inventory' },
        { id: 'stock-movements', label: 'Stock Movements', icon: ArrowLeftRight, module: 'Inventory' },
        { id: 'suppliers', label: 'Suppliers', icon: Truck, module: 'Suppliers' },
        { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, badge: pendingPOCount || undefined, badgeColor: 'bg-gray-100 text-gray-700', module: 'Purchasing' },
        { id: 'goods-received', label: 'Goods Received', icon: PackageCheck, module: 'Purchasing' }
      ]
    },
    {
      title: 'Customers & Staff',
      items: [
        { id: 'customers', label: 'Customer CRM', icon: Users, module: 'Customers' },
        { id: 'feedback', label: 'Feedback & Reviews', icon: MessageSquareQuote, module: 'Feedback' },
        { id: 'staff-directory', label: 'Staff Directory', icon: UserCheck, module: 'Staff' },
        { id: 'attendance', label: 'Attendance', icon: Clock3, module: 'Attendance' },
        { id: 'shifts', label: 'Shifts & Rosters', icon: CalendarCheck, module: 'Staff' },
        { id: 'checklists', label: 'Tasks & Checklists', icon: CheckSquare, module: 'Checklists' }
      ]
    },
    {
      title: 'Finance',
      items: [
        { id: 'payments', label: 'Payments', icon: CreditCard, module: 'Payments' },
        { id: 'refunds', label: 'Refunds Log', icon: RotateCcw, module: 'Refunds' },
        { id: 'expenses', label: 'Expenses', icon: ReceiptText, badge: pendingExpCount || undefined, badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200', module: 'Expenses' },
        { id: 'cash-drawer', label: 'Cash Drawer / Closing', icon: WalletCards, module: 'Cash Drawer' },
        { id: 'finance-overview', label: 'Finance Overview', icon: PieChart, module: 'Finance' },
        { id: 'reports', label: 'Reports & Analytics', icon: FileSpreadsheet, module: 'Reports' }
      ]
    },
    {
      title: 'Settings',
      items: [
        { id: 'settings-profile', label: 'Restaurant Profile', icon: Settings, module: 'Settings' },
        { id: 'branch-management', label: 'Branch Management', icon: Building, module: 'Settings' },
        { id: 'operating-hours', label: 'Operating Hours', icon: Timer, module: 'Settings' },
        { id: 'tax-settings', label: 'Tax & Service Charges', icon: Percent, module: 'Settings' },
        { id: 'floor-settings', label: 'Table / Floor Settings', icon: Sliders, module: 'Settings' },
        { id: 'users-roles', label: 'Users & Roles', icon: UserCog, module: 'Settings' },
        { id: 'integrations', label: 'Integrations', icon: PlugZap, module: 'Settings' },
        { id: 'audit-logs', label: 'Audit Logs', icon: ShieldAlert, module: 'Settings' }
      ]
    }
  ];

  const handleItemClick = (pageId: string) => {
    onNavigate(pageId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-gray-900/30  md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-64 md:w-20' : 'w-64'}`}
      >
        {/* Brand / Logo */}
        <div
          className={`flex h-16 items-center border-b border-gray-200 bg-white transition-all ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={isCollapsed ? onToggleCollapse : undefined}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5764B] text-white shadow-xs transition-transform ${
                isCollapsed ? 'hover:scale-105 cursor-pointer' : ''
              }`}
              title={isCollapsed ? 'Click to expand sidebar' : settings.name}
            >
              <Utensils className="h-5 w-5" />
            </button>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-bold tracking-tight text-gray-900 truncate">
                  {settings.name}
                </h1>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant OS
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Collapse sidebar (Ctrl+B)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <div className={`flex-1 overflow-y-auto py-4 space-y-4 bg-white ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navGroups.map((group) => {
            // Filter items user has permission to view
            const visibleItems = group.items.filter(item => hasPermission(item.module));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title}>
                {isCollapsed ? (
                  <div className="my-2 border-t border-gray-100 mx-1" title={group.title} />
                ) : (
                  <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        title={isCollapsed ? `${item.label}${item.badge !== undefined ? ` (${item.badge})` : ''}` : undefined}
                        className={`group relative flex items-center rounded-xl text-xs font-medium transition-all ${
                          isCollapsed
                            ? 'w-10 h-10 mx-auto justify-center p-0'
                            : 'w-full justify-between px-3.5 py-2.5'
                        } ${
                          isActive
                            ? 'bg-[#F5764B] text-white shadow-xs font-semibold'
                            : 'text-gray-600 hover:bg-orange-50/70 hover:text-[#F5764B]'
                        }`}
                      >
                        <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 truncate'}`}>
                          <Icon
                            className={`shrink-0 transition-colors ${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'} ${
                              isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#F5764B]'
                            }`}
                          />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                          {isCollapsed && item.badge !== undefined && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#F5764B] text-[9px] font-bold text-white px-1 shadow-xs border-2 border-white">
                              {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
                            </span>
                          )}
                        </div>
                        {!isCollapsed && item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : item.badgeColor || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Customer Mobile Menu Link & Expand/Collapse footer */}
        <div className="border-t border-gray-200 p-2.5 bg-white space-y-1.5">
          <button
            onClick={() => handleItemClick('customer-qr-menu')}
            title={isCollapsed ? "Customer QR Menu" : undefined}
            className={`flex items-center rounded-lg bg-gray-50 border border-gray-200 hover:border-[#f5764b] hover:bg-orange-50/50 text-gray-800 text-xs font-semibold transition-colors ${
              isCollapsed ? 'h-10 w-10 mx-auto justify-center p-0' : 'w-full justify-between p-2'
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
              <QrCode className="w-4 h-4 text-[#f5764b] shrink-0" />
              {!isCollapsed && <span>Customer QR Menu</span>}
            </div>
            {!isCollapsed && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
          </button>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className={`hidden md:flex items-center rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors ${
              isCollapsed
                ? 'h-10 w-10 mx-auto justify-center p-0'
                : 'w-full justify-between px-2.5 py-2'
            }`}
            title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4 text-gray-500" />
              ) : (
                <PanelLeftClose className="h-4 w-4 text-gray-400" />
              )}
              {!isCollapsed && <span>Collapse Sidebar</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded font-mono">
                Ctrl+B
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
