# Feature Pages Documentation (Implementation Notes)

This doc gives implementation-level notes for the major routed pages that were previously missing coverage.

> All pages in this repo are currently **in-memory** (seed data + React component state). There is no backend integration.

---

## 1) Inventory

### `src/app/components/inventory/ProductsPage.tsx`

**Purpose:** Manage products: view, search, add/edit, delete, and adjust stock quantity.

**State (local):**

- `products` (initialized with `PRODUCTS` from `src/app/data.ts`)
- `search`, `filterCat`
- Modal state: `showModal`, `editing`, `form`
- Stock adjustment modal: `showAdjust`, `adjustQty`, `adjustType`

**Filtering:**

- `search` matches `name` or `sku`
- `filterCat` filters by `category` unless “الكل”

**Add / Edit:**

- `handleSave()`:
    - if `editing`: updates product in `products` state
    - else: creates new `Product` with id `p${Date.now()}` and prepends it

**Delete:**

- `handleDelete(id)` uses `confirm()` then removes from `products`

**Stock adjustment:**

- `handleAdjust()`:
    - for “in”: `quantity + adjustQty`
    - for “out”: `quantity - adjustQty` (clamped to `>= 0`)

**Empty states:**

- Shows “لا توجد منتجات تطابق البحث” when filtered list is empty.

---

### `src/app/components/inventory/StockTransferPage.tsx`

**Purpose:** Create and manage transfers between branches, including approvals.

**State (local):**

- `transfers`: initialized from `STOCK_TRANSFERS` in `src/app/branchData.ts`
- `stocks`: initialized from `BRANCH_STOCKS` in `src/app/branchData.ts` (array of `{branchId, productId, quantity}`)
- Filtering: `search`, `filterStatus`
- Create modal: `showCreate`, `form` (fromBranchId, toBranchId, productId, quantity, notes)

**Derived values:**

- `sourceStock = getBranchStock(fromBranchId, productId, stocks)`

**Create transfer:**

- `handleCreate()` guards:
    - product selected
    - quantity > 0
    - fromBranchId !== toBranchId
    - quantity <= `sourceStock`
- On success:
    - creates a new `StockTransfer` with `id: TR-2026-XXX`
    - status set to `pending`
    - requestedBy hard-coded as `أحمد الإداري`
    - date set to today
    - prepends to `transfers`

**Approve transfer steps:**

- “موافقة” sets status to `approved` (does not modify stocks)
- “إتمام التحويل” updates `stocks`:
    - subtract from source branch (clamped at 0)
    - add to destination branch
    - sets transfer status to `completed`

**Reject:**

- “رفض” sets transfer status to `rejected`

**Empty states:**

- Table shows “لا توجد سجلات” if filtered transfers is empty.

---

## 2) Customers / Suppliers

### `src/app/components/customers/CustomersPage.tsx`

**Purpose:** Manage customers and view a per-customer sales history.

**State (local):**

- `customers`: initialized from `CUSTOMERS`
- `search`
- CRUD modals: `showModal`, `editing`, `form`
- View modal: `viewing`

**Filtering:**

- matches `name`, `phone`, `email`

**Create/Edit:**

- Adds customer with `id: c${Date.now()}`
- Editing merges `form` into the existing customer

**Delete:**

- Uses `confirm()`

**Per-customer sales history:**

- `getCustomerSales(id)` returns `SALES.filter(s => s.customerId === id)`
- View modal shows each sale id/date/total/status.

---

### `src/app/components/suppliers/SuppliersPage.tsx`

**Purpose:** Manage suppliers (CRUD) and display supplier summary cards.

**State (local):**

- `suppliers` from `SUPPLIERS`
- `search`
- Modals: `showModal`, `editing`, `form`

**Filtering:**

- matches `name`, `phone`, `email`

**Create/Edit/Delete:**

- Standard in-memory CRUD with `confirm()` for deletion.

**UI:**

- Renders both a table and “supplier cards” (card section uses the filtered list).

---

## 3) Sales / Purchases

### `src/app/components/sales/SalesPage.tsx`

**Purpose:** Manage Sales documents of multiple types (invoice/order/quotation).

**State (local):**

- `sales`: initialized from `SALES`
- `tab`: one of `'invoice' | 'order' | 'quotation'`
- `search`
- Create modal: `showCreate`, `createType`, `form`, `items[]`
- View modal: `viewSale`

**Tabs:**

- `TABS` controls which `sale.type` is listed.

**Create flow:**

- Customer is selected from `CUSTOMERS`
- Payment method selected from `PAYMENT_LABELS`
- Items are built by selecting `PRODUCTS[0]` first, then users can change product, qty, unit price, and discount% per line.

**Calculations:**

- line total recomputed as `quantity * unitPrice * (1 - discount/100)`
- subtotal = sum of item totals
- taxAmount = `((subtotal - discountAmount) * taxRate)/100`
- total = `subtotal - discountAmount + taxAmount`

**Status defaults:**

- invoice: `paid`
- order: `pending`
- quotation: `draft`

**Printing:**

- `handlePrint(sale)` opens a new window and writes an HTML receipt.

---

### `src/app/components/purchases/PurchasesPage.tsx`

**Purpose:** Manage Purchase documents (order vs invoice) and print/view details.

**State (local):**

- `purchases`: initialized from `PURCHASES`
- `tab`: `'order' | 'invoice'`
- Create modal: `showCreate`, `createType`, `form` and `items[]`
- View modal: `viewPurchase`

**Create flow:**

- supplier selected from `SUPPLIERS`
- items select from `PRODUCTS`

**Calculations:**

- line total = `quantity * unitCost`
- taxAmount = `subtotal * taxRate / 100`
- total = `subtotal + taxAmount`

**Status defaults:**

- order: `pending`
- invoice: `received`

**Table status change:**

- In view list, `status` is modifiable via a `<select>` using `updateStatus()`.

**Printing:**

- opens a new window and writes a basic HTML document.

---

## 4) Reports

### `src/app/components/reports/ReportsPage.tsx`

**Purpose:** Provide chart-based reports over seed data.

**State (local):**

- `reportType`: currently `'sales' | 'products' | 'customers' | 'profit'`
- `period`: `'daily' | 'weekly' | 'monthly' | 'custom'`
- custom date range: `dateFrom`, `dateTo`

**Summary calculations:**

- totals derived from `REVENUE_DATA`
- profit margin = `totalProfit/totalRevenue * 100`

**Charts (recharts):**

- sales: line chart of revenue + profit (REVENUE_DATA)
- products: pie chart (categoryData) + bar chart (revenue by category)
- customers: bar chart (top customers) + customer summary table
- profit: bar chart + profit margin bars

**Exports:**

- uses `alert()` placeholders (no real file generation in current repo).

---

## 5) Roles / Authorization UI (RBAC)

### `src/app/components/roles/RolesPage.tsx`

**Purpose:** Create/edit roles and configure permissions using a permission matrix UI.

**State (local):**

- `roles`: initialized from `DEFAULT_ROLES` in `src/app/rbacData.ts`
- `search`
- Create/edit modals and matrix modal
- `matrixEdit` (a PermissionMap for the selected role)

**Permission matrix behavior:**

- Modules (`ALL_MODULES`) and permissions (`ALL_PERMISSIONS`) come from `src/app/rbacData.ts`.
- For each module and permission, a boolean indicates whether the role has that permission.

**Batch toggle helpers:**

- `toggleAllInModule(mod, value)` sets all permissions in a module.
- `toggleAllForPerm(perm, value)` sets a permission across all modules.

**Role persistence:**

- All changes are kept in local React state (`useState`); no backend.

---

### `src/app/rbacData.ts`

**Purpose:** Defines permission and role data structures, plus seeded role matrix.

Key exports:

- Types: `Module`, `Permission`, `PermissionMap`, `AppRole`, `AuditEntry`
- Constants:
    - `MODULE_LABELS`, `PERMISSION_LABELS`
    - `ALL_MODULES`, `ALL_PERMISSIONS`
- Helper:
    - `buildMatrix(overrides)` builds a full permission matrix using defaults.
- Seed data:
    - `DEFAULT_ROLES`
    - `AUDIT_LOG`

---

## 6) Audit log

### `src/app/components/audit/AuditLogPage.tsx`

**Purpose:** Display and filter audit entries.

**State (local):**

- `logs` initialized from `AUDIT_LOG`
- filters: `search`, `filterModule`, `filterBranch`, `dateFrom`, `dateTo`

**Filtering behavior:**

- module and branch exact match filters (unless “الكل”)
- date filtering uses lexicographic compare on `log.date` (seed date strings are ISO-like)
- search checks `userName`, `action`, and `details`

**Empty state:**

- shows “لا توجد سجلات تطابق الفلتر” when no matches.

---

## 7) Settings

### `src/app/components/settings/SettingsPage.tsx`

**Purpose:** Manage company info, branches, tax settings, invoice settings, and users.

**State (local):**

- `tab`: one of `company`, `branches`, `tax`, `invoice`, `users`
- `saved`: triggers “تم الحفظ ✓” toast-like message
- `users` state (seeded from `USERS`)
- `branches` state (seeded from `BRANCHES`)
- `company` state
- `taxSettings` state
- `invoiceSettings` state

**User modal:**

- Add/edit user entries (in-memory)

**Role navigation:**

- There is a button to navigate to `/roles`.

---

## 8) Summary of “how these pages talk to each other”

At the moment, pages are loosely coupled through:

- **Seed data** from `src/app/data.ts` and `src/app/branchData.ts`
- **Shared UI chrome** in `src/app/components/layout/Layout.tsx` (auth gating + navigation + branch selector)
- **Route definitions** in `src/app/routes.ts`

There is no shared backend/database layer, so CRUD updates are page-local state.
