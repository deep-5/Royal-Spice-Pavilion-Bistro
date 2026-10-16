# 👑 Royal Spice Pavilion & Bistro — Restaurant Operations & Management Platform

A modern, responsive, and enterprise-grade Restaurant Operations & Management web application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite**.

Designed with a premium hospitality SaaS visual language inspired by the **Moniex** design system (Warm Coral Orange `#F5764B`, crisp `#FFFFFF` cards, soft `#F8F9FA` canvas, and interactive SVG spline curves).

---

## 🌟 Key Highlights & Modules (32 Full Modules)

### 📊 1. Overview
* **Main Operations Dashboard**: 4 Hero KPI Cards with embedded mini-sparkline waveforms, interactive cubic bezier spline area chart for hourly revenue velocity vs target, Moniex-style segmented revenue donut chart, capsule pill bar charts, semi-circular floor capacity gauge, live floor table grid, kitchen delays, low-stock reorder warnings, and recent transactions.
* **Sales Analytics & Audit**: Gross/Net sales audit, CGST/SGST tax liabilities (5% GST), service charge accounting, tender breakdown by payment channel (UPI, Card, Cash), and menu category revenue contributions.

### 🍽️ 2. Front of House
* **Reservations & Booking**: Day, Week, and List calendar views, guest party capacity checkers, table assignment gates, check-in, seating dispatch, and status tracking.
* **Live Waitlist**: Walk-in queue with estimated wait time tracking, SMS notification simulation, and one-tap table seating.
* **Floor Plan & Table Management**: Interactive dining room grid across Indoor, Terrace, Bar, and Private Dining sections with live table status (Available, Reserved, Seated, Ordering, Occupied, Bill Requested, Cleaning, Out of Service), table merging/splitting, and server assignment.
* **Table QR Management**: Cryptographic SVG QR code generator for every table and standee tent card layouts.
* **Customer QR Mobile Menu**: Mobile-first web app (no download required) with categories, item photos, dietary/allergen tags, variant modifiers, real-time cart, and table-linked ordering.
* **Touch POS Terminal**: Responsive touch terminal with category navigation, modifier popups, customer lookup, hold/recall orders, discount application, split billing, multi-tender payment processing, and printable tax invoice receipts.
* **Order Management**: Real-time order pipeline across New, Preparing, Ready, Served, Completed, Cancelled, and Refunded with order timelines.

### 👨‍🍳 3. Kitchen Operations
* **Kitchen Display System (KDS)**: Touch-optimized kanban board with New, Cooking/In Prep, and Ready at Pass columns, elapsed cooking timers, rush priority flags, and station routing filters.
* **Preparation History**: Completed kitchen ticket audit log with cooking speed metrics and recall capabilities.

### 📦 4. Menu, Recipes & Inventory
* **Menu Categories**: Taxonomy and display ordering management.
* **Menu Items**: 25+ artisanal heritage delicacies with SKU codes, tax rates, dietary tags, sold-out toggles, and station assignments.
* **Modifiers & Add-ons**: Customizable modifier groups with minimum and maximum selection constraints.
* **Recipe Costing**: Raw ingredient portion yields, food cost percentages, and gross profit margins.
* **Inventory Overview**: Real-time stock levels, inventory valuation, minimum reorder alerts, and physical stock count reconciliations.
* **Stock Movements**: Complete audit trail of ingredient inflows, recipe depletions, and spoilage waste records.
* **Suppliers CRM**: Vendor directory, GSTIN tax identifiers, payment terms, and PO history.
* **Purchase Orders**: Full procurement cycle (Draft, Pending Approval, Approved, Sent, Received).
* **Goods Received Notes (GRN)**: Inward inspection logs, invoice matching, and discrepancy tracking.

### 👥 5. Customers & Staff
* **Customer CRM**: Guest profiles, dietary preferences, lifetime spend, order history, and data consent settings.
* **Guest Feedback**: Star ratings breakdown and manager response editor.
* **Staff Directory**: Employee roster, role assignments, contact details, and branch allocation.
* **Attendance & Timeclock**: Clock-in/out logging, break tracking, timesheet corrections, and CSV export.
* **Shifts & Scheduling**: Station scheduling, overlap validation, and roster publishing.
* **Operational Checklists**: Opening, Closing, Sanitation, Food Safety/Temp, and Cash Closing SOP logs.

### 💰 6. Finance & Shift Closing
* **Payments Audit**: Transaction register, payment channels (UPI, Card, Cash, Split), and refunds.
* **Refunds Management**: Authorized refund ledger with order links and reasons.
* **Expenses**: Categorized overhead expenditures, tax invoices, and manager approval gates.
* **Cash Drawer Closing**: End-of-shift register reconciliation, opening float, expected vs physical counted cash denominations breakdown, variance reporting, and manager sign-off.
* **Finance Overview**: Real-time Profit & Loss statement with gross margins and operational expenses.
* **Reports Center**: Exportable PDF/CSV reports across Sales, Tax Audit, Kitchen SLA, and Staff Hours.

### ⚙️ 7. Settings & Configuration
* **Restaurant Profile**: Branding, legal GSTIN, address, currency (INR ₹), and timezone.
* **Multi-Branch Management**: Multi-location branch switcher.
* **Operating Hours**: Weekly hours and holiday schedules.
* **Tax & Service Charge**: GST 5% tax configuration, service charge toggle, and live bill simulator.
* **Floor & Section Settings**: Dining areas and table layout configurator.
* **Users & Role Permissions**: Granular permission matrix across Restaurant Owner, Manager, Cashier, Kitchen Staff, Waiter, and Accountant.
* **Integrations**: Payment Gateways, Thermal Printers, SMS/WhatsApp engines, and Accounting Sync.
* **System Audit Logs**: Immutable activity trail recording user, role, module, action, and timestamp.

---

## 🎨 Design System & Color Palette

* **Primary Brand Accent**: `#F5764B` *(Moniex Warm Coral Orange)*
* **Primary Hover**: `#E05A2B`
* **Page Canvas Background**: `#F8F9FA` *(Soft Warm Neutral)*
* **Card & Modal Background**: `#FFFFFF` *(Pure White)*
* **Typography**: `#1F2937` / `#111827` *(Dark Charcoal Headings)*
* **Muted Text**: `#6B7280` *(Neutral Gray)*
* **Borders**: `#E5E7EB` / `#F0F1F5` *(Subtle Thin Borders)*
* **Semantic Status Indicators**:
  * Success / Completed: `#10B981` / `emerald-600`
  * Warning / Cooking: `#D97706` / `amber-600`
  * Error / Cancelled: `#DC2626` / `red-600`

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+ recommended)
* npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/deep-5/Royal-Spice-Pavilion-Bistro.git

# Navigate into project directory
cd Royal-Spice-Pavilion-Bistro

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) or [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

### Production Build

```bash
# Type check and build Vite bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
