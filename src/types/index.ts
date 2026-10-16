export type UserRole = 
  | 'Restaurant Owner'
  | 'Manager'
  | 'Cashier'
  | 'Kitchen Staff'
  | 'Host / Waiter'
  | 'Accountant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  branchId: string;
  avatar?: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  operatingHours: string;
  timezone: string;
  isDefault?: boolean;
  status: 'Active' | 'Inactive';
}

export type TableStatus = 
  | 'Available'
  | 'Reserved'
  | 'Seated'
  | 'Ordering'
  | 'Occupied'
  | 'Bill Requested'
  | 'Cleaning'
  | 'Out of Service';

export interface Table {
  id: string;
  number: string;
  capacity: number;
  section: 'Indoor' | 'Outdoor Terrace' | 'Bar Lounge' | 'Private Dining';
  status: TableStatus;
  currentOrderId?: string;
  reservationId?: string;
  assignedServer?: string;
  seatedAt?: string;
  branchId: string;
  mergedWith?: string[]; // IDs of other tables merged
}

export type ReservationStatus = 
  | 'Confirmed'
  | 'Checked In'
  | 'Seated'
  | 'Completed'
  | 'Cancelled'
  | 'No-show'
  | 'Draft';

export interface Reservation {
  id: string;
  guestName: string;
  phone: string;
  email?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  partySize: number;
  expectedDuration: number; // in minutes, e.g. 90
  seatingPreference: 'Indoor' | 'Outdoor' | 'Window' | 'Any';
  occasion?: 'Birthday' | 'Anniversary' | 'Business' | 'Family' | 'Other';
  assignedTableId?: string;
  bookingSource: 'Phone' | 'Walk-in' | 'Website' | 'QR' | 'Other';
  specialRequests?: string;
  depositAmount?: number;
  staffNotes?: string;
  status: ReservationStatus;
  branchId: string;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  guestName: string;
  phone: string;
  partySize: number;
  preferredSection: string;
  notes?: string;
  estimatedWaitMinutes: number;
  status: 'Waiting' | 'Notified' | 'Seated' | 'Cancelled';
  createdAt: string;
  branchId: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  status: 'Active' | 'Inactive';
  itemCount?: number;
  icon?: string;
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  price: number;
  taxRate: number; // e.g. 5 for 5% GST
  prepStation: 'Main Kitchen' | 'Tandoor & Grill' | 'Drinks & Bar' | 'Dessert & Bakery' | 'Pantry';
  isAvailable: boolean;
  dietaryTags: ('Vegetarian' | 'Non-Veg' | 'Vegan' | 'Gluten-Free' | 'Chef Special')[];
  allergens: string[];
  image: string;
  prepTimeMinutes: number;
  modifierGroupIds?: string[];
  recipeId?: string;
  displayOrder: number;
  isArchived?: boolean;
}

export interface RecipeIngredient {
  inventoryItemId: string;
  quantity: number;
  unit: string;
  wastePercentage?: number;
}

export interface Recipe {
  id: string;
  menuItemId: string;
  menuItemName: string;
  yieldServings: number;
  ingredients: RecipeIngredient[];
  preparationNotes?: string;
  estimatedCost?: number;
  status: 'Active' | 'Inactive';
}

export interface OrderItemModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiers?: OrderItemModifier[];
  notes?: string;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served';
  prepStation: string;
}

export type OrderStatus = 
  | 'New'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Served'
  | 'Completed'
  | 'Cancelled'
  | 'Refunded';

export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Refunded';

export type OrderSource = 'Dine-in' | 'QR Order' | 'Takeaway' | 'Delivery';

export interface Order {
  id: string;
  orderNumber: string; // e.g. ORD-2026-101
  branchId: string;
  tableId?: string;
  tableNumber?: string;
  source: OrderSource;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  discountType?: 'percentage' | 'fixed';
  discountReason?: string;
  taxAmount: number; // 5% GST
  serviceCharge: number; // 5% Service charge
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'Cash' | 'Card' | 'UPI' | 'Split' | 'Other';
  cashierName?: string;
  createdAt: string;
  completedAt?: string;
  cancellationReason?: string;
  specialInstructions?: string;
}

export interface KitchenTicket {
  id: string;
  orderId: string;
  orderNumber: string;
  tableNumber?: string;
  source: OrderSource;
  station: string;
  items: OrderItem[];
  priority: 'Normal' | 'Rush' | 'VIP';
  status: 'New' | 'Preparing' | 'Ready' | 'Completed';
  createdAt: string;
  startedAt?: string;
  readyAt?: string;
  isDelayed?: boolean;
  delayReason?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  branchId: string;
  amount: number;
  method: 'Cash' | 'Card' | 'UPI' | 'Split';
  status: 'Success' | 'Pending' | 'Failed';
  referenceId: string;
  cashierName: string;
  tenderedAmount?: number;
  changeDue?: number;
  createdAt: string;
  notes?: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  reason: string;
  authorizedBy: string;
  status: 'Completed' | 'Pending';
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: 'Produce & Veg' | 'Meat & Poultry' | 'Dairy' | 'Spices & Staples' | 'Beverages' | 'Packaging';
  currentStock: number;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'pcs' | 'packs';
  reorderLevel: number;
  unitCost: number;
  supplierId: string;
  supplierName: string;
  storageLocation: string;
  batchNumber?: string;
  expiryDate?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  branchId: string;
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  itemName: string;
  delta: number; // + or -
  balanceAfter: number;
  type: 'PO Received' | 'Recipe Deduction' | 'Waste / Spoilage' | 'Correction' | 'Return' | 'Opening Stock';
  reason: string;
  performedBy: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxId?: string; // GSTIN
  paymentTerms: 'Net 15' | 'Net 30' | 'COD' | 'Immediate';
  categories: string[];
  outstandingAmount: number;
  status: 'Active' | 'Inactive';
}

export interface PurchaseOrderItem {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  lineTotal: number;
  receivedQuantity: number;
}

export type POStatus = 
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Sent'
  | 'Partially Received'
  | 'Received'
  | 'Cancelled';

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. PO-8021
  supplierId: string;
  supplierName: string;
  branchId: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  orderDate: string;
  expectedDeliveryDate: string;
  status: POStatus;
  approvalStatus: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  createdBy: string;
  approvedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface GoodsReceipt {
  id: string;
  poId: string;
  poNumber: string;
  supplierName: string;
  receivedDate: string;
  receivedBy: string;
  itemsReceived: {
    inventoryItemId: string;
    itemName: string;
    orderedQty: number;
    receivedQty: number;
    rejectedQty: number;
    notes?: string;
  }[];
  totalAcceptedValue: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  totalVisits: number;
  totalSpend: number;
  loyaltyPoints: number;
  lastVisitDate: string;
  tags: ('VIP' | 'Regular' | 'Corporate' | 'Vegetarian' | 'Weekend Diner')[];
  dietaryPreferences?: string;
  allergyNotes?: string;
  marketingConsent: boolean;
  notes?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  customerName: string;
  customerPhone?: string;
  orderId?: string;
  orderNumber?: string;
  rating: number; // 1-5
  foodRating: number;
  serviceRating: number;
  ambienceRating: number;
  comment: string;
  status: 'New' | 'Reviewed' | 'Followed Up';
  assignedStaff?: string;
  managerReply?: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  employeeId: string; // e.g. EMP-101
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  branchId: string;
  branchName: string;
  joiningDate: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  emergencyContact?: string;
  currentAttendanceStatus?: 'Clocked In' | 'On Break' | 'Clocked Out';
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakDurationMinutes: number;
  totalHours: number;
  status: 'On Time' | 'Late' | 'Half Day' | 'Overtime';
  correctionRequested?: boolean;
  correctionReason?: string;
  correctionApproved?: boolean;
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  role: UserRole;
  branchId: string;
  date: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  station?: string;
  notes?: string;
  isPublished: boolean;
}

export interface ChecklistTask {
  id: string;
  name: string;
  category: 'Opening Checklist' | 'Closing Checklist' | 'Kitchen Sanitation' | 'Food Safety & Temp' | 'Cash Shift Closing';
  assignedRole: UserRole;
  dueTime: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  reportedIssue?: string;
}

export interface Expense {
  id: string;
  expenseNumber: string; // e.g. EXP-2026-44
  title: string;
  category: 'Rent & Lease' | 'Food Supplies' | 'Utilities & Power' | 'Repairs & Maintenance' | 'Salaries & Wages' | 'Marketing' | 'Transport' | 'Other';
  vendor: string;
  date: string;
  amount: number;
  taxAmount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI' | 'Corporate Card';
  branchId: string;
  receiptUrl?: string;
  notes?: string;
  submittedBy: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface CashClosing {
  id: string;
  closingNumber: string;
  date: string;
  shift: 'Morning Shift' | 'Evening Shift' | 'Full Day';
  cashierName: string;
  branchId: string;
  openingCash: number;
  cashSales: number;
  cashRefunds: number;
  cashIn: number;
  cashOut: number;
  expectedClosingCash: number;
  countedCash: number;
  variance: number;
  denominations: {
    d2000: number;
    d500: number;
    d200: number;
    d100: number;
    d50: number;
    d20: number;
    d10: number;
    coins: number;
  };
  notes?: string;
  status: 'Pending Approval' | 'Approved';
  approvedBy?: string;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  type: 'reservation' | 'order' | 'kitchen' | 'stock' | 'approval' | 'attendance' | 'payment';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  linkPage?: string;
  relatedId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  module: string;
  action: string;
  recordId: string;
  summary: string;
  result: 'Success' | 'Warning' | 'Failed';
}

export interface RestaurantSettings {
  name: string;
  slogan: string;
  logo: string;
  gstin: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  defaultTaxRate: number; // 5%
  serviceChargeRate: number; // 5%
  isServiceChargeEnabled: boolean;
  operatingHours: {
    day: string;
    open: string;
    close: string;
    isClosed?: boolean;
  }[];
}
