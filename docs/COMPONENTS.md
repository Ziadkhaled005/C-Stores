# Component Documentation (Implementation Notes)

This document explains the major UI components/pages and how they work internally.

> Note: The app mostly uses **in-memory seed data** from `src/app/data.ts` and state handled by **Zustand** in `src/app/store.ts`.

---

## Auth

### `src/app/components/auth/LoginPage.tsx`

**Purpose:** Authenticate the user and navigate to the main dashboard.

**Key behaviors:**

- Uses `useAuthStore()` from `src/app/store.ts`.
- The login form collects `email` + `password`.
- `useAuthStore.login(email, password)` searches user credentials in the in-memory `USERS` array (see `src/app/data.ts`).
- Shows an error banner when login fails.
- Provides “quick login” buttons for each seeded user to speed up demo/testing.
- On success: `navigate('/')`.

**Important UX details:**

- Loading state is simulated with a short timeout.
- Uses `dir="rtl"` and Cairo font for Arabic UI.

---

## Layout / Navigation

### `src/app/components/layout/Layout.tsx`

**Purpose:** App shell (sidebar + top header + routing outlet) and authentication gating.

**How it gates access:**

- Reads `user` and `isAuthenticated` from `useAuthStore`.
- `useEffect`: if `!isAuthenticated`, navigates to `/login`.
- If not authenticated, it returns `null`.

**UI structure:**

- **Sidebar** (right side in RTL):
    - Brand header.
    - Current branch card (from `useBranchStore.currentBranch`).
    - Navigation links (via `NavLink`) for all feature routes.
- **Main header**:
    - Mobile menu toggle.
    - Branch selector dropdown (from `BRANCHES` in `src/app/branchData.ts`).
    - Notification + user chip.
- **Logout button**:
    - Calls `logout()` then navigates to `/login`.

**Where to update navigation:**

- `NAV_ITEMS` array inside `Layout.tsx`.

---

## POS

### `src/app/components/pos/POSPage.tsx`

**Purpose:** Main Point-of-Sale screen.

See the detailed flow in `docs/PROJECT_OVERVIEW.md` under **“POS page overview (POSPage)”**.

---

## Dashboard

### `src/app/components/dashboard/Dashboard.tsx`

**Purpose:** Shows KPIs and charts plus quick access to POS/sales.

**Key features:**

1. **Branch-specific low stock**
    - Uses `useBranchStore.currentBranch`.
    - Uses `getBranchStock(currentBranch.id, productId, BRANCH_STOCKS)` from `src/app/branchData.ts`.
    - Low stock is computed as: `branchStock <= product.reorderLevel`.

2. **Sales KPI cards (static demo data)**
    - `todaySales`: filters `SALES` where `date === '2026-06-18'` and `status === 'paid'`.
    - `todayRevenue`: sum of `sale.total`.
    - `monthRevenue`: uses `REVENUE_DATA[5].revenue`.
    - `totalOrders`: counts invoices in `SALES`.

3. **Charts (recharts)**
    - **Line chart**: `REVENUE_DATA` for revenue/profit.
    - **Bar chart**: `topProducts` static list.

4. **Tables / lists**
    - “آخر الفواتير”: renders the first 6 items from `SALES.slice(0, 6)` with a status badge.
    - “تنبيهات المخزون”: lists low-stock items, showing per-branch quantity.

**Navigation:**

- Uses `useNavigate()` to route to `/pos` and `/sales` and `/products`.

---

## Reports / Sales / Purchases / Customers / Suppliers / Roles / Audit / Settings

These pages exist in the routing table (`src/app/routes.ts`).

In the current project state, this docs file only includes deep implementation notes for the components we inspected (LoginPage, Layout, Dashboard, POS).

To extend this documentation, inspect each target file under:

- `src/app/components/reports/*`
- `src/app/components/sales/*`
- `src/app/components/purchases/*`
- `src/app/components/customers/*`
- `src/app/components/suppliers/*`
- `src/app/components/roles/*`
- `src/app/components/audit/*`
- `src/app/components/settings/*`

…and then add:

- main data sources (from `data.ts` and/or `store.ts`)
- filters and calculations
- UI controls and empty/loading states
- how errors are handled
