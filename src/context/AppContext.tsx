import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  Branch,
  Table,
  TableStatus,
  Reservation,
  WaitlistEntry,
  MenuCategory,
  MenuItem,
  ModifierGroup,
  Recipe,
  Order,
  OrderItem,
  OrderStatus,
  KitchenTicket,
  Payment,
  Refund,
  InventoryItem,
  StockMovement,
  Supplier,
  PurchaseOrder,
  Customer,
  Feedback,
  StaffMember,
  AttendanceRecord,
  Shift,
  ChecklistTask,
  Expense,
  CashClosing,
  SystemNotification,
  AuditLog,
  RestaurantSettings
} from '../types';
import {
  initialSettings,
  initialBranches,
  initialUsers,
  initialTables,
  initialReservations,
  initialWaitlist,
  initialMenuCategories,
  initialModifierGroups,
  initialMenuItems,
  initialRecipes,
  initialInventory,
  initialStockMovements,
  initialSuppliers,
  initialPurchaseOrders,
  initialOrders,
  initialKitchenTickets,
  initialPayments,
  initialRefunds,
  initialCustomers,
  initialFeedback,
  initialStaff,
  initialAttendance,
  initialShifts,
  initialChecklists,
  initialExpenses,
  initialCashClosings,
  initialNotifications,
  initialAuditLogs
} from '../data/seedData';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Auth & Role
  currentUser: User;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  setCurrentUser: (user: User) => void;
  logout: () => void;
  loginAs: (role: UserRole) => void;
  hasPermission: (module: string, action?: string) => boolean;

  // Branch & Filters
  currentBranchId: string;
  setCurrentBranchId: (id: string) => void;
  currentBranch: Branch;
  dateFilter: string;
  setDateFilter: (filter: string) => void;

  // Entities & Data
  settings: RestaurantSettings;
  updateSettings: (newSettings: Partial<RestaurantSettings>) => void;
  branches: Branch[];
  users: User[];
  tables: Table[];
  reservations: Reservation[];
  waitlist: WaitlistEntry[];
  menuCategories: MenuCategory[];
  modifierGroups: ModifierGroup[];
  menuItems: MenuItem[];
  recipes: Recipe[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  orders: Order[];
  kitchenTickets: KitchenTicket[];
  payments: Payment[];
  refunds: Refund[];
  customers: Customer[];
  feedback: Feedback[];
  staff: StaffMember[];
  attendance: AttendanceRecord[];
  shifts: Shift[];
  checklists: ChecklistTask[];
  expenses: Expense[];
  cashClosings: CashClosing[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];

  // Action methods
  addAuditLog: (module: string, action: string, recordId: string, summary: string, result?: 'Success' | 'Warning' | 'Failed') => void;
  addNotification: (type: SystemNotification['type'], title: string, message: string, linkPage?: string, relatedId?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Table actions
  updateTableStatus: (tableId: string, status: TableStatus, details?: Partial<Table>) => void;
  addTable: (table: Omit<Table, 'id'>) => void;
  updateTable: (table: Table) => void;
  transferTable: (sourceId: string, targetId: string) => void;
  mergeTables: (t1Id: string, t2Id: string) => void;
  splitTable: (tId: string) => void;

  // Reservation actions
  addReservation: (res: Omit<Reservation, 'id' | 'createdAt'>) => void;
  updateReservation: (res: Reservation) => void;
  cancelReservation: (resId: string, reason: string) => void;
  seatReservation: (resId: string, tableId: string) => void;
  checkInReservation: (resId: string) => void;

  // Waitlist actions
  addWaitlist: (entry: Omit<WaitlistEntry, 'id' | 'createdAt'>) => void;
  seatWaitlist: (waitlistId: string, tableId: string) => void;
  removeWaitlist: (waitlistId: string) => void;
  notifyWaitlist: (waitlistId: string) => void;

  // Menu actions
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
  toggleMenuItemAvailability: (itemId: string) => void;
  addCategory: (cat: Omit<MenuCategory, 'id'>) => void;
  updateCategory: (cat: MenuCategory) => void;
  deleteCategory: (catId: string) => void;
  addModifierGroup: (group: Omit<ModifierGroup, 'id'>) => void;
  updateModifierGroup: (group: ModifierGroup) => void;

  // Recipe actions
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (recipe: Recipe) => void;

  // Order & POS actions
  createOrder: (orderData: Partial<Order>, directToKitchen?: boolean) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  updateKitchenTicketStatus: (ticketId: string, status: KitchenTicket['status']) => void;
  flagKitchenDelay: (ticketId: string, reason: string) => void;

  // Payment actions
  processPayment: (paymentData: Omit<Payment, 'id' | 'createdAt'>) => Payment;
  processRefund: (refundData: Omit<Refund, 'id' | 'createdAt'>) => void;

  // Inventory actions
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'status'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  adjustStock: (itemId: string, delta: number, reason: string, type: StockMovement['type']) => void;

  // Purchasing & Suppliers
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  createPurchaseOrder: (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'status' | 'approvalStatus' | 'createdBy'>) => void;
  approvePurchaseOrder: (poId: string) => void;
  rejectPurchaseOrder: (poId: string, reason: string) => void;
  sendPurchaseOrder: (poId: string) => void;
  receiveGoods: (poId: string, itemsReceived: { inventoryItemId: string; receivedQty: number; rejectedQty: number }[]) => void;

  // Customers & Feedback
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'totalVisits' | 'totalSpend' | 'loyaltyPoints'>) => void;
  updateCustomer: (cust: Customer) => void;
  addFeedback: (fb: Omit<Feedback, 'id' | 'createdAt'>) => void;
  replyFeedback: (fbId: string, reply: string) => void;

  // Staff & Attendance
  addStaff: (s: Omit<StaffMember, 'id'>) => void;
  updateStaff: (s: StaffMember) => void;
  clockIn: (staffId: string) => void;
  clockOut: (staffId: string) => void;
  toggleChecklistTask: (taskId: string) => void;
  addChecklistTask: (task: Omit<ChecklistTask, 'id' | 'isCompleted'>) => void;
  reportChecklistIssue: (taskId: string, issue: string) => void;
  addShift: (sh: Omit<Shift, 'id'>) => void;

  // Branch & Users
  addBranch: (b: Omit<Branch, 'id'>) => void;
  updateBranch: (b: Branch) => void;
  addUser: (u: Omit<User, 'id'>) => void;
  updateUser: (u: User) => void;

  // Finance & Expenses
  addExpense: (exp: Omit<Expense, 'id' | 'expenseNumber' | 'status' | 'createdAt'>) => void;
  approveExpense: (expId: string) => void;
  rejectExpense: (expId: string, reason: string) => void;
  recordCashClosing: (cc: Omit<CashClosing, 'id' | 'closingNumber' | 'status' | 'createdAt'>) => void;
  approveCashClosing: (ccId: string) => void;

  // System
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'royal_spice_bistro_state_v2';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved state or default to initial seed
  const [isLoaded, setIsLoaded] = useState(false);

  const [settings, setSettings] = useState<RestaurantSettings>(initialSettings);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // Default to Owner
  const [currentRole, setCurrentRole] = useState<UserRole>('Restaurant Owner');
  const [currentBranchId, setCurrentBranchId] = useState<string>('b1');
  const [dateFilter, setDateFilter] = useState<string>('Today');

  const [tables, setTables] = useState<Table[]>(initialTables);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(initialWaitlist);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(initialMenuCategories);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>(initialModifierGroups);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>(initialKitchenTickets);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [refunds, setRefunds] = useState<Refund[]>(initialRefunds);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback);
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [checklists, setChecklists] = useState<ChecklistTask[]>(initialChecklists);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [cashClosings, setCashClosings] = useState<CashClosing[]>(initialCashClosings);
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Load from LocalStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.branches) setBranches(parsed.branches);
        if (parsed.tables) setTables(parsed.tables);
        if (parsed.reservations) setReservations(parsed.reservations);
        if (parsed.waitlist) setWaitlist(parsed.waitlist);
        if (parsed.menuCategories) setMenuCategories(parsed.menuCategories);
        if (parsed.modifierGroups) setModifierGroups(parsed.modifierGroups);
        if (parsed.menuItems) setMenuItems(parsed.menuItems);
        if (parsed.recipes) setRecipes(parsed.recipes);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.stockMovements) setStockMovements(parsed.stockMovements);
        if (parsed.suppliers) setSuppliers(parsed.suppliers);
        if (parsed.purchaseOrders) setPurchaseOrders(parsed.purchaseOrders);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.kitchenTickets) setKitchenTickets(parsed.kitchenTickets);
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.refunds) setRefunds(parsed.refunds);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.feedback) setFeedback(parsed.feedback);
        if (parsed.staff) setStaff(parsed.staff);
        if (parsed.attendance) setAttendance(parsed.attendance);
        if (parsed.shifts) setShifts(parsed.shifts);
        if (parsed.checklists) setChecklists(parsed.checklists);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.cashClosings) setCashClosings(parsed.cashClosings);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      }
    } catch (e) {
      console.warn('Failed to load local storage state:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        settings,
        branches,
        tables,
        reservations,
        waitlist,
        menuCategories,
        modifierGroups,
        menuItems,
        recipes,
        inventory,
        stockMovements,
        suppliers,
        purchaseOrders,
        orders,
        kitchenTickets,
        payments,
        refunds,
        customers,
        feedback,
        staff,
        attendance,
        shifts,
        checklists,
        expenses,
        cashClosings,
        notifications,
        auditLogs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  }, [
    isLoaded, settings, branches, tables, reservations, waitlist,
    menuCategories, modifierGroups, menuItems, recipes, inventory,
    stockMovements, suppliers, purchaseOrders, orders, kitchenTickets,
    payments, refunds, customers, feedback, staff, attendance,
    shifts, checklists, expenses, cashClosings, notifications, auditLogs
  ]);

  // Current branch
  const currentBranch = branches.find(b => b.id === currentBranchId) || branches[0];

  // Role permissions checking matrix
  const hasPermission = (module: string, action?: string): boolean => {
    if (currentRole === 'Restaurant Owner') return true; // Owner has full access

    switch (currentRole) {
      case 'Manager':
        // Manager can do everything except system-level user deletion or bank changes
        if (module === 'Settings' && action === 'delete_user') return false;
        return true;

      case 'Cashier':
        // Cashier has access to POS, Orders, Bills, Payments, Shift Closing, and basic Reservations/Tables
        if (['POS', 'Orders', 'Payments', 'Cash Drawer', 'Tables', 'Reservations', 'Customers'].includes(module)) {
          if (action === 'delete_order' || action === 'delete_payment') return false;
          return true;
        }
        return false;

      case 'Kitchen Staff':
        // Kitchen Staff has access to KDS, Prep History, Recipe view, Inventory overview, Staff Checklists
        if (['KDS', 'Prep History', 'Recipes', 'Inventory', 'Checklists'].includes(module)) {
          if (action === 'delete_stock' || action === 'edit_prices') return false;
          return true;
        }
        return false;

      case 'Host / Waiter':
        // Host has access to Reservations, Waitlist, Floor Plan/Tables, QR Ordering, Orders viewing
        if (['Reservations', 'Waitlist', 'Tables', 'Floor Plan', 'Orders', 'QR Menu', 'Checklists'].includes(module)) {
          if (action === 'refund' || action === 'cancel_paid') return false;
          return true;
        }
        return false;

      case 'Accountant':
        // Accountant has access to Finance, Payments, Refunds, Expenses, Cash Closing, Reports, Analytics
        if (['Finance', 'Payments', 'Refunds', 'Expenses', 'Cash Drawer', 'Reports', 'Analytics', 'Suppliers'].includes(module)) {
          return true;
        }
        return false;

      default:
        return false;
    }
  };

  const loginAs = (role: UserRole) => {
    const userMatch = users.find(u => u.role === role) || users[0];
    setCurrentUser(userMatch);
    setCurrentRole(role);
    addAuditLog('Auth', 'Role Switch / Login', userMatch.id, `Logged in as ${role} (${userMatch.name})`);
  };

  const logout = () => {
    loginAs('Restaurant Owner');
  };

  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAuditLog('Settings', 'Update Profile', 'settings', 'Updated restaurant settings and parameters');
  };

  const addAuditLog = (module: string, action: string, recordId: string, summary: string, result: 'Success' | 'Warning' | 'Failed' = 'Success') => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser.name,
      role: currentRole,
      module,
      action,
      recordId,
      summary,
      result
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (type: SystemNotification['type'], title: string, message: string, linkPage?: string, relatedId?: string) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      linkPage,
      relatedId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Table operations
  const updateTableStatus = (tableId: string, status: TableStatus, details?: Partial<Table>) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status,
          ...(details || {}),
          ...(status === 'Available' ? { currentOrderId: undefined, reservationId: undefined, seatedAt: undefined, assignedServer: undefined } : {}),
          ...(status === 'Seated' && !t.seatedAt ? { seatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : {})
        };
      }
      return t;
    }));
    addAuditLog('Tables', 'Status Changed', tableId, `Table status changed to ${status}`);
  };

  const addTable = (tableData: Omit<Table, 'id'>) => {
    const newTable: Table = {
      ...tableData,
      id: `t-${Date.now()}`
    };
    setTables(prev => [...prev, newTable]);
    addAuditLog('Tables', 'Add Table', newTable.id, `Added table ${newTable.number} in ${newTable.section}`);
  };

  const updateTable = (updatedTable: Table) => {
    setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
    addAuditLog('Tables', 'Update Table', updatedTable.id, `Updated details for table ${updatedTable.number}`);
  };

  const transferTable = (sourceId: string, targetId: string) => {
    const sourceTable = tables.find(t => t.id === sourceId);
    const targetTable = tables.find(t => t.id === targetId);
    if (!sourceTable || !targetTable) return;

    setTables(prev => prev.map(t => {
      if (t.id === sourceId) {
        return {
          ...t,
          status: 'Cleaning',
          currentOrderId: undefined,
          reservationId: undefined,
          seatedAt: undefined,
          assignedServer: undefined
        };
      }
      if (t.id === targetId) {
        return {
          ...t,
          status: sourceTable.status,
          currentOrderId: sourceTable.currentOrderId,
          reservationId: sourceTable.reservationId,
          seatedAt: sourceTable.seatedAt,
          assignedServer: sourceTable.assignedServer
        };
      }
      return t;
    }));

    if (sourceTable.currentOrderId) {
      setOrders(prev => prev.map(o => o.id === sourceTable.currentOrderId ? { ...o, tableId: targetId, tableNumber: targetTable.number } : o));
    }

    addAuditLog('Tables', 'Transfer Table', targetId, `Transferred order and guests from ${sourceTable.number} to ${targetTable.number}`);
    addNotification('order', 'Table Transferred', `Order on ${sourceTable.number} moved to ${targetTable.number}`, 'tables', targetId);
  };

  const mergeTables = (t1Id: string, t2Id: string) => {
    const t1 = tables.find(t => t.id === t1Id);
    const t2 = tables.find(t => t.id === t2Id);
    if (!t1 || !t2) return;

    setTables(prev => prev.map(t => {
      if (t.id === t1Id) {
        return { ...t, mergedWith: [...(t.mergedWith || []), t2Id] };
      }
      if (t.id === t2Id) {
        return { ...t, status: 'Occupied', currentOrderId: t1.currentOrderId, mergedWith: [...(t.mergedWith || []), t1Id] };
      }
      return t;
    }));
    addAuditLog('Tables', 'Merge Tables', t1Id, `Merged table ${t1.number} with ${t2.number} for combined party`);
  };

  const splitTable = (tId: string) => {
    const table = tables.find(t => t.id === tId);
    if (!table || !table.mergedWith || table.mergedWith.length === 0) return;

    const mergedIds = table.mergedWith;
    setTables(prev => prev.map(t => {
      if (t.id === tId || mergedIds.includes(t.id)) {
        return { ...t, mergedWith: [] };
      }
      return t;
    }));
    addAuditLog('Tables', 'Split Table', tId, `Unlinked merged tables for ${table.number}`);
  };

  // Reservation actions
  const addReservation = (resData: Omit<Reservation, 'id' | 'createdAt'>) => {
    const newRes: Reservation = {
      ...resData,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setReservations(prev => [newRes, ...prev]);

    // If a table is assigned and status is confirmed, mark table reserved
    if (newRes.assignedTableId && newRes.status === 'Confirmed') {
      updateTableStatus(newRes.assignedTableId, 'Reserved', { reservationId: newRes.id });
    }

    addAuditLog('Reservations', 'Create Booking', newRes.id, `Booked table for ${newRes.guestName} (${newRes.partySize} guests) on ${newRes.date} at ${newRes.time}`);
    addNotification('reservation', 'New Reservation', `${newRes.guestName} booked for ${newRes.partySize} guests at ${newRes.time}`, 'reservations', newRes.id);
  };

  const updateReservation = (res: Reservation) => {
    setReservations(prev => prev.map(r => r.id === res.id ? res : r));
    addAuditLog('Reservations', 'Edit Booking', res.id, `Updated reservation details for ${res.guestName}`);
  };

  const cancelReservation = (resId: string, reason: string) => {
    const res = reservations.find(r => r.id === resId);
    if (!res) return;

    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'Cancelled', staffNotes: `${r.staffNotes || ''} | Cancelled: ${reason}` } : r));

    if (res.assignedTableId) {
      updateTableStatus(res.assignedTableId, 'Available');
    }

    addAuditLog('Reservations', 'Cancel Booking', resId, `Cancelled booking for ${res.guestName}. Reason: ${reason}`, 'Warning');
    addNotification('reservation', 'Reservation Cancelled', `${res.guestName} reservation cancelled: ${reason}`, 'reservations', resId);
  };

  const seatReservation = (resId: string, tableId: string) => {
    const res = reservations.find(r => r.id === resId);
    const table = tables.find(t => t.id === tableId);
    if (!res || !table) return;

    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'Seated', assignedTableId: tableId } : r));
    updateTableStatus(tableId, 'Seated', {
      reservationId: res.id,
      assignedServer: currentUser.name,
      seatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    addAuditLog('Reservations', 'Seat Guests', resId, `Seated ${res.guestName} at table ${table.number}`);
  };

  const checkInReservation = (resId: string) => {
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'Checked In' } : r));
    const res = reservations.find(r => r.id === resId);
    addAuditLog('Reservations', 'Check-In', resId, `Checked in guest ${res?.guestName}`);
  };

  // Waitlist actions
  const addWaitlist = (entry: Omit<WaitlistEntry, 'id' | 'createdAt'>) => {
    const newEntry: WaitlistEntry = {
      ...entry,
      id: `wl-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setWaitlist(prev => [newEntry, ...prev]);
    addAuditLog('Waitlist', 'Add Waitlist', newEntry.id, `Added ${newEntry.guestName} (${newEntry.partySize} guests) to waitlist`);
  };

  const seatWaitlist = (waitlistId: string, tableId: string) => {
    const entry = waitlist.find(w => w.id === waitlistId);
    const table = tables.find(t => t.id === tableId);
    if (!entry || !table) return;

    setWaitlist(prev => prev.map(w => w.id === waitlistId ? { ...w, status: 'Seated' } : w));
    updateTableStatus(tableId, 'Seated', {
      assignedServer: currentUser.name,
      seatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    addAuditLog('Waitlist', 'Seat Waitlist Guest', waitlistId, `Seated waitlist guest ${entry.guestName} at table ${table.number}`);
  };

  const removeWaitlist = (waitlistId: string) => {
    setWaitlist(prev => prev.filter(w => w.id !== waitlistId));
    addAuditLog('Waitlist', 'Remove Waitlist', waitlistId, `Removed guest from waitlist`);
  };

  const notifyWaitlist = (waitlistId: string) => {
    setWaitlist(prev => prev.map(w => w.id === waitlistId ? { ...w, status: 'Notified' } : w));
    const entry = waitlist.find(w => w.id === waitlistId);
    addNotification('reservation', 'Guest Notified', `Sent SMS/Notification to ${entry?.guestName} that table is ready`);
  };

  // Menu item actions
  const addMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `item-${Date.now()}`
    };
    setMenuItems(prev => [...prev, newItem]);
    addAuditLog('Menu', 'Add Item', newItem.id, `Added new menu item ${newItem.name} (₹${newItem.price})`);
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems(prev => prev.map(i => i.id === item.id ? item : i));
    addAuditLog('Menu', 'Update Item', item.id, `Updated details for ${item.name}`);
  };

  const deleteMenuItem = (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    setMenuItems(prev => prev.map(i => i.id === itemId ? { ...i, isArchived: true, isAvailable: false } : i));
    addAuditLog('Menu', 'Archive Item', itemId, `Archived menu item ${item?.name}`, 'Warning');
  };

  const toggleMenuItemAvailability = (itemId: string) => {
    setMenuItems(prev => prev.map(i => {
      if (i.id === itemId) {
        const nextAvail = !i.isAvailable;
        addAuditLog('Menu', 'Item Availability', itemId, `Marked ${i.name} as ${nextAvail ? 'Available' : 'Sold Out'}`);
        return { ...i, isAvailable: nextAvail };
      }
      return i;
    }));
  };

  const addCategory = (catData: Omit<MenuCategory, 'id'>) => {
    const newCat: MenuCategory = { ...catData, id: `cat-${Date.now()}` };
    setMenuCategories(prev => [...prev, newCat]);
    addAuditLog('Menu', 'Add Category', newCat.id, `Added menu category ${newCat.name}`);
  };

  const updateCategory = (cat: MenuCategory) => {
    setMenuCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
    addAuditLog('Menu', 'Update Category', cat.id, `Updated category ${cat.name}`);
  };

  const deleteCategory = (catId: string) => {
    setMenuCategories(prev => prev.filter(c => c.id !== catId));
    addAuditLog('Menu', 'Delete Category', catId, `Removed category ${catId}`, 'Warning');
  };

  const addModifierGroup = (groupData: Omit<ModifierGroup, 'id'>) => {
    const newGroup: ModifierGroup = { ...groupData, id: `mod-${Date.now()}` };
    setModifierGroups(prev => [...prev, newGroup]);
    addAuditLog('Menu', 'Add Modifier Group', newGroup.id, `Added modifier group ${newGroup.name}`);
  };

  const updateModifierGroup = (group: ModifierGroup) => {
    setModifierGroups(prev => prev.map(g => g.id === group.id ? group : g));
    addAuditLog('Menu', 'Update Modifier Group', group.id, `Updated modifier group ${group.name}`);
  };

  const addRecipe = (recipeData: Omit<Recipe, 'id'>) => {
    const newRec: Recipe = { ...recipeData, id: `rec-${Date.now()}` };
    setRecipes(prev => [...prev, newRec]);
    addAuditLog('Recipes', 'Add Recipe', newRec.id, `Created recipe for ${newRec.menuItemName}`);
  };

  const updateRecipe = (recipe: Recipe) => {
    setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r));
    addAuditLog('Recipes', 'Update Recipe', recipe.id, `Updated recipe for ${recipe.menuItemName}`);
  };

  // Orders & POS
  const createOrder = (orderData: Partial<Order>, directToKitchen = true): Order => {
    const orderNum = `ORD-2026-${orders.length + 105}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      branchId: currentBranchId,
      tableId: orderData.tableId,
      tableNumber: orderData.tableNumber,
      source: orderData.source || 'Dine-in',
      customerName: orderData.customerName || 'Walk-in Guest',
      customerPhone: orderData.customerPhone,
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      discountAmount: orderData.discountAmount || 0,
      discountType: orderData.discountType,
      discountReason: orderData.discountReason,
      taxAmount: orderData.taxAmount || 0,
      serviceCharge: orderData.serviceCharge || 0,
      totalAmount: orderData.totalAmount || 0,
      status: directToKitchen ? 'Preparing' : 'New',
      paymentStatus: 'Unpaid',
      cashierName: currentUser.name,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      specialInstructions: orderData.specialInstructions
    };

    setOrders(prev => [newOrder, ...prev]);

    // If Dine-in, update table
    if (newOrder.tableId) {
      updateTableStatus(newOrder.tableId, 'Occupied', {
        currentOrderId: newOrder.id,
        assignedServer: currentUser.name
      });
    }

    // Automatically create Kitchen Tickets grouped by station or overall
    if (directToKitchen && newOrder.items.length > 0) {
      // Group items by prepStation
      const stationMap: Record<string, OrderItem[]> = {};
      newOrder.items.forEach(item => {
        const station = item.prepStation || 'Main Kitchen';
        if (!stationMap[station]) stationMap[station] = [];
        stationMap[station].push(item);
      });

      const newTickets: KitchenTicket[] = Object.entries(stationMap).map(([station, items], index) => ({
        id: `kt-${Date.now()}-${index}`,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        tableNumber: newOrder.tableNumber,
        source: newOrder.source,
        station,
        items,
        priority: 'Normal',
        status: 'Preparing',
        createdAt: newOrder.createdAt,
        startedAt: newOrder.createdAt,
        notes: newOrder.specialInstructions
      }));

      setKitchenTickets(prev => [...newTickets, ...prev]);

      // Deduct inventory items mapped via recipes
      newOrder.items.forEach(item => {
        const recipe = recipes.find(r => r.menuItemId === item.menuItemId);
        if (recipe) {
          recipe.ingredients.forEach(ing => {
            adjustStock(
              ing.inventoryItemId,
              -(ing.quantity * item.quantity),
              `Auto-deduction: ${item.quantity}x ${item.name} (${orderNum})`,
              'Recipe Deduction'
            );
          });
        }
      });
    }

    addAuditLog('Orders', 'Create Order', newOrder.id, `Created ${newOrder.source} order ${newOrder.orderNumber} for ₹${newOrder.totalAmount.toFixed(2)}`);
    addNotification('order', 'New Order Received', `${newOrder.orderNumber} placed for ${newOrder.tableNumber ? 'Table ' + newOrder.tableNumber : newOrder.source}`, 'orders', newOrder.id);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = {
          ...o,
          status,
          ...(status === 'Completed' ? { completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : {})
        };
        // If order completed or cancelled and has table, mark table cleaning
        if ((status === 'Completed' || status === 'Cancelled') && o.tableId) {
          updateTableStatus(o.tableId, status === 'Completed' ? 'Cleaning' : 'Available');
        }
        return updated;
      }
      return o;
    }));

    addAuditLog('Orders', 'Order Status Update', orderId, `Order status changed to ${status}`);
    addNotification('order', 'Order Status Update', `Order status updated to ${status}`, 'orders', orderId);
  };

  const cancelOrder = (orderId: string, reason: string) => {
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled', cancellationReason: reason } : o));
    if (ord.tableId) {
      updateTableStatus(ord.tableId, 'Available');
    }
    setKitchenTickets(prev => prev.map(k => k.orderId === orderId ? { ...k, status: 'Completed', notes: `ORDER CANCELLED: ${reason}` } : k));

    addAuditLog('Orders', 'Cancel Order', orderId, `Order ${ord.orderNumber} cancelled. Reason: ${reason}`, 'Warning');
    addNotification('order', 'Order Cancelled', `Order ${ord.orderNumber} cancelled by staff`, 'orders', orderId);
  };

  const updateKitchenTicketStatus = (ticketId: string, status: KitchenTicket['status']) => {
    setKitchenTickets(prev => prev.map(kt => {
      if (kt.id === ticketId) {
        return {
          ...kt,
          status,
          ...(status === 'Preparing' && !kt.startedAt ? { startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : {}),
          ...(status === 'Ready' && !kt.readyAt ? { readyAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : {})
        };
      }
      return kt;
    }));

    const ticket = kitchenTickets.find(kt => kt.id === ticketId);
    if (ticket && status === 'Ready') {
      addNotification('kitchen', 'Kitchen Ticket Ready', `${ticket.tableNumber ? 'Table ' + ticket.tableNumber : ticket.orderNumber} [${ticket.station}] is ready to serve!`, 'kds', ticketId);
    }
    addAuditLog('KDS', 'Ticket Status', ticketId, `Ticket ${ticket?.orderNumber} station ${ticket?.station} marked ${status}`);
  };

  const flagKitchenDelay = (ticketId: string, reason: string) => {
    setKitchenTickets(prev => prev.map(kt => kt.id === ticketId ? { ...kt, isDelayed: true, delayReason: reason } : kt));
    const ticket = kitchenTickets.find(kt => kt.id === ticketId);
    addNotification('kitchen', 'Kitchen Delay Alert', `Delay on ${ticket?.orderNumber} (${ticket?.station}): ${reason}`, 'kds', ticketId);
    addAuditLog('KDS', 'Flag Delay', ticketId, `Delay flagged on ticket ${ticket?.orderNumber}: ${reason}`, 'Warning');
  };

  // Payments & Refunds
  const processPayment = (paymentData: Omit<Payment, 'id' | 'createdAt'>): Payment => {
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setPayments(prev => [newPayment, ...prev]);

    // Update order payment status
    setOrders(prev => prev.map(o => {
      if (o.id === newPayment.orderId) {
        return {
          ...o,
          paymentStatus: 'Paid',
          paymentMethod: newPayment.method,
          status: 'Completed',
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return o;
    }));

    // Update table status to cleaning if dine-in
    const relatedOrder = orders.find(o => o.id === newPayment.orderId);
    if (relatedOrder?.tableId) {
      updateTableStatus(relatedOrder.tableId, 'Cleaning');
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // Ignored if window not focused
    }

    addAuditLog('Finance', 'Payment Recorded', newPayment.id, `Recorded ₹${newPayment.amount.toFixed(2)} payment via ${newPayment.method} for ${newPayment.orderNumber}`);
    addNotification('payment', 'Payment Received', `₹${newPayment.amount.toFixed(2)} received for ${newPayment.orderNumber} via ${newPayment.method}`, 'payments', newPayment.id);

    return newPayment;
  };

  const processRefund = (refundData: Omit<Refund, 'id' | 'createdAt'>) => {
    const newRefund: Refund = {
      ...refundData,
      id: `ref-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setRefunds(prev => [newRefund, ...prev]);

    setOrders(prev => prev.map(o => o.id === newRefund.orderId ? { ...o, paymentStatus: 'Refunded', status: 'Refunded' } : o));

    addAuditLog('Finance', 'Refund Issued', newRefund.id, `Issued refund of ₹${newRefund.amount.toFixed(2)} on order ${newRefund.orderNumber}. Reason: ${newRefund.reason}`, 'Warning');
    addNotification('payment', 'Refund Processed', `₹${newRefund.amount.toFixed(2)} refunded on ${newRefund.orderNumber}`, 'refunds', newRefund.id);
  };

  // Inventory actions
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'status'>) => {
    const status: InventoryItem['status'] = itemData.currentStock <= 0 ? 'Out of Stock' : itemData.currentStock <= itemData.reorderLevel ? 'Low Stock' : 'In Stock';
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      status
    };
    setInventory(prev => [...prev, newItem]);
    addAuditLog('Inventory', 'Add Stock Item', newItem.id, `Added stock item ${newItem.name} (${newItem.currentStock} ${newItem.unit})`);
  };

  const updateInventoryItem = (item: InventoryItem) => {
    const status: InventoryItem['status'] = item.currentStock <= 0 ? 'Out of Stock' : item.currentStock <= item.reorderLevel ? 'Low Stock' : 'In Stock';
    setInventory(prev => prev.map(i => i.id === item.id ? { ...item, status } : i));
    addAuditLog('Inventory', 'Update Stock Item', item.id, `Updated stock parameters for ${item.name}`);
  };

  const adjustStock = (itemId: string, delta: number, reason: string, type: StockMovement['type']) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, +(item.currentStock + delta).toFixed(2));
        const newStatus: InventoryItem['status'] = newStock <= 0 ? 'Out of Stock' : newStock <= item.reorderLevel ? 'Low Stock' : 'In Stock';

        // Record movement
        const movement: StockMovement = {
          id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          inventoryItemId: item.id,
          itemName: item.name,
          delta,
          balanceAfter: newStock,
          type,
          reason,
          performedBy: currentUser.name,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        setStockMovements(mPrev => [movement, ...mPrev]);

        // If low stock, trigger notification
        if (newStatus === 'Low Stock' || newStatus === 'Out of Stock') {
          addNotification('stock', `Stock Warning: ${item.name}`, `${item.name} is now at ${newStock} ${item.unit} (Reorder level: ${item.reorderLevel} ${item.unit})`, 'inventory', item.id);
        }

        return { ...item, currentStock: newStock, status: newStatus };
      }
      return item;
    }));

    const targetItem = inventory.find(i => i.id === itemId);
    addAuditLog('Inventory', 'Stock Adjustment', itemId, `Adjusted ${targetItem?.name} by ${delta > 0 ? '+' : ''}${delta}. Reason: ${reason}`);
  };

  // Suppliers & POs
  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = { ...supplierData, id: `sup-${Date.now()}` };
    setSuppliers(prev => [...prev, newSup]);
    addAuditLog('Suppliers', 'Add Supplier', newSup.id, `Added supplier ${newSup.name}`);
  };

  const updateSupplier = (supplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
    addAuditLog('Suppliers', 'Update Supplier', supplier.id, `Updated supplier ${supplier.name}`);
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'status' | 'approvalStatus' | 'createdBy'>) => {
    const poNum = `PO-${8020 + purchaseOrders.length + 1}`;
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      poNumber: poNum,
      status: 'Pending Approval',
      approvalStatus: 'Pending',
      createdBy: currentUser.name
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
    addAuditLog('Purchasing', 'Create PO', newPO.id, `Created purchase order ${newPO.poNumber} for ₹${newPO.totalAmount.toFixed(2)} to ${newPO.supplierName}`);
    addNotification('approval', 'PO Approval Required', `${newPO.poNumber} (${newPO.supplierName}) created for ₹${newPO.totalAmount.toFixed(2)}`, 'purchase-orders', newPO.id);
  };

  const approvePurchaseOrder = (poId: string) => {
    setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, status: 'Approved', approvalStatus: 'Approved', approvedBy: currentUser.name } : po));
    const po = purchaseOrders.find(p => p.id === poId);
    addAuditLog('Purchasing', 'Approve PO', poId, `Approved purchase order ${po?.poNumber}`);
    addNotification('approval', 'PO Approved', `${po?.poNumber} was approved by ${currentUser.name}`, 'purchase-orders', poId);
  };

  const rejectPurchaseOrder = (poId: string, reason: string) => {
    setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, status: 'Cancelled', approvalStatus: 'Rejected', rejectionReason: reason } : po));
    const po = purchaseOrders.find(p => p.id === poId);
    addAuditLog('Purchasing', 'Reject PO', poId, `Rejected PO ${po?.poNumber}. Reason: ${reason}`, 'Warning');
  };

  const sendPurchaseOrder = (poId: string) => {
    setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, status: 'Sent' } : po));
    const po = purchaseOrders.find(p => p.id === poId);
    addAuditLog('Purchasing', 'Send PO', poId, `Sent purchase order ${po?.poNumber} to supplier ${po?.supplierName}`);
    addNotification('approval', 'PO Sent to Supplier', `${po?.poNumber} sent to ${po?.supplierName}`, 'purchase-orders', poId);
  };

  const receiveGoods = (poId: string, itemsReceived: { inventoryItemId: string; receivedQty: number; rejectedQty: number }[]) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    let allReceived = true;
    const updatedItems = po.items.map(item => {
      const match = itemsReceived.find(r => r.inventoryItemId === item.inventoryItemId);
      if (match) {
        const newTotalReceived = item.receivedQuantity + match.receivedQty;
        if (newTotalReceived < item.quantity) allReceived = false;

        // Update inventory stock with accepted quantity
        if (match.receivedQty > 0) {
          adjustStock(
            item.inventoryItemId,
            match.receivedQty,
            `Received from ${po.poNumber} (${po.supplierName})`,
            'PO Received'
          );
        }

        return { ...item, receivedQuantity: newTotalReceived };
      }
      return item;
    });

    const nextStatus: PurchaseOrder['status'] = allReceived ? 'Received' : 'Partially Received';

    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, items: updatedItems, status: nextStatus } : p));
    addAuditLog('Purchasing', 'Receive Goods', poId, `Received items on PO ${po.poNumber}. New status: ${nextStatus}`);
    addNotification('stock', 'Stock Goods Received', `Shipment accepted for ${po.poNumber}. Inventory has been updated.`, 'purchase-orders', poId);
  };

  // Customers & Feedback
  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt' | 'totalVisits' | 'totalSpend' | 'loyaltyPoints'>) => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      totalVisits: 1,
      totalSpend: 0,
      loyaltyPoints: 50,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setCustomers(prev => [...prev, newCust]);
    addAuditLog('Customers', 'Add Customer', newCust.id, `Created customer profile for ${newCust.name}`);
  };

  const updateCustomer = (cust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === cust.id ? cust : c));
    addAuditLog('Customers', 'Update Customer', cust.id, `Updated customer profile for ${cust.name}`);
  };

  const addFeedback = (fbData: Omit<Feedback, 'id' | 'createdAt'>) => {
    const newFb: Feedback = {
      ...fbData,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setFeedback(prev => [newFb, ...prev]);
    addAuditLog('Feedback', 'New Review', newFb.id, `Received ${newFb.rating}★ rating from ${newFb.customerName}`);
    addNotification('reservation', 'New Feedback Received', `${newFb.rating}★ review from ${newFb.customerName}: "${newFb.comment.substring(0, 40)}..."`, 'feedback', newFb.id);
  };

  const replyFeedback = (fbId: string, reply: string) => {
    setFeedback(prev => prev.map(f => f.id === fbId ? { ...f, managerReply: reply, status: 'Reviewed' } : f));
    addAuditLog('Feedback', 'Reply to Review', fbId, `Replied to review by manager ${currentUser.name}`);
  };

  // Staff & Attendance
  const addStaff = (staffData: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = { ...staffData, id: `stf-${Date.now()}` };
    setStaff(prev => [...prev, newStaff]);
    addAuditLog('Staff', 'Add Staff', newStaff.id, `Registered staff member ${newStaff.name} as ${newStaff.role}`);
  };

  const updateStaff = (s: StaffMember) => {
    setStaff(prev => prev.map(st => st.id === s.id ? s : st));
    addAuditLog('Staff', 'Update Staff', s.id, `Updated details for staff member ${s.name}`);
  };

  const clockIn = (staffId: string) => {
    const stf = staff.find(s => s.id === staffId);
    if (!stf) return;

    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, currentAttendanceStatus: 'Clocked In' } : s));

    const todayStr = new Date().toISOString().substring(0, 10);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      staffId: stf.id,
      staffName: stf.name,
      date: todayStr,
      clockIn: timeStr,
      breakDurationMinutes: 0,
      totalHours: 0,
      status: 'On Time'
    };

    setAttendance(prev => [newRecord, ...prev]);
    addAuditLog('Attendance', 'Clock In', staffId, `${stf.name} clocked in at ${timeStr}`);
  };

  const clockOut = (staffId: string) => {
    const stf = staff.find(s => s.id === staffId);
    if (!stf) return;

    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, currentAttendanceStatus: 'Clocked Out' } : s));

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAttendance(prev => prev.map(att => {
      if (att.staffId === staffId && !att.clockOut) {
        return { ...att, clockOut: timeStr, totalHours: 8.0 };
      }
      return att;
    }));

    addAuditLog('Attendance', 'Clock Out', staffId, `${stf.name} clocked out at ${timeStr}`);
  };

  const toggleChecklistTask = (taskId: string) => {
    setChecklists(prev => prev.map(task => {
      if (task.id === taskId) {
        const nextState = !task.isCompleted;
        return {
          ...task,
          isCompleted: nextState,
          completedBy: nextState ? currentUser.name : undefined,
          completedAt: nextState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
        };
      }
      return task;
    }));
  };

  const addChecklistTask = (taskData: Omit<ChecklistTask, 'id' | 'isCompleted'>) => {
    const newTask: ChecklistTask = {
      ...taskData,
      id: `chk-${Date.now()}`,
      isCompleted: false
    };
    setChecklists(prev => [...prev, newTask]);
    addAuditLog('Checklists', 'Add Task', newTask.id, `Added checklist task "${newTask.name}" for ${newTask.assignedRole}`);
  };

  const reportChecklistIssue = (taskId: string, issue: string) => {
    setChecklists(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, reportedIssue: issue };
      }
      return task;
    }));
    addAuditLog('Checklists', 'Flag Issue', taskId, `Flagged issue on task: ${issue}`, 'Warning');
    addNotification('kitchen', 'Checklist Issue Reported', issue, 'checklists', taskId);
  };

  const addShift = (shiftData: Omit<Shift, 'id'>) => {
    const newShift: Shift = { ...shiftData, id: `sh-${Date.now()}` };
    setShifts(prev => [...prev, newShift]);
    addAuditLog('Staff', 'Schedule Shift', newShift.id, `Scheduled shift for ${newShift.staffName} on ${newShift.date} (${newShift.startTime}-${newShift.endTime})`);
  };

  const addBranch = (bData: Omit<Branch, 'id'>) => {
    const newBranch: Branch = { ...bData, id: `b-${Date.now()}` };
    setBranches(prev => [...prev, newBranch]);
    addAuditLog('Settings', 'Add Branch', newBranch.id, `Created new restaurant branch: ${newBranch.name}`);
  };

  const updateBranch = (bData: Branch) => {
    setBranches(prev => prev.map(b => b.id === bData.id ? bData : b));
    addAuditLog('Settings', 'Update Branch', bData.id, `Updated branch details for ${bData.name}`);
  };

  const addUser = (uData: Omit<User, 'id'>) => {
    const newUser: User = { ...uData, id: `u-${Date.now()}` };
    setUsers(prev => [...prev, newUser]);
    addAuditLog('Settings', 'Add User', newUser.id, `Created system user: ${newUser.name} (${newUser.role})`);
  };

  const updateUser = (uData: User) => {
    setUsers(prev => prev.map(u => u.id === uData.id ? uData : u));
    addAuditLog('Settings', 'Update User', uData.id, `Updated user account for ${uData.name}`);
  };

  // Finance & Expenses
  const addExpense = (expData: Omit<Expense, 'id' | 'expenseNumber' | 'status' | 'createdAt'>) => {
    const expNum = `EXP-2026-${expenses.length + 45}`;
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      expenseNumber: expNum,
      status: 'Pending Approval',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setExpenses(prev => [newExp, ...prev]);
    addAuditLog('Finance', 'Submit Expense', newExp.id, `Submitted expense ${newExp.expenseNumber} for ₹${newExp.amount.toFixed(2)} (${newExp.title})`);
    addNotification('approval', 'Expense Approval Needed', `${newExp.expenseNumber} (${newExp.title}) submitted for ₹${newExp.amount.toFixed(2)}`, 'expenses', newExp.id);
  };

  const approveExpense = (expId: string) => {
    setExpenses(prev => prev.map(e => e.id === expId ? { ...e, status: 'Approved', approvedBy: currentUser.name } : e));
    const exp = expenses.find(e => e.id === expId);
    addAuditLog('Finance', 'Approve Expense', expId, `Approved expense ${exp?.expenseNumber} (₹${exp?.amount.toFixed(2)})`);
    addNotification('approval', 'Expense Approved', `${exp?.expenseNumber} was approved by ${currentUser.name}`, 'expenses', expId);
  };

  const rejectExpense = (expId: string, reason: string) => {
    setExpenses(prev => prev.map(e => e.id === expId ? { ...e, status: 'Rejected', rejectionReason: reason } : e));
    const exp = expenses.find(e => e.id === expId);
    addAuditLog('Finance', 'Reject Expense', expId, `Rejected expense ${exp?.expenseNumber}. Reason: ${reason}`, 'Warning');
  };

  const recordCashClosing = (ccData: Omit<CashClosing, 'id' | 'closingNumber' | 'status' | 'createdAt'>) => {
    const ccNum = `CLS-${new Date().toISOString().substring(0, 10)}-${Math.floor(Math.random() * 900 + 100)}`;
    const newClosing: CashClosing = {
      ...ccData,
      id: `cc-${Date.now()}`,
      closingNumber: ccNum,
      status: 'Pending Approval',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setCashClosings(prev => [newClosing, ...prev]);
    addAuditLog('Finance', 'Cash Closing Submitted', newClosing.id, `Cash closing ${newClosing.closingNumber} submitted by ${newClosing.cashierName}. Variance: ₹${newClosing.variance}`);
    addNotification('approval', 'Shift Cash Closing Awaiting Review', `Closing report ${newClosing.closingNumber} submitted with variance ₹${newClosing.variance}`, 'cash-drawer', newClosing.id);
  };

  const approveCashClosing = (ccId: string) => {
    setCashClosings(prev => prev.map(c => c.id === ccId ? { ...c, status: 'Approved', approvedBy: currentUser.name } : c));
    const cc = cashClosings.find(c => c.id === ccId);
    addAuditLog('Finance', 'Approve Cash Closing', ccId, `Approved closing report ${cc?.closingNumber}`);
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(initialSettings);
    setBranches(initialBranches);
    setUsers(initialUsers);
    setTables(initialTables);
    setReservations(initialReservations);
    setWaitlist(initialWaitlist);
    setMenuCategories(initialMenuCategories);
    setModifierGroups(initialModifierGroups);
    setMenuItems(initialMenuItems);
    setRecipes(initialRecipes);
    setInventory(initialInventory);
    setStockMovements(initialStockMovements);
    setSuppliers(initialSuppliers);
    setPurchaseOrders(initialPurchaseOrders);
    setOrders(initialOrders);
    setKitchenTickets(initialKitchenTickets);
    setPayments(initialPayments);
    setRefunds(initialRefunds);
    setCustomers(initialCustomers);
    setFeedback(initialFeedback);
    setStaff(initialStaff);
    setAttendance(initialAttendance);
    setShifts(initialShifts);
    setChecklists(initialChecklists);
    setExpenses(initialExpenses);
    setCashClosings(initialCashClosings);
    setNotifications(initialNotifications);
    setAuditLogs(initialAuditLogs);
    addAuditLog('System', 'Reset Database', 'sys', 'Reset all tables and collections to seed demo data', 'Warning');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        setCurrentUser,
        logout,
        loginAs,
        hasPermission,
        currentBranchId,
        setCurrentBranchId,
        currentBranch,
        dateFilter,
        setDateFilter,
        settings,
        updateSettings,
        branches,
        users,
        tables,
        reservations,
        waitlist,
        menuCategories,
        modifierGroups,
        menuItems,
        recipes,
        inventory,
        stockMovements,
        suppliers,
        purchaseOrders,
        orders,
        kitchenTickets,
        payments,
        refunds,
        customers,
        feedback,
        staff,
        attendance,
        shifts,
        checklists,
        expenses,
        cashClosings,
        notifications,
        auditLogs,
        addAuditLog,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        updateTableStatus,
        addTable,
        updateTable,
        transferTable,
        mergeTables,
        splitTable,
        addReservation,
        updateReservation,
        cancelReservation,
        seatReservation,
        checkInReservation,
        addWaitlist,
        seatWaitlist,
        removeWaitlist,
        notifyWaitlist,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuItemAvailability,
        addCategory,
        updateCategory,
        deleteCategory,
        addModifierGroup,
        updateModifierGroup,
        addRecipe,
        updateRecipe,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        updateKitchenTicketStatus,
        flagKitchenDelay,
        processPayment,
        processRefund,
        addInventoryItem,
        updateInventoryItem,
        adjustStock,
        addSupplier,
        updateSupplier,
        createPurchaseOrder,
        approvePurchaseOrder,
        rejectPurchaseOrder,
        sendPurchaseOrder,
        receiveGoods,
        addCustomer,
        updateCustomer,
        addFeedback,
        replyFeedback,
        addStaff,
        updateStaff,
        clockIn,
        clockOut,
        toggleChecklistTask,
        addChecklistTask,
        reportChecklistIssue,
        addShift,
        addBranch,
        updateBranch,
        addUser,
        updateUser,
        addExpense,
        approveExpense,
        rejectExpense,
        recordCashClosing,
        approveCashClosing,
        resetToDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
