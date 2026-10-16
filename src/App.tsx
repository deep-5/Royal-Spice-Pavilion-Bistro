import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Overview
import { MainDashboard } from './pages/overview/MainDashboard';
import { SalesAnalytics } from './pages/overview/SalesAnalytics';

// Front of House
import { ReservationsPage } from './pages/frontOfHouse/ReservationsPage';
import { WaitlistPage } from './pages/frontOfHouse/WaitlistPage';
import { FloorPlanPage } from './pages/frontOfHouse/FloorPlanPage';
import { QRCodeManagementPage } from './pages/frontOfHouse/QRCodeManagementPage';
import { CustomerQRMenuPage } from './pages/frontOfHouse/CustomerQRMenuPage';
import { POSPage } from './pages/frontOfHouse/POSPage';
import { OrdersPage } from './pages/frontOfHouse/OrdersPage';

// Kitchen
import { KDSPage } from './pages/kitchen/KDSPage';
import { PrepHistoryPage } from './pages/kitchen/PrepHistoryPage';

// Menu & Stock
import { MenuCategoriesPage } from './pages/menuAndStock/MenuCategoriesPage';
import { MenuItemsPage } from './pages/menuAndStock/MenuItemsPage';
import { ModifiersPage } from './pages/menuAndStock/ModifiersPage';
import { RecipesPage } from './pages/menuAndStock/RecipesPage';
import { InventoryOverviewPage } from './pages/menuAndStock/InventoryOverviewPage';
import { StockMovementsPage } from './pages/menuAndStock/StockMovementsPage';
import { SuppliersPage } from './pages/menuAndStock/SuppliersPage';
import { PurchaseOrdersPage } from './pages/menuAndStock/PurchaseOrdersPage';
import { GoodsReceivedPage } from './pages/menuAndStock/GoodsReceivedPage';

// Customers & Staff
import { CustomersPage } from './pages/customersAndStaff/CustomersPage';
import { FeedbackPage } from './pages/customersAndStaff/FeedbackPage';
import { StaffDirectoryPage } from './pages/customersAndStaff/StaffDirectoryPage';
import { AttendancePage } from './pages/customersAndStaff/AttendancePage';
import { ShiftsPage } from './pages/customersAndStaff/ShiftsPage';
import { ChecklistsPage } from './pages/customersAndStaff/ChecklistsPage';

// Finance
import { PaymentsPage } from './pages/finance/PaymentsPage';
import { RefundsPage } from './pages/finance/RefundsPage';
import { ExpensesPage } from './pages/finance/ExpensesPage';
import { CashDrawerPage } from './pages/finance/CashDrawerPage';
import { FinanceOverviewPage } from './pages/finance/FinanceOverviewPage';
import { ReportsPage } from './pages/finance/ReportsPage';

// Settings
import { RestaurantProfilePage } from './pages/settings/RestaurantProfilePage';
import { BranchManagementPage } from './pages/settings/BranchManagementPage';
import { OperatingHoursPage } from './pages/settings/OperatingHoursPage';
import { TaxSettingsPage } from './pages/settings/TaxSettingsPage';
import { FloorSettingsPage } from './pages/settings/FloorSettingsPage';
import { UsersAndRolesPage } from './pages/settings/UsersAndRolesPage';
import { IntegrationsPage } from './pages/settings/IntegrationsPage';
import { AuditLogsPage } from './pages/settings/AuditLogsPage';

// Auth
import { LoginPage } from './pages/auth/LoginPage';

// Icons for Access Denied
import { ShieldAlert, ArrowLeft, Smartphone, LayoutDashboard } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentRole, hasPermission, currentUser, loginAs } = useApp();

  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Global Ctrl+K / Cmd+K and Ctrl+B / Cmd+B listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickAction = (actionType: string) => {
    switch (actionType) {
      case 'reservation':
        handleNavigate('reservations');
        break;
      case 'order':
        handleNavigate('pos');
        break;
      case 'menu-item':
        handleNavigate('menu-items');
        break;
      case 'expense':
        handleNavigate('expenses');
        break;
      case 'analytics':
        handleNavigate('sales-analytics');
        break;
      default:
        break;
    }
  };

  // Check role authorization for a page
  const checkAccess = (page: string): boolean => {
    switch (page) {
      case 'dashboard':
        return hasPermission('Dashboard');
      case 'sales-analytics':
      case 'finance-overview':
      case 'reports':
        return hasPermission('Analytics') || hasPermission('Finance') || hasPermission('Reports');
      case 'reservations':
      case 'waitlist':
        return hasPermission('Reservations') || hasPermission('Waitlist');
      case 'floor-plan':
        return hasPermission('Tables') || hasPermission('Floor Plan');
      case 'qr-codes':
      case 'customer-qr-menu':
        return true;
      case 'pos':
        return hasPermission('POS');
      case 'orders':
        return hasPermission('Orders');
      case 'kds':
      case 'prep-history':
        return hasPermission('KDS') || hasPermission('Prep History');
      case 'menu-categories':
      case 'menu-items':
      case 'modifiers':
      case 'recipes':
        return hasPermission('Menu') || hasPermission('Recipes');
      case 'inventory':
      case 'stock-movements':
        return hasPermission('Inventory');
      case 'suppliers':
      case 'purchase-orders':
      case 'goods-received':
        return hasPermission('Purchasing') || hasPermission('Suppliers');
      case 'customers':
      case 'feedback':
        return hasPermission('Customers') || hasPermission('Feedback');
      case 'staff-directory':
      case 'attendance':
      case 'shifts':
        return hasPermission('Staff') || hasPermission('Attendance');
      case 'checklists':
        return hasPermission('Checklists') || hasPermission('KDS') || hasPermission('Staff');
      case 'payments':
      case 'refunds':
        return hasPermission('Payments') || hasPermission('Refunds');
      case 'expenses':
        return hasPermission('Expenses');
      case 'cash-drawer':
        return hasPermission('Cash Drawer');
      case 'settings-profile':
      case 'branch-management':
      case 'operating-hours':
      case 'tax-settings':
      case 'floor-settings':
      case 'users-roles':
      case 'integrations':
      case 'audit-logs':
        return hasPermission('Settings');
      default:
        return true;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Standalone Customer QR Menu Experience
  if (currentPage === 'customer-qr-menu') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Floating Top Staff Bar */}
        <div className="bg-white border-b border-gray-200 text-gray-800 px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#f5764b]" />
            <span className="font-medium">Viewing Guest Mobile QR Menu (Table T-04 · Connaught Place)</span>
          </div>

          <button
            onClick={() => handleNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Back to Staff Dashboard
          </button>
        </div>

        <div className="flex-1 flex justify-center py-6 px-4 bg-white">
          <CustomerQRMenuPage onBackToDashboard={() => handleNavigate('dashboard')} />
        </div>
      </div>
    );
  }

  const isAuthorized = checkAccess(currentPage);

  const renderActivePage = () => {
    if (!isAuthorized) {
      return (
        <div className="max-w-xl mx-auto py-16 px-4 text-center">
          <div className="w-14 h-14 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Access Restricted by Role</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Your currently active profile role (<strong className="text-gray-800">{currentRole}</strong>) does not have authorization to access the <strong>{currentPage}</strong> module.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Main Dashboard
            </button>
            <button
              onClick={() => loginAs('Restaurant Owner')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Switch to Restaurant Owner
            </button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      // Overview
      case 'dashboard':
        return <MainDashboard onNavigate={handleNavigate} onOpenQuickAction={handleQuickAction} />;
      case 'sales-analytics':
        return <SalesAnalytics onNavigate={handleNavigate} />;

      // Front of House
      case 'reservations':
        return <ReservationsPage onNavigate={handleNavigate} />;
      case 'waitlist':
        return <WaitlistPage onNavigate={handleNavigate} />;
      case 'floor-plan':
        return <FloorPlanPage onNavigate={handleNavigate} />;
      case 'qr-codes':
        return <QRCodeManagementPage onNavigate={handleNavigate} onOpenCustomerQR={() => handleNavigate('customer-qr-menu')} />;
      case 'pos':
        return <POSPage />;
      case 'orders':
        return <OrdersPage onNavigate={handleNavigate} />;

      // Kitchen
      case 'kds':
        return <KDSPage onNavigate={handleNavigate} />;
      case 'prep-history':
        return <PrepHistoryPage />;

      // Menu & Stock
      case 'menu-categories':
        return <MenuCategoriesPage onNavigate={handleNavigate} />;
      case 'menu-items':
        return <MenuItemsPage />;
      case 'modifiers':
        return <ModifiersPage />;
      case 'recipes':
        return <RecipesPage />;
      case 'inventory':
        return <InventoryOverviewPage onNavigate={handleNavigate} />;
      case 'stock-movements':
        return <StockMovementsPage />;
      case 'suppliers':
        return <SuppliersPage onNavigate={handleNavigate} />;
      case 'purchase-orders':
        return <PurchaseOrdersPage onNavigate={handleNavigate} />;
      case 'goods-received':
        return <GoodsReceivedPage />;

      // Customers & Staff
      case 'customers':
        return <CustomersPage onNavigate={handleNavigate} />;
      case 'feedback':
        return <FeedbackPage />;
      case 'staff-directory':
        return <StaffDirectoryPage onNavigate={handleNavigate} />;
      case 'attendance':
        return <AttendancePage />;
      case 'shifts':
        return <ShiftsPage />;
      case 'checklists':
        return <ChecklistsPage />;

      // Finance
      case 'payments':
        return <PaymentsPage />;
      case 'refunds':
        return <RefundsPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'cash-drawer':
        return <CashDrawerPage />;
      case 'finance-overview':
        return <FinanceOverviewPage />;
      case 'reports':
        return <ReportsPage />;

      // Settings
      case 'settings-profile':
        return <RestaurantProfilePage />;
      case 'branch-management':
        return <BranchManagementPage />;
      case 'operating-hours':
        return <OperatingHoursPage />;
      case 'tax-settings':
        return <TaxSettingsPage />;
      case 'floor-settings':
        return <FloorSettingsPage />;
      case 'users-roles':
        return <UsersAndRolesPage />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'audit-logs':
        return <AuditLogsPage />;

      default:
        return <MainDashboard onNavigate={handleNavigate} onOpenQuickAction={handleQuickAction} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FA] text-gray-800 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#F8F9FA]">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsOpenMobile(prev => !prev)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onNavigate={handleNavigate}
          onOpenQuickAction={handleQuickAction}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-[#F8F9FA]">
          <div className="mx-auto max-w-7xl">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
