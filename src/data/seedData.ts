import {
  RestaurantSettings,
  Branch,
  User,
  Table,
  Reservation,
  WaitlistEntry,
  MenuCategory,
  ModifierGroup,
  MenuItem,
  Recipe,
  InventoryItem,
  StockMovement,
  Supplier,
  PurchaseOrder,
  Order,
  KitchenTicket,
  Payment,
  Refund,
  Customer,
  Feedback,
  StaffMember,
  AttendanceRecord,
  Shift,
  ChecklistTask,
  Expense,
  CashClosing,
  SystemNotification,
  AuditLog
} from '../types';

export const initialSettings: RestaurantSettings = {
  name: 'Royal Spice Pavilion & Bistro',
  slogan: 'Artisanal Heritage Dining & Modern Hospitality',
  logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&auto=format&fit=crop&q=80',
  gstin: '07AAAAA2026A1Z5',
  address: 'Block M, Radial Road 6, Connaught Place',
  city: 'New Delhi, Delhi 110001',
  phone: '+91 11 4321 8899',
  email: 'reservations@royalspicebistro.com',
  currency: 'INR',
  currencySymbol: '₹',
  timezone: 'Asia/Kolkata',
  defaultTaxRate: 5, // 5% GST on Restaurant food
  serviceChargeRate: 5, // 5% discretionary service charge
  isServiceChargeEnabled: true,
  operatingHours: [
    { day: 'Monday', open: '11:30', close: '23:30' },
    { day: 'Tuesday', open: '11:30', close: '23:30' },
    { day: 'Wednesday', open: '11:30', close: '23:30' },
    { day: 'Thursday', open: '11:30', close: '23:30' },
    { day: 'Friday', open: '11:30', close: '00:30' },
    { day: 'Saturday', open: '11:00', close: '00:30' },
    { day: 'Sunday', open: '11:00', close: '23:30' },
  ]
};

export const initialBranches: Branch[] = [
  {
    id: 'b1',
    name: 'Connaught Place (Flagship)',
    code: 'CP-DEL',
    address: 'Block M, Radial Road 6, Connaught Place',
    city: 'New Delhi',
    phone: '+91 11 4321 8899',
    operatingHours: '11:30 AM - 11:30 PM',
    timezone: 'Asia/Kolkata',
    isDefault: true,
    status: 'Active'
  },
  {
    id: 'b2',
    name: 'Indiranagar (100ft Road)',
    code: 'IND-BLR',
    address: '100ft Road, Defence Colony, Indiranagar',
    city: 'Bengaluru',
    phone: '+91 80 4123 9900',
    operatingHours: '12:00 PM - 11:30 PM',
    timezone: 'Asia/Kolkata',
    status: 'Active'
  },
  {
    id: 'b3',
    name: 'Cyber Hub Bistro',
    code: 'CYB-GUR',
    address: 'DLF Cyber City, Phase 2',
    city: 'Gurugram',
    phone: '+91 124 456 7890',
    operatingHours: '12:00 PM - 12:00 AM',
    timezone: 'Asia/Kolkata',
    status: 'Active'
  }
];

export const initialUsers: User[] = [
  {
    id: 'u1',
    name: 'Vikramaditya Singhania',
    email: 'owner@royalspice.com',
    role: 'Restaurant Owner',
    phone: '+91 98100 11223',
    branchId: 'b1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    status: 'Active',
    lastLogin: '2026-10-15 14:10'
  },
  {
    id: 'u2',
    name: 'Priya Sharma',
    email: 'manager@royalspice.com',
    role: 'Manager',
    phone: '+91 98111 22334',
    branchId: 'b1',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    status: 'Active',
    lastLogin: '2026-10-15 14:25'
  },
  {
    id: 'u3',
    name: 'Rohit Verma',
    email: 'cashier@royalspice.com',
    role: 'Cashier',
    phone: '+91 98222 33445',
    branchId: 'b1',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    status: 'Active',
    lastLogin: '2026-10-15 13:45'
  },
  {
    id: 'u4',
    name: 'Chef Ranveer Malhotra',
    email: 'kitchen@royalspice.com',
    role: 'Kitchen Staff',
    phone: '+91 98333 44556',
    branchId: 'b1',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=80',
    status: 'Active',
    lastLogin: '2026-10-15 14:00'
  },
  {
    id: 'u5',
    name: 'Ananya Gupta',
    email: 'host@royalspice.com',
    role: 'Host / Waiter',
    phone: '+91 98444 55667',
    branchId: 'b1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    status: 'Active',
    lastLogin: '2026-10-15 12:30'
  },
  {
    id: 'u6',
    name: 'Deepak Saxena',
    email: 'accountant@royalspice.com',
    role: 'Accountant',
    phone: '+91 98555 66778',
    branchId: 'b1',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    status: 'Active',
    lastLogin: '2026-10-15 11:15'
  }
];

export const initialTables: Table[] = [
  { id: 't1', number: 'T-01', capacity: 2, section: 'Indoor', status: 'Available', branchId: 'b1' },
  { id: 't2', number: 'T-02', capacity: 2, section: 'Indoor', status: 'Reserved', reservationId: 'res-1', branchId: 'b1' },
  { id: 't3', number: 'T-03', capacity: 4, section: 'Indoor', status: 'Occupied', currentOrderId: 'ord-101', assignedServer: 'Ananya Gupta', seatedAt: '13:30', branchId: 'b1' },
  { id: 't4', number: 'T-04', capacity: 4, section: 'Indoor', status: 'Seated', currentOrderId: 'ord-104', assignedServer: 'Kunal Sen', seatedAt: '14:15', branchId: 'b1' },
  { id: 't5', number: 'T-05', capacity: 6, section: 'Indoor', status: 'Bill Requested', currentOrderId: 'ord-102', assignedServer: 'Ananya Gupta', seatedAt: '13:00', branchId: 'b1' },
  { id: 't6', number: 'T-06', capacity: 4, section: 'Indoor', status: 'Cleaning', branchId: 'b1' },
  { id: 't7', number: 'T-07', capacity: 4, section: 'Outdoor Terrace', status: 'Occupied', currentOrderId: 'ord-103', assignedServer: 'Kunal Sen', seatedAt: '13:40', branchId: 'b1' },
  { id: 't8', number: 'T-08', capacity: 2, section: 'Outdoor Terrace', status: 'Available', branchId: 'b1' },
  { id: 't9', number: 'T-09', capacity: 6, section: 'Outdoor Terrace', status: 'Reserved', reservationId: 'res-2', branchId: 'b1' },
  { id: 't10', number: 'T-10', capacity: 4, section: 'Outdoor Terrace', status: 'Available', branchId: 'b1' },
  { id: 't11', number: 'B-01', capacity: 2, section: 'Bar Lounge', status: 'Occupied', currentOrderId: 'ord-105', assignedServer: 'Gaurav Roy', seatedAt: '14:10', branchId: 'b1' },
  { id: 't12', number: 'B-02', capacity: 2, section: 'Bar Lounge', status: 'Available', branchId: 'b1' },
  { id: 't13', number: 'B-03', capacity: 4, section: 'Bar Lounge', status: 'Available', branchId: 'b1' },
  { id: 't14', number: 'PDR-01', capacity: 10, section: 'Private Dining', status: 'Reserved', reservationId: 'res-3', branchId: 'b1' },
  { id: 't15', number: 'PDR-02', capacity: 8, section: 'Private Dining', status: 'Available', branchId: 'b1' },
  { id: 't16', number: 'T-11', capacity: 4, section: 'Indoor', status: 'Out of Service', branchId: 'b1' }
];

export const initialReservations: Reservation[] = [
  {
    id: 'res-1',
    guestName: 'Dr. Rajesh Khanna',
    phone: '+91 98188 77665',
    email: 'rajesh.khanna@medcenter.org',
    date: '2026-10-15',
    time: '19:30',
    partySize: 2,
    expectedDuration: 90,
    seatingPreference: 'Indoor',
    occasion: 'Anniversary',
    assignedTableId: 't2',
    bookingSource: 'Website',
    specialRequests: 'Candlelight setup with complementary rose',
    depositAmount: 1000,
    staffNotes: 'VIP Patron. Prefers corner booth.',
    status: 'Confirmed',
    branchId: 'b1',
    createdAt: '2026-10-14 11:20'
  },
  {
    id: 'res-2',
    guestName: 'Neha Mehta & Family',
    phone: '+91 98234 56789',
    email: 'neha.design@studio.com',
    date: '2026-10-15',
    time: '20:00',
    partySize: 6,
    expectedDuration: 120,
    seatingPreference: 'Outdoor',
    occasion: 'Birthday',
    assignedTableId: 't9',
    bookingSource: 'Phone',
    specialRequests: 'High chair needed for 2yo child. Will bring their own cake.',
    staffNotes: 'Confirmed over phone call with advance reminder.',
    status: 'Confirmed',
    branchId: 'b1',
    createdAt: '2026-10-15 09:30'
  },
  {
    id: 'res-3',
    guestName: 'Kabir Kapoor (Deloitte Corp)',
    phone: '+91 99887 65432',
    email: 'kabir.kapoor@deloitte.com',
    date: '2026-10-15',
    time: '20:30',
    partySize: 10,
    expectedDuration: 150,
    seatingPreference: 'Indoor',
    occasion: 'Business',
    assignedTableId: 't14',
    bookingSource: 'Phone',
    specialRequests: 'Pre-set Royal Tasting Menu with wine pairings. Quiet ambient lighting.',
    depositAmount: 5000,
    staffNotes: 'Corporate account, invoice to be sent to Finance.',
    status: 'Confirmed',
    branchId: 'b1',
    createdAt: '2026-10-13 16:45'
  },
  {
    id: 'res-4',
    guestName: 'Arjun Mathur',
    phone: '+91 97110 33445',
    date: '2026-10-15',
    time: '13:00',
    partySize: 4,
    expectedDuration: 90,
    seatingPreference: 'Indoor',
    occasion: 'Family',
    assignedTableId: 't5',
    bookingSource: 'Walk-in',
    status: 'Seated',
    branchId: 'b1',
    createdAt: '2026-10-15 12:45'
  },
  {
    id: 'res-5',
    guestName: 'Sunita Rao',
    phone: '+91 98450 12345',
    date: '2026-10-15',
    time: '12:30',
    partySize: 2,
    expectedDuration: 60,
    seatingPreference: 'Any',
    bookingSource: 'QR',
    status: 'Completed',
    branchId: 'b1',
    createdAt: '2026-10-15 11:00'
  },
  {
    id: 'res-6',
    guestName: 'Amanpreet Singh',
    phone: '+91 98765 43210',
    date: '2026-10-15',
    time: '13:30',
    partySize: 3,
    expectedDuration: 75,
    seatingPreference: 'Outdoor',
    bookingSource: 'Website',
    status: 'No-show',
    staffNotes: 'Did not answer 3 phone calls. Slot released at 14:00.',
    branchId: 'b1',
    createdAt: '2026-10-15 10:15'
  }
];

export const initialWaitlist: WaitlistEntry[] = [
  {
    id: 'wl-1',
    guestName: 'Rohan Deshmukh',
    phone: '+91 98112 34567',
    partySize: 4,
    preferredSection: 'Indoor',
    notes: 'Near window if possible',
    estimatedWaitMinutes: 15,
    status: 'Waiting',
    createdAt: '2026-10-15 14:05',
    branchId: 'b1'
  },
  {
    id: 'wl-2',
    guestName: 'Simran Bajaj',
    phone: '+91 98223 45678',
    partySize: 2,
    preferredSection: 'Outdoor Terrace',
    notes: 'Okay with high-top bar as alternative',
    estimatedWaitMinutes: 10,
    status: 'Notified',
    createdAt: '2026-10-15 14:12',
    branchId: 'b1'
  }
];

export const initialMenuCategories: MenuCategory[] = [
  { id: 'cat-1', name: 'Starters & Small Plates', description: 'Crispy appetizers & street-inspired tapas', displayOrder: 1, status: 'Active', itemCount: 6, icon: 'Utensils' },
  { id: 'cat-2', name: 'Tandoor & Charcoal Kebabs', description: 'Clay-oven roasted skewers & tikka platters', displayOrder: 2, status: 'Active', itemCount: 6, icon: 'Flame' },
  { id: 'cat-3', name: 'Royal Curries & Mains', description: 'Slow-simmered rich curries & gravies', displayOrder: 3, status: 'Active', itemCount: 8, icon: 'Soup' },
  { id: 'cat-4', name: 'Dum Biryani & Rice', description: 'Aromatic basmati sealed with dough & baked', displayOrder: 4, status: 'Active', itemCount: 4, icon: 'Bowl' },
  { id: 'cat-5', name: 'Artisanal Breads & Rotis', description: 'Freshly baked tandoori naans & stuffed kulchas', displayOrder: 5, status: 'Active', itemCount: 4, icon: 'Wheat' },
  { id: 'cat-6', name: 'Gourmet Desserts', description: 'Traditional Indian confections with modern flair', displayOrder: 6, status: 'Active', itemCount: 4, icon: 'Cake' },
  { id: 'cat-7', name: 'Beverages & Mocktails', description: 'Handcrafted coolers, lassi & artisanal teas', displayOrder: 7, status: 'Active', itemCount: 5, icon: 'GlassWater' },
];

export const initialModifierGroups: ModifierGroup[] = [
  {
    id: 'mod-spice',
    name: 'Spice Level',
    required: true,
    minSelections: 1,
    maxSelections: 1,
    options: [
      { id: 'sp-1', name: 'Mild & Creamy', price: 0, isDefault: true },
      { id: 'sp-2', name: 'Medium Desi Spice', price: 0 },
      { id: 'sp-3', name: 'Fiery Indian Heat 🔥', price: 0 }
    ]
  },
  {
    id: 'mod-cheese',
    name: 'Gourmet Add-ons',
    required: false,
    minSelections: 0,
    maxSelections: 3,
    options: [
      { id: 'ad-1', name: 'Extra Amul Melted Butter', price: 40 },
      { id: 'ad-2', name: 'Smoked Garlic Dip', price: 50 },
      { id: 'ad-3', name: 'Truffle Oil Drizzle', price: 90 },
      { id: 'ad-4', name: 'Extra Makhani Gravy Bowl', price: 120 }
    ]
  },
  {
    id: 'mod-bread',
    name: 'Choice of Bread',
    required: true,
    minSelections: 1,
    maxSelections: 1,
    options: [
      { id: 'br-1', name: 'Butter Naan', price: 0, isDefault: true },
      { id: 'br-2', name: 'Garlic Herb Naan', price: 25 },
      { id: 'br-3', name: 'Lachedar Paratha', price: 20 },
      { id: 'br-4', name: 'Steamed Basmati Rice', price: 0 }
    ]
  },
  {
    id: 'mod-portion',
    name: 'Portion Size',
    required: true,
    minSelections: 1,
    maxSelections: 1,
    options: [
      { id: 'pt-1', name: 'Regular (Serves 1-2)', price: 0, isDefault: true },
      { id: 'pt-2', name: 'Large Platter (Serves 3-4)', price: 260 }
    ]
  }
];

export const initialMenuItems: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Paneer Tikka Sunhari',
    sku: 'APP-PT-01',
    description: 'Charred cottage cheese cubes marinated in saffron yoghurt, ajwain and crushed coriander.',
    categoryId: 'cat-2',
    price: 425,
    taxRate: 5,
    prepStation: 'Tandoor & Grill',
    isAvailable: true,
    dietaryTags: ['Vegetarian', 'Chef Special'],
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 14,
    modifierGroupIds: ['mod-spice', 'mod-cheese'],
    displayOrder: 1
  },
  {
    id: 'item-2',
    name: 'Murgh Malai Reshmi Kebab',
    sku: 'APP-MK-02',
    description: 'Tender chicken morsels drenched in cardamom cream, royal cashewnut paste and grilled over oak charcoal.',
    categoryId: 'cat-2',
    price: 520,
    taxRate: 5,
    prepStation: 'Tandoor & Grill',
    isAvailable: true,
    dietaryTags: ['Non-Veg', 'Chef Special'],
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 16,
    modifierGroupIds: ['mod-spice', 'mod-cheese'],
    displayOrder: 2
  },
  {
    id: 'item-3',
    name: 'Galouti Kebab with Mini Mughlai Paratha',
    sku: 'APP-GK-03',
    description: 'Melt-in-mouth smoked lamb patties infused with 32 secret Awadhi potli spices, served on warm coin parathas.',
    categoryId: 'cat-2',
    price: 640,
    taxRate: 5,
    prepStation: 'Tandoor & Grill',
    isAvailable: true,
    dietaryTags: ['Non-Veg'],
    allergens: ['Gluten', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 18,
    modifierGroupIds: ['mod-cheese'],
    displayOrder: 3
  },
  {
    id: 'item-4',
    name: 'Crispy Dahi Ke Kebab',
    sku: 'APP-DK-04',
    description: 'Hung yoghurt patties blended with bell peppers, green chillies and roasted cumin, fried crisp.',
    categoryId: 'cat-1',
    price: 395,
    taxRate: 5,
    prepStation: 'Pantry',
    isAvailable: true,
    dietaryTags: ['Vegetarian'],
    allergens: ['Dairy', 'Gluten'],
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 12,
    displayOrder: 4
  },
  {
    id: 'item-5',
    name: 'Dal Makhani Bukhara',
    sku: 'MAIN-DM-05',
    description: 'Black lentils slow cooked overnight on charcoal embers for 18 hours with vine-ripened tomatoes and white butter.',
    categoryId: 'cat-3',
    price: 475,
    taxRate: 5,
    prepStation: 'Main Kitchen',
    isAvailable: true,
    dietaryTags: ['Vegetarian', 'Chef Special'],
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 10,
    modifierGroupIds: ['mod-cheese'],
    displayOrder: 5
  },
  {
    id: 'item-6',
    name: 'Old Delhi Butter Chicken (Boneless)',
    sku: 'MAIN-BC-06',
    description: 'Tandoori pulled chicken simmered in velvet tomato makhani with fresh cream, fenugreek honey and churned butter.',
    categoryId: 'cat-3',
    price: 585,
    taxRate: 5,
    prepStation: 'Main Kitchen',
    isAvailable: true,
    dietaryTags: ['Non-Veg', 'Chef Special'],
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 15,
    modifierGroupIds: ['mod-spice', 'mod-cheese', 'mod-portion'],
    displayOrder: 6
  },
  {
    id: 'item-7',
    name: 'Awadhi Nalli Nihari',
    sku: 'MAIN-NN-07',
    description: 'Slow-braised tender baby lamb shanks in an aromatic golden gravy, garnished with ginger juliennes and fresh lime.',
    categoryId: 'cat-3',
    price: 745,
    taxRate: 5,
    prepStation: 'Main Kitchen',
    isAvailable: true,
    dietaryTags: ['Non-Veg'],
    allergens: [],
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 16,
    modifierGroupIds: ['mod-spice', 'mod-bread'],
    displayOrder: 7
  },
  {
    id: 'item-8',
    name: 'Paneer Lababdar',
    sku: 'MAIN-PL-08',
    description: 'Cottage cheese steeped in rich onion-tomato masala topped with grated paneer and freshly chopped cilantro.',
    categoryId: 'cat-3',
    price: 495,
    taxRate: 5,
    prepStation: 'Main Kitchen',
    isAvailable: true,
    dietaryTags: ['Vegetarian'],
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 12,
    modifierGroupIds: ['mod-spice', 'mod-cheese'],
    displayOrder: 8
  },
  {
    id: 'item-9',
    name: 'Dum Gosht Hyderabadi Biryani',
    sku: 'RICE-GB-09',
    description: 'Kachi yakhni prime mutton layered with 2-year aged aged basmati rice, saffron milk and fried onions, cooked under dough purdah.',
    categoryId: 'cat-4',
    price: 695,
    taxRate: 5,
    prepStation: 'Main Kitchen',
    isAvailable: true,
    dietaryTags: ['Non-Veg', 'Chef Special'],
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 15,
    modifierGroupIds: ['mod-spice', 'mod-portion'],
    displayOrder: 9
  },
  {
    id: 'item-10',
    name: 'Subz Nizami Dum Biryani',
    sku: 'RICE-SB-10',
    description: 'Seasonal winter vegetables and aromatic spices slow cooked with long-grain rice, served with Burani garlic raita.',
    categoryId: 'cat-4',
    price: 460,
    taxRate: 5,
    prepStation: 'Main Kitchen',
    isAvailable: true,
    dietaryTags: ['Vegetarian'],
    allergens: ['Dairy'],
    image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 12,
    modifierGroupIds: ['mod-spice'],
    displayOrder: 10
  },
  {
    id: 'item-11',
    name: 'Garlic Herb Butter Naan',
    sku: 'BRD-GN-11',
    description: 'Artisanal leavened flatbread brushed with roasted garlic, fresh coriander and dairy butter.',
    categoryId: 'cat-5',
    price: 110,
    taxRate: 5,
    prepStation: 'Tandoor & Grill',
    isAvailable: true,
    dietaryTags: ['Vegetarian'],
    allergens: ['Gluten', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 6,
    displayOrder: 11
  },
  {
    id: 'item-12',
    name: 'Chur Chur Amritsari Kulcha',
    sku: 'BRD-CK-12',
    description: 'Flaky layered bread stuffed with spiced potato and crushed pomegranate seeds, crushed by hand with desi ghee.',
    categoryId: 'cat-5',
    price: 145,
    taxRate: 5,
    prepStation: 'Tandoor & Grill',
    isAvailable: true,
    dietaryTags: ['Vegetarian'],
    allergens: ['Gluten', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 8,
    displayOrder: 12
  },
  {
    id: 'item-13',
    name: 'Gulab Jamun with Kesari Rabdi',
    sku: 'DES-GJ-13',
    description: 'Warm khoya dumplings steeped in rose water syrup, served over chilled saffron reduced milk.',
    categoryId: 'cat-6',
    price: 265,
    taxRate: 5,
    prepStation: 'Dessert & Bakery',
    isAvailable: true,
    dietaryTags: ['Vegetarian', 'Chef Special'],
    allergens: ['Dairy', 'Gluten', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 5,
    displayOrder: 13
  },
  {
    id: 'item-14',
    name: 'Zafrani Shahi Tukda',
    sku: 'DES-ST-14',
    description: 'Crisp brioche soaked in saffron cardamom syrup, dressed with clotted cream and silver leaf.',
    categoryId: 'cat-6',
    price: 295,
    taxRate: 5,
    prepStation: 'Dessert & Bakery',
    isAvailable: true,
    dietaryTags: ['Vegetarian'],
    allergens: ['Dairy', 'Gluten', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 6,
    displayOrder: 14
  },
  {
    id: 'item-15',
    name: 'Royal Kesar Mango Lassi',
    sku: 'BEV-ML-15',
    description: 'Churned thick yoghurt, Alphonso mango pulp, saffron strands and toasted pistachio crumbles.',
    categoryId: 'cat-7',
    price: 220,
    taxRate: 5,
    prepStation: 'Drinks & Bar',
    isAvailable: true,
    dietaryTags: ['Vegetarian'],
    allergens: ['Dairy', 'Tree Nuts'],
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 4,
    displayOrder: 15
  },
  {
    id: 'item-16',
    name: 'Kala Khatta Spiced Cooler',
    sku: 'BEV-KK-16',
    description: 'Jamun puree, black salt, roasted cumin, fresh mint and sparkling soda over crushed ice.',
    categoryId: 'cat-7',
    price: 195,
    taxRate: 5,
    prepStation: 'Drinks & Bar',
    isAvailable: true,
    dietaryTags: ['Vegan'],
    allergens: [],
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    prepTimeMinutes: 3,
    displayOrder: 16
  }
];

export const initialRecipes: Recipe[] = [
  {
    id: 'rec-1',
    menuItemId: 'item-5',
    menuItemName: 'Dal Makhani Bukhara',
    yieldServings: 1,
    ingredients: [
      { inventoryItemId: 'inv-1', quantity: 0.15, unit: 'kg' }, // Black urad dal
      { inventoryItemId: 'inv-5', quantity: 0.08, unit: 'kg' }, // Butter
      { inventoryItemId: 'inv-6', quantity: 0.05, unit: 'L' },  // Cream
      { inventoryItemId: 'inv-8', quantity: 0.12, unit: 'kg' }  // Tomatoes
    ],
    estimatedCost: 112,
    status: 'Active',
    preparationNotes: 'Simmer 18 hours with degi mirch and vine tomatoes. Whisk butter in 3 stages.'
  },
  {
    id: 'rec-2',
    menuItemId: 'item-6',
    menuItemName: 'Old Delhi Butter Chicken',
    yieldServings: 1,
    ingredients: [
      { inventoryItemId: 'inv-3', quantity: 0.28, unit: 'kg' }, // Boneless Chicken
      { inventoryItemId: 'inv-5', quantity: 0.07, unit: 'kg' }, // Butter
      { inventoryItemId: 'inv-6', quantity: 0.06, unit: 'L' },  // Cream
      { inventoryItemId: 'inv-8', quantity: 0.15, unit: 'kg' }, // Tomatoes
      { inventoryItemId: 'inv-7', quantity: 0.02, unit: 'kg' }  // Cashews
    ],
    estimatedCost: 168,
    status: 'Active',
    preparationNotes: 'Char chicken in tandoor at 320C first before finishing in silky makhani gravy.'
  }
];

export const initialInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Black Urad Whole Dal', sku: 'STK-URD-01', category: 'Spices & Staples', currentStock: 48, unit: 'kg', reorderLevel: 20, unitCost: 140, supplierId: 'sup-1', supplierName: 'SpiceCraft Organics Ltd', storageLocation: 'Dry Pantry Shelf A', status: 'In Stock', branchId: 'b1' },
  { id: 'inv-2', name: 'Premium Basmati Rice (2-yr Aged)', sku: 'STK-RCE-02', category: 'Spices & Staples', currentStock: 85, unit: 'kg', reorderLevel: 30, unitCost: 165, supplierId: 'sup-1', supplierName: 'SpiceCraft Organics Ltd', storageLocation: 'Grain Silo 2', status: 'In Stock', branchId: 'b1' },
  { id: 'inv-3', name: 'Fresh Boneless Chicken Breast', sku: 'STK-CHK-03', category: 'Meat & Poultry', currentStock: 18.5, unit: 'kg', reorderLevel: 15, unitCost: 280, supplierId: 'sup-4', supplierName: 'Royal Poultry & Meats', storageLocation: 'Walk-in Chiller Meat Rack', status: 'In Stock', branchId: 'b1' },
  { id: 'inv-4', name: 'Fresh Malai Paneer', sku: 'STK-PNR-04', category: 'Dairy', currentStock: 6.2, unit: 'kg', reorderLevel: 12, unitCost: 360, supplierId: 'sup-2', supplierName: 'DairyFresh Farms & Co', storageLocation: 'Dairy Chiller B', status: 'Low Stock', branchId: 'b1' },
  { id: 'inv-5', name: 'Amul Salted Table Butter', sku: 'STK-BTR-05', category: 'Dairy', currentStock: 14, unit: 'kg', reorderLevel: 15, unitCost: 540, supplierId: 'sup-2', supplierName: 'DairyFresh Farms & Co', storageLocation: 'Dairy Chiller A', status: 'Low Stock', branchId: 'b1' },
  { id: 'inv-6', name: 'Dairy Fresh Heavy Cooking Cream', sku: 'STK-CRM-06', category: 'Dairy', currentStock: 22, unit: 'L', reorderLevel: 10, unitCost: 220, supplierId: 'sup-2', supplierName: 'DairyFresh Farms & Co', storageLocation: 'Dairy Chiller A', status: 'In Stock', branchId: 'b1' },
  { id: 'inv-7', name: 'Goan Whole Cashewnuts (W240)', sku: 'STK-CSH-07', category: 'Spices & Staples', currentStock: 12, unit: 'kg', reorderLevel: 8, unitCost: 880, supplierId: 'sup-1', supplierName: 'SpiceCraft Organics Ltd', storageLocation: 'Dry Pantry Shelf C', status: 'In Stock', branchId: 'b1' },
  { id: 'inv-8', name: 'Ripe Hybrid Vine Tomatoes', sku: 'STK-TOM-08', category: 'Produce & Veg', currentStock: 45, unit: 'kg', reorderLevel: 25, unitCost: 35, supplierId: 'sup-3', supplierName: 'Himalayan Greens Wholesale', storageLocation: 'Veg Cold Room', status: 'In Stock', branchId: 'b1' },
  { id: 'inv-9', name: 'Nasik Red Onions', sku: 'STK-ONI-09', category: 'Produce & Veg', currentStock: 90, unit: 'kg', reorderLevel: 40, unitCost: 28, supplierId: 'sup-3', supplierName: 'Himalayan Greens Wholesale', storageLocation: 'Produce Bin 1', status: 'In Stock', branchId: 'b1' },
  { id: 'inv-10', name: 'Kashmiri Mogra Saffron (Grade A)', sku: 'STK-SAF-10', category: 'Spices & Staples', currentStock: 0.12, unit: 'kg', reorderLevel: 0.1, unitCost: 240000, supplierId: 'sup-1', supplierName: 'SpiceCraft Organics Ltd', storageLocation: 'Security Spice Vault', status: 'In Stock', branchId: 'b1' },
  { id: 'inv-11', name: 'Mutton Shanks (Nalli Cut)', sku: 'STK-MUT-11', category: 'Meat & Poultry', currentStock: 3.5, unit: 'kg', reorderLevel: 10, unitCost: 780, supplierId: 'sup-4', supplierName: 'Royal Poultry & Meats', storageLocation: 'Walk-in Chiller Meat Rack', status: 'Low Stock', branchId: 'b1' },
  { id: 'inv-12', name: 'Kraft Eco Meal Takeaway Box (750ml)', sku: 'STK-PKG-12', category: 'Packaging', currentStock: 450, unit: 'pcs', reorderLevel: 200, unitCost: 8.5, supplierId: 'sup-5', supplierName: 'Metro Beverage & Packaging Corp', storageLocation: 'Dry Storage Mezzanine', status: 'In Stock', branchId: 'b1' }
];

export const initialStockMovements: StockMovement[] = [
  { id: 'mov-1', inventoryItemId: 'inv-4', itemName: 'Fresh Malai Paneer', delta: -3.8, balanceAfter: 6.2, type: 'Recipe Deduction', reason: 'Lunch shift orders preparation', performedBy: 'Chef Ranveer Malhotra', createdAt: '2026-10-15 13:45' },
  { id: 'mov-2', inventoryItemId: 'inv-3', itemName: 'Fresh Boneless Chicken Breast', delta: -5.5, balanceAfter: 18.5, type: 'Recipe Deduction', reason: 'Tandoor kebab skewers prep', performedBy: 'Chef Ranveer Malhotra', createdAt: '2026-10-15 13:30' },
  { id: 'mov-3', inventoryItemId: 'inv-8', itemName: 'Ripe Hybrid Vine Tomatoes', delta: 50, balanceAfter: 45, type: 'PO Received', reason: 'PO-8019 Morning Delivery', performedBy: 'Priya Sharma', createdAt: '2026-10-15 08:30' },
  { id: 'mov-4', inventoryItemId: 'inv-11', itemName: 'Mutton Shanks (Nalli Cut)', delta: -2.0, balanceAfter: 3.5, type: 'Waste / Spoilage', reason: 'Trimming bone weight discrepancy recorded', performedBy: 'Chef Ranveer Malhotra', createdAt: '2026-10-14 19:15' }
];

export const initialSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'SpiceCraft Organics Ltd', contactPerson: 'Arun Singhal', phone: '+91 98110 55443', email: 'orders@spicecraftorganics.com', address: 'Khari Baoli Spice Market, Old Delhi 110006', taxId: '07AAACS1234D1Z8', paymentTerms: 'Net 30', categories: ['Spices & Staples', 'Dry Fruits'], outstandingAmount: 48500, status: 'Active' },
  { id: 'sup-2', name: 'DairyFresh Farms & Co', contactPerson: 'Gurpreet Singh', phone: '+91 98220 66554', email: 'sales@dairyfreshfarms.in', address: 'Karnal Highway Industrial Area, Haryana', taxId: '06AAACD9876E1Z2', paymentTerms: 'Net 15', categories: ['Dairy'], outstandingAmount: 26400, status: 'Active' },
  { id: 'sup-3', name: 'Himalayan Greens Wholesale', contactPerson: 'Manish Tyagi', phone: '+91 98330 77665', email: 'manish@himalayangreens.com', address: 'Azadpur Mandi Shed 14, Delhi 110033', taxId: '07AAACH4567F1Z1', paymentTerms: 'COD', categories: ['Produce & Veg'], outstandingAmount: 0, status: 'Active' },
  { id: 'sup-4', name: 'Royal Poultry & Meats', contactPerson: 'Sohail Qureshi', phone: '+91 98440 88776', email: 'supply@royalmeats.in', address: 'Ghazipur Meat Market Complex, Delhi', taxId: '07AAACR3210G1Z5', paymentTerms: 'Net 15', categories: ['Meat & Poultry'], outstandingAmount: 34200, status: 'Active' },
  { id: 'sup-5', name: 'Metro Beverage & Packaging Corp', contactPerson: 'Karan Mehra', phone: '+91 98550 99887', email: 'karan@metropack.com', address: 'Okhla Industrial Phase III, New Delhi', taxId: '07AAACM6543H1Z4', paymentTerms: 'Net 30', categories: ['Packaging', 'Beverages'], outstandingAmount: 14800, status: 'Active' }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-8021',
    supplierId: 'sup-2',
    supplierName: 'DairyFresh Farms & Co',
    branchId: 'b1',
    items: [
      { inventoryItemId: 'inv-4', name: 'Fresh Malai Paneer', quantity: 20, unit: 'kg', unitCost: 360, lineTotal: 7200, receivedQuantity: 0 },
      { inventoryItemId: 'inv-5', name: 'Amul Salted Table Butter', quantity: 25, unit: 'kg', unitCost: 540, lineTotal: 13500, receivedQuantity: 0 }
    ],
    subtotal: 20700,
    tax: 1035,
    totalAmount: 21735,
    orderDate: '2026-10-15',
    expectedDeliveryDate: '2026-10-16',
    status: 'Approved',
    approvalStatus: 'Approved',
    createdBy: 'Priya Sharma',
    approvedBy: 'Vikramaditya Singhania',
    notes: 'Urgent restocking for weekend dining rush.'
  },
  {
    id: 'po-2',
    poNumber: 'PO-8020',
    supplierId: 'sup-4',
    supplierName: 'Royal Poultry & Meats',
    branchId: 'b1',
    items: [
      { inventoryItemId: 'inv-11', name: 'Mutton Shanks (Nalli Cut)', quantity: 15, unit: 'kg', unitCost: 780, lineTotal: 11700, receivedQuantity: 0 }
    ],
    subtotal: 11700,
    tax: 0,
    totalAmount: 11700,
    orderDate: '2026-10-14',
    expectedDeliveryDate: '2026-10-15',
    status: 'Sent',
    approvalStatus: 'Approved',
    createdBy: 'Priya Sharma',
    approvedBy: 'Vikramaditya Singhania',
    notes: 'Awaiting noon shipment arrival.'
  },
  {
    id: 'po-3',
    poNumber: 'PO-8019',
    supplierId: 'sup-3',
    supplierName: 'Himalayan Greens Wholesale',
    branchId: 'b1',
    items: [
      { inventoryItemId: 'inv-8', name: 'Ripe Hybrid Vine Tomatoes', quantity: 50, unit: 'kg', unitCost: 35, lineTotal: 1750, receivedQuantity: 50 },
      { inventoryItemId: 'inv-9', name: 'Nasik Red Onions', quantity: 60, unit: 'kg', unitCost: 28, lineTotal: 1680, receivedQuantity: 60 }
    ],
    subtotal: 3430,
    tax: 0,
    totalAmount: 3430,
    orderDate: '2026-10-14',
    expectedDeliveryDate: '2026-10-15',
    status: 'Received',
    approvalStatus: 'Approved',
    createdBy: 'Priya Sharma',
    approvedBy: 'Vikramaditya Singhania',
    notes: 'Delivered in good condition and stock updated.'
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-2026-101',
    branchId: 'b1',
    tableId: 't3',
    tableNumber: 'T-03',
    source: 'Dine-in',
    customerName: 'Aditya Birla',
    customerPhone: '+91 98111 88776',
    items: [
      { id: 'oi-1', menuItemId: 'item-2', name: 'Murgh Malai Reshmi Kebab', quantity: 1, unitPrice: 520, totalPrice: 520, status: 'Served', prepStation: 'Tandoor & Grill' },
      { id: 'oi-2', menuItemId: 'item-6', name: 'Old Delhi Butter Chicken (Boneless)', quantity: 1, unitPrice: 585, totalPrice: 585, status: 'Preparing', prepStation: 'Main Kitchen', notes: 'Extra mild for children' },
      { id: 'oi-3', menuItemId: 'item-11', name: 'Garlic Herb Butter Naan', quantity: 2, unitPrice: 110, totalPrice: 220, status: 'Preparing', prepStation: 'Tandoor & Grill' },
      { id: 'oi-4', menuItemId: 'item-15', name: 'Royal Kesar Mango Lassi', quantity: 2, unitPrice: 220, totalPrice: 440, status: 'Served', prepStation: 'Drinks & Bar' }
    ],
    subtotal: 1765,
    discountAmount: 0,
    taxAmount: 88.25,
    serviceCharge: 88.25,
    totalAmount: 1941.50,
    status: 'Preparing',
    paymentStatus: 'Unpaid',
    cashierName: 'Rohit Verma',
    createdAt: '2026-10-15 13:35'
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-2026-102',
    branchId: 'b1',
    tableId: 't5',
    tableNumber: 'T-05',
    source: 'Dine-in',
    customerName: 'Arjun Mathur',
    customerPhone: '+91 97110 33445',
    items: [
      { id: 'oi-5', menuItemId: 'item-1', name: 'Paneer Tikka Sunhari', quantity: 1, unitPrice: 425, totalPrice: 425, status: 'Served', prepStation: 'Tandoor & Grill' },
      { id: 'oi-6', menuItemId: 'item-5', name: 'Dal Makhani Bukhara', quantity: 1, unitPrice: 475, totalPrice: 475, status: 'Served', prepStation: 'Main Kitchen' },
      { id: 'oi-7', menuItemId: 'item-9', name: 'Dum Gosht Hyderabadi Biryani', quantity: 1, unitPrice: 695, totalPrice: 695, status: 'Served', prepStation: 'Main Kitchen' },
      { id: 'oi-8', menuItemId: 'item-11', name: 'Garlic Herb Butter Naan', quantity: 3, unitPrice: 110, totalPrice: 330, status: 'Served', prepStation: 'Tandoor & Grill' },
      { id: 'oi-9', menuItemId: 'item-13', name: 'Gulab Jamun with Kesari Rabdi', quantity: 2, unitPrice: 265, totalPrice: 530, status: 'Served', prepStation: 'Dessert & Bakery' }
    ],
    subtotal: 2455,
    discountAmount: 245.50, // 10% promo
    discountType: 'percentage',
    discountReason: 'Corporate Privilege 10%',
    taxAmount: 110.48,
    serviceCharge: 110.48,
    totalAmount: 2430.46,
    status: 'Served',
    paymentStatus: 'Unpaid',
    cashierName: 'Rohit Verma',
    createdAt: '2026-10-15 13:02'
  },
  {
    id: 'ord-103',
    orderNumber: 'ORD-2026-103',
    branchId: 'b1',
    tableId: 't7',
    tableNumber: 'T-07',
    source: 'QR Order',
    customerName: 'Tanvi Shah',
    customerPhone: '+91 98991 22334',
    items: [
      { id: 'oi-10', menuItemId: 'item-4', name: 'Crispy Dahi Ke Kebab', quantity: 1, unitPrice: 395, totalPrice: 395, status: 'Preparing', prepStation: 'Pantry' },
      { id: 'oi-11', menuItemId: 'item-10', name: 'Subz Nizami Dum Biryani', quantity: 1, unitPrice: 460, totalPrice: 460, status: 'Preparing', prepStation: 'Main Kitchen' },
      { id: 'oi-12', menuItemId: 'item-16', name: 'Kala Khatta Spiced Cooler', quantity: 2, unitPrice: 195, totalPrice: 390, status: 'Ready', prepStation: 'Drinks & Bar' }
    ],
    subtotal: 1245,
    discountAmount: 0,
    taxAmount: 62.25,
    serviceCharge: 62.25,
    totalAmount: 1369.50,
    status: 'Preparing',
    paymentStatus: 'Unpaid',
    createdAt: '2026-10-15 13:42'
  },
  {
    id: 'ord-104',
    orderNumber: 'ORD-2026-104',
    branchId: 'b1',
    tableId: 't4',
    tableNumber: 'T-04',
    source: 'Dine-in',
    customerName: 'Sanjay Dutt Group',
    items: [
      { id: 'oi-13', menuItemId: 'item-3', name: 'Galouti Kebab with Mini Mughlai Paratha', quantity: 1, unitPrice: 640, totalPrice: 640, status: 'Pending', prepStation: 'Tandoor & Grill' },
      { id: 'oi-14', menuItemId: 'item-7', name: 'Awadhi Nalli Nihari', quantity: 1, unitPrice: 745, totalPrice: 745, status: 'Pending', prepStation: 'Main Kitchen' }
    ],
    subtotal: 1385,
    discountAmount: 0,
    taxAmount: 69.25,
    serviceCharge: 69.25,
    totalAmount: 1523.50,
    status: 'New',
    paymentStatus: 'Unpaid',
    cashierName: 'Rohit Verma',
    createdAt: '2026-10-15 14:18'
  },
  {
    id: 'ord-100',
    orderNumber: 'ORD-2026-100',
    branchId: 'b1',
    source: 'Takeaway',
    customerName: 'Meenakshi Iyer',
    customerPhone: '+91 98101 22334',
    items: [
      { id: 'oi-15', menuItemId: 'item-5', name: 'Dal Makhani Bukhara', quantity: 1, unitPrice: 475, totalPrice: 475, status: 'Served', prepStation: 'Main Kitchen' },
      { id: 'oi-16', menuItemId: 'item-11', name: 'Garlic Herb Butter Naan', quantity: 2, unitPrice: 110, totalPrice: 220, status: 'Served', prepStation: 'Tandoor & Grill' }
    ],
    subtotal: 695,
    discountAmount: 0,
    taxAmount: 34.75,
    serviceCharge: 0,
    totalAmount: 729.75,
    status: 'Completed',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    cashierName: 'Rohit Verma',
    createdAt: '2026-10-15 12:40',
    completedAt: '2026-10-15 13:05'
  }
];

export const initialKitchenTickets: KitchenTicket[] = [
  {
    id: 'kt-1',
    orderId: 'ord-101',
    orderNumber: 'ORD-2026-101',
    tableNumber: 'T-03',
    source: 'Dine-in',
    station: 'Main Kitchen',
    items: [
      { id: 'oi-2', menuItemId: 'item-6', name: 'Old Delhi Butter Chicken (Boneless)', quantity: 1, unitPrice: 585, totalPrice: 585, status: 'Preparing', prepStation: 'Main Kitchen', notes: 'Extra mild for children' }
    ],
    priority: 'Normal',
    status: 'Preparing',
    createdAt: '2026-10-15 13:36',
    startedAt: '2026-10-15 13:38'
  },
  {
    id: 'kt-2',
    orderId: 'ord-101',
    orderNumber: 'ORD-2026-101',
    tableNumber: 'T-03',
    source: 'Dine-in',
    station: 'Tandoor & Grill',
    items: [
      { id: 'oi-3', menuItemId: 'item-11', name: 'Garlic Herb Butter Naan', quantity: 2, unitPrice: 110, totalPrice: 220, status: 'Preparing', prepStation: 'Tandoor & Grill' }
    ],
    priority: 'Normal',
    status: 'Preparing',
    createdAt: '2026-10-15 13:36',
    startedAt: '2026-10-15 13:40'
  },
  {
    id: 'kt-3',
    orderId: 'ord-103',
    orderNumber: 'ORD-2026-103',
    tableNumber: 'T-07',
    source: 'QR Order',
    station: 'Main Kitchen',
    items: [
      { id: 'oi-11', menuItemId: 'item-10', name: 'Subz Nizami Dum Biryani', quantity: 1, unitPrice: 460, totalPrice: 460, status: 'Preparing', prepStation: 'Main Kitchen' }
    ],
    priority: 'Rush',
    status: 'Preparing',
    createdAt: '2026-10-15 13:43',
    startedAt: '2026-10-15 13:45'
  },
  {
    id: 'kt-4',
    orderId: 'ord-103',
    orderNumber: 'ORD-2026-103',
    tableNumber: 'T-07',
    source: 'QR Order',
    station: 'Drinks & Bar',
    items: [
      { id: 'oi-12', menuItemId: 'item-16', name: 'Kala Khatta Spiced Cooler', quantity: 2, unitPrice: 195, totalPrice: 390, status: 'Ready', prepStation: 'Drinks & Bar' }
    ],
    priority: 'Normal',
    status: 'Ready',
    createdAt: '2026-10-15 13:43',
    startedAt: '2026-10-15 13:44',
    readyAt: '2026-10-15 13:48'
  },
  {
    id: 'kt-5',
    orderId: 'ord-104',
    orderNumber: 'ORD-2026-104',
    tableNumber: 'T-04',
    source: 'Dine-in',
    station: 'Tandoor & Grill',
    items: [
      { id: 'oi-13', menuItemId: 'item-3', name: 'Galouti Kebab with Mini Mughlai Paratha', quantity: 1, unitPrice: 640, totalPrice: 640, status: 'Pending', prepStation: 'Tandoor & Grill' }
    ],
    priority: 'VIP',
    status: 'New',
    createdAt: '2026-10-15 14:19',
    notes: 'VIP Guest. Ensure coin parathas are piping hot.'
  }
];

export const initialPayments: Payment[] = [
  {
    id: 'pay-1',
    orderId: 'ord-100',
    orderNumber: 'ORD-2026-100',
    branchId: 'b1',
    amount: 729.75,
    method: 'UPI',
    status: 'Success',
    referenceId: 'UPI-987123849120',
    cashierName: 'Rohit Verma',
    createdAt: '2026-10-15 13:04'
  },
  {
    id: 'pay-2',
    orderId: 'ord-99',
    orderNumber: 'ORD-2026-099',
    branchId: 'b1',
    amount: 3850.00,
    method: 'Card',
    status: 'Success',
    referenceId: 'TXN-HDFC-991244',
    cashierName: 'Rohit Verma',
    createdAt: '2026-10-15 12:45'
  },
  {
    id: 'pay-3',
    orderId: 'ord-98',
    orderNumber: 'ORD-2026-098',
    branchId: 'b1',
    amount: 1450.00,
    method: 'Cash',
    status: 'Success',
    referenceId: 'CSH-REC-098',
    tenderedAmount: 1500,
    changeDue: 50,
    cashierName: 'Rohit Verma',
    createdAt: '2026-10-15 12:15'
  }
];

export const initialRefunds: Refund[] = [
  {
    id: 'ref-1',
    paymentId: 'pay-2',
    orderId: 'ord-99',
    orderNumber: 'ORD-2026-099',
    amount: 425.00,
    reason: 'Guest returned paneer tikka due to excessive spice, item removed from final bill and refunded.',
    authorizedBy: 'Priya Sharma (Manager)',
    status: 'Completed',
    createdAt: '2026-10-15 13:10'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    expenseNumber: 'EXP-2026-41',
    title: 'Commercial LPG Cylinder Refill (4 Cylinders)',
    category: 'Utilities & Power',
    vendor: 'Indane Commercial Gas Agency',
    date: '2026-10-15',
    amount: 7800,
    taxAmount: 390,
    paymentMethod: 'Bank Transfer',
    branchId: 'b1',
    submittedBy: 'Chef Ranveer Malhotra',
    status: 'Approved',
    approvedBy: 'Priya Sharma',
    createdAt: '2026-10-15 09:30',
    notes: 'Replaced kitchen heavy cylinders for weekly rotation.'
  },
  {
    id: 'exp-2',
    expenseNumber: 'EXP-2026-42',
    title: 'Fresh Microgreens & Edible Flowers Delivery',
    category: 'Food Supplies',
    vendor: 'HydroGreens Urban Farm',
    date: '2026-10-15',
    amount: 2450,
    taxAmount: 0,
    paymentMethod: 'UPI',
    branchId: 'b1',
    submittedBy: 'Chef Ranveer Malhotra',
    status: 'Approved',
    approvedBy: 'Priya Sharma',
    createdAt: '2026-10-15 10:15',
    notes: 'Garnish supplies for gourmet platters.'
  },
  {
    id: 'exp-3',
    expenseNumber: 'EXP-2026-43',
    title: 'Air Conditioning Duct Deep Sanitization',
    category: 'Repairs & Maintenance',
    vendor: 'CoolTech HVAC Solutions',
    date: '2026-10-14',
    amount: 14500,
    taxAmount: 2610,
    paymentMethod: 'Corporate Card',
    branchId: 'b1',
    submittedBy: 'Priya Sharma',
    status: 'Approved',
    approvedBy: 'Vikramaditya Singhania',
    createdAt: '2026-10-14 14:00',
    notes: 'Scheduled quarterly preventive AC duct cleaning.'
  },
  {
    id: 'exp-4',
    expenseNumber: 'EXP-2026-44',
    title: 'Diwali Festive Decor & Brass Lanterns',
    category: 'Marketing',
    vendor: 'Royal Brass Handicrafts',
    date: '2026-10-15',
    amount: 18200,
    taxAmount: 2184,
    paymentMethod: 'Corporate Card',
    branchId: 'b1',
    submittedBy: 'Priya Sharma',
    status: 'Pending Approval',
    createdAt: '2026-10-15 11:45',
    notes: 'Outdoor dining festive embellishments.'
  }
];

export const initialCashClosings: CashClosing[] = [
  {
    id: 'cc-1',
    closingNumber: 'CLS-2026-10-14-EVE',
    date: '2026-10-14',
    shift: 'Evening Shift',
    cashierName: 'Rohit Verma',
    branchId: 'b1',
    openingCash: 5000,
    cashSales: 18450,
    cashRefunds: 0,
    cashIn: 0,
    cashOut: 1200, // Petty cash for emergency ice bags
    expectedClosingCash: 22250,
    countedCash: 22250,
    variance: 0,
    denominations: {
      d2000: 0,
      d500: 36, // 18000
      d200: 15, // 3000
      d100: 10, // 1000
      d50: 4,   // 200
      d20: 2,   // 40
      d10: 1,   // 10
      coins: 0
    },
    notes: 'Clean shift. Drawer balanced with zero variance.',
    status: 'Approved',
    approvedBy: 'Priya Sharma',
    createdAt: '2026-10-14 23:45'
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Dr. Rajesh Khanna',
    phone: '+91 98188 77665',
    email: 'rajesh.khanna@medcenter.org',
    birthday: '1978-11-12',
    totalVisits: 14,
    totalSpend: 42800,
    loyaltyPoints: 850,
    lastVisitDate: '2026-10-12',
    tags: ['VIP', 'Regular'],
    dietaryPreferences: 'Less oil, spicy tandoori chicken lover',
    allergyNotes: 'None',
    marketingConsent: true,
    notes: 'Always orders Murgh Malai Kebab and Dal Bukhara. Appreciates quiet tables.',
    createdAt: '2025-08-10'
  },
  {
    id: 'cust-2',
    name: 'Neha Mehta',
    phone: '+91 98234 56789',
    email: 'neha.design@studio.com',
    birthday: '1990-05-24',
    totalVisits: 8,
    totalSpend: 23600,
    loyaltyPoints: 470,
    lastVisitDate: '2026-09-28',
    tags: ['VIP', 'Weekend Diner'],
    dietaryPreferences: 'Vegetarian, fond of Dahi Ke Kebab and Phirni',
    allergyNotes: 'Mild nut sensitivity',
    marketingConsent: true,
    notes: 'Celebrates family milestones here.',
    createdAt: '2025-11-15'
  },
  {
    id: 'cust-3',
    name: 'Kabir Kapoor',
    phone: '+91 99887 65432',
    email: 'kabir.kapoor@deloitte.com',
    totalVisits: 19,
    totalSpend: 86400,
    loyaltyPoints: 1720,
    lastVisitDate: '2026-10-08',
    tags: ['VIP', 'Corporate'],
    dietaryPreferences: 'Wine lover, Nalli Nihari and Biryani enthusiast',
    marketingConsent: true,
    notes: 'Hosts senior client dinners. PDR preferred.',
    createdAt: '2025-04-20'
  },
  {
    id: 'cust-4',
    name: 'Aditya Birla',
    phone: '+91 98111 88776',
    totalVisits: 4,
    totalSpend: 8900,
    loyaltyPoints: 180,
    lastVisitDate: '2026-10-15',
    tags: ['Regular'],
    dietaryPreferences: 'Loves fresh lassi and butter chicken',
    marketingConsent: false,
    createdAt: '2026-03-05'
  }
];

export const initialFeedback: Feedback[] = [
  {
    id: 'fb-1',
    customerName: 'Dr. Rajesh Khanna',
    customerPhone: '+91 98188 77665',
    orderNumber: 'ORD-2026-092',
    rating: 5,
    foodRating: 5,
    serviceRating: 5,
    ambienceRating: 5,
    comment: 'The Dal Bukhara remains the gold standard in Delhi. Attentive service by Ananya as always!',
    status: 'Reviewed',
    assignedStaff: 'Ananya Gupta',
    managerReply: 'Thank you Dr. Khanna! It is always an honour to host you and your family.',
    createdAt: '2026-10-12 22:15'
  },
  {
    id: 'fb-2',
    customerName: 'Simran Bajaj',
    customerPhone: '+91 98223 45678',
    orderNumber: 'ORD-2026-088',
    rating: 4,
    foodRating: 5,
    serviceRating: 4,
    ambienceRating: 4,
    comment: 'Food was heavenly! Slight wait for our table on the terrace during rush hour, but staff managed it gracefully.',
    status: 'Reviewed',
    assignedStaff: 'Priya Sharma',
    managerReply: 'Thank you Simran! We have enhanced our terrace queue notifications.',
    createdAt: '2026-10-11 21:30'
  }
];

export const initialStaff: StaffMember[] = [
  { id: 'stf-1', employeeId: 'EMP-101', name: 'Vikramaditya Singhania', role: 'Restaurant Owner', phone: '+91 98100 11223', email: 'owner@royalspice.com', branchId: 'b1', branchName: 'Connaught Place', joiningDate: '2024-01-01', status: 'Active', currentAttendanceStatus: 'Clocked In' },
  { id: 'stf-2', employeeId: 'EMP-102', name: 'Priya Sharma', role: 'Manager', phone: '+91 98111 22334', email: 'manager@royalspice.com', branchId: 'b1', branchName: 'Connaught Place', joiningDate: '2024-03-15', status: 'Active', currentAttendanceStatus: 'Clocked In' },
  { id: 'stf-3', employeeId: 'EMP-103', name: 'Rohit Verma', role: 'Cashier', phone: '+91 98222 33445', email: 'cashier@royalspice.com', branchId: 'b1', branchName: 'Connaught Place', joiningDate: '2024-06-01', status: 'Active', currentAttendanceStatus: 'Clocked In' },
  { id: 'stf-4', employeeId: 'EMP-104', name: 'Chef Ranveer Malhotra', role: 'Kitchen Staff', phone: '+91 98333 44556', email: 'kitchen@royalspice.com', branchId: 'b1', branchName: 'Connaught Place', joiningDate: '2024-02-10', status: 'Active', currentAttendanceStatus: 'Clocked In' },
  { id: 'stf-5', employeeId: 'EMP-105', name: 'Ananya Gupta', role: 'Host / Waiter', phone: '+91 98444 55667', email: 'host@royalspice.com', branchId: 'b1', branchName: 'Connaught Place', joiningDate: '2024-08-20', status: 'Active', currentAttendanceStatus: 'Clocked In' },
  { id: 'stf-6', employeeId: 'EMP-106', name: 'Deepak Saxena', role: 'Accountant', phone: '+91 98555 66778', email: 'accountant@royalspice.com', branchId: 'b1', branchName: 'Connaught Place', joiningDate: '2024-05-12', status: 'Active', currentAttendanceStatus: 'Clocked In' },
  { id: 'stf-7', employeeId: 'EMP-107', name: 'Kunal Sen', role: 'Host / Waiter', phone: '+91 98666 77889', email: 'kunal@royalspice.com', branchId: 'b1', branchName: 'Connaught Place', joiningDate: '2025-01-10', status: 'Active', currentAttendanceStatus: 'Clocked In' },
  { id: 'stf-8', employeeId: 'EMP-108', name: 'Chef Manoj Tiwari', role: 'Kitchen Staff', phone: '+91 98777 88990', email: 'manoj@royalspice.com', branchId: 'b1', branchName: 'Connaught Place', joiningDate: '2024-09-01', status: 'Active', currentAttendanceStatus: 'Clocked In' }
];

export const initialAttendance: AttendanceRecord[] = [
  { id: 'att-1', staffId: 'stf-2', staffName: 'Priya Sharma', date: '2026-10-15', clockIn: '09:45', breakDurationMinutes: 30, totalHours: 4.75, status: 'On Time' },
  { id: 'att-2', staffId: 'stf-3', staffName: 'Rohit Verma', date: '2026-10-15', clockIn: '10:00', breakDurationMinutes: 15, totalHours: 4.5, status: 'On Time' },
  { id: 'att-3', staffId: 'stf-4', staffName: 'Chef Ranveer Malhotra', date: '2026-10-15', clockIn: '09:30', breakDurationMinutes: 45, totalHours: 5.0, status: 'On Time' },
  { id: 'att-4', staffId: 'stf-5', staffName: 'Ananya Gupta', date: '2026-10-15', clockIn: '10:15', breakDurationMinutes: 20, totalHours: 4.25, status: 'Late' },
  { id: 'att-5', staffId: 'stf-7', staffName: 'Kunal Sen', date: '2026-10-15', clockIn: '10:00', breakDurationMinutes: 30, totalHours: 4.5, status: 'On Time' }
];

export const initialShifts: Shift[] = [
  { id: 'sh-1', staffId: 'stf-2', staffName: 'Priya Sharma', role: 'Manager', branchId: 'b1', date: '2026-10-15', startTime: '10:00', endTime: '19:00', station: 'Front of House', isPublished: true },
  { id: 'sh-2', staffId: 'stf-3', staffName: 'Rohit Verma', role: 'Cashier', branchId: 'b1', date: '2026-10-15', startTime: '11:00', endTime: '20:00', station: 'Main POS Desk', isPublished: true },
  { id: 'sh-3', staffId: 'stf-4', staffName: 'Chef Ranveer Malhotra', role: 'Kitchen Staff', branchId: 'b1', date: '2026-10-15', startTime: '10:00', endTime: '18:00', station: 'Tandoor & Charcoal', isPublished: true },
  { id: 'sh-4', staffId: 'stf-5', staffName: 'Ananya Gupta', role: 'Host / Waiter', branchId: 'b1', date: '2026-10-15', startTime: '11:30', endTime: '20:30', station: 'Indoor Dining Station A', isPublished: true },
  { id: 'sh-5', staffId: 'stf-7', staffName: 'Kunal Sen', role: 'Host / Waiter', branchId: 'b1', date: '2026-10-15', startTime: '12:00', endTime: '21:00', station: 'Outdoor Terrace', isPublished: true }
];

export const initialChecklists: ChecklistTask[] = [
  { id: 'chk-1', name: 'Verify POS cash drawer float (₹5,000 baseline)', category: 'Opening Checklist', assignedRole: 'Cashier', dueTime: '11:00', isCompleted: true, completedBy: 'Rohit Verma', completedAt: '10:45' },
  { id: 'chk-2', name: 'Inspect walk-in chiller temperature (< 4°C)', category: 'Food Safety & Temp', assignedRole: 'Kitchen Staff', dueTime: '10:30', isCompleted: true, completedBy: 'Chef Ranveer Malhotra', completedAt: '10:15' },
  { id: 'chk-3', name: 'Sanitize dining tables and polish cutlery sets', category: 'Opening Checklist', assignedRole: 'Host / Waiter', dueTime: '11:15', isCompleted: true, completedBy: 'Ananya Gupta', completedAt: '11:05' },
  { id: 'chk-4', name: 'Check LPG gas cylinder line pressure and shutoff valves', category: 'Kitchen Sanitation', assignedRole: 'Kitchen Staff', dueTime: '11:00', isCompleted: true, completedBy: 'Chef Ranveer Malhotra', completedAt: '10:50' },
  { id: 'chk-5', name: 'Reconcile counted cash with POS expected total', category: 'Cash Shift Closing', assignedRole: 'Cashier', dueTime: '23:30', isCompleted: false },
  { id: 'chk-6', name: 'Deep clean tandoor ashes and grease interceptors', category: 'Kitchen Sanitation', assignedRole: 'Kitchen Staff', dueTime: '23:45', isCompleted: false },
  { id: 'chk-7', name: 'Verify all exterior doors locked and alarm armed', category: 'Closing Checklist', assignedRole: 'Manager', dueTime: '00:00', isCompleted: false }
];

export const initialNotifications: SystemNotification[] = [
  { id: 'notif-1', type: 'order', title: 'New Dine-in Order', message: 'Table T-03 placed order ORD-2026-101 for ₹1,941.50', timestamp: '13:35', isRead: false, linkPage: 'orders', relatedId: 'ord-101' },
  { id: 'notif-2', type: 'kitchen', title: 'Kitchen Item Delay', message: 'T-03 Butter Chicken prep time exceeded 15 mins', timestamp: '13:50', isRead: false, linkPage: 'kds', relatedId: 'ord-101' },
  { id: 'notif-3', type: 'stock', title: 'Low Stock Alert', message: 'Fresh Malai Paneer is at 6.2 kg (below reorder level of 12 kg)', timestamp: '13:46', isRead: false, linkPage: 'inventory', relatedId: 'inv-4' },
  { id: 'notif-4', type: 'reservation', title: 'Upcoming VIP Booking', message: 'Dr. Rajesh Khanna arriving at 19:30 (Table T-02)', timestamp: '12:00', isRead: true, linkPage: 'reservations', relatedId: 'res-1' },
  { id: 'notif-5', type: 'approval', title: 'Expense Approval Needed', message: 'EXP-2026-44 Diwali Festive Decor (₹18,200) requires Owner approval', timestamp: '14:05', isRead: false, linkPage: 'expenses', relatedId: 'exp-4' }
];

export const initialAuditLogs: AuditLog[] = [
  { id: 'aud-1', timestamp: '2026-10-15 14:25', actor: 'Priya Sharma', role: 'Manager', module: 'Auth', action: 'Login', recordId: 'u2', summary: 'Successful manager session authentication', result: 'Success' },
  { id: 'aud-2', timestamp: '2026-10-15 14:18', actor: 'Rohit Verma', role: 'Cashier', module: 'Orders', action: 'Order Created', recordId: 'ord-104', summary: 'Created table order for T-04 (₹1,523.50)', result: 'Success' },
  { id: 'aud-3', timestamp: '2026-10-15 13:46', actor: 'Chef Ranveer Malhotra', role: 'Kitchen Staff', module: 'Inventory', action: 'Stock Deduction', recordId: 'inv-4', summary: 'Deducted 3.8 kg Paneer for lunch service', result: 'Success' },
  { id: 'aud-4', timestamp: '2026-10-15 13:10', actor: 'Priya Sharma', role: 'Manager', module: 'Finance', action: 'Refund Issued', recordId: 'ref-1', summary: 'Authorized ₹425.00 refund on ORD-2026-099 for spicy dish return', result: 'Warning' },
  { id: 'aud-5', timestamp: '2026-10-15 08:30', actor: 'Priya Sharma', role: 'Manager', module: 'Purchasing', action: 'Goods Receipt', recordId: 'po-3', summary: 'Verified & received 110 kg produce shipment from Himalayan Greens', result: 'Success' }
];
