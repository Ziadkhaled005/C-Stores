# C Store — Project Documentation

> This project is a React + Vite + TypeScript “C Store” application that provides an operational UI for a retail workflow (POS, inventory, purchases, sales, customers, suppliers, reports, roles, settings).

---

## 1) What the project is

C Store is a single-page application (SPA) designed around business pages:

- **POS (Point of Sale)**: add products to a cart, apply discounts/tax, choose payment method, generate an invoice receipt, and print the receipt.
- **Inventory / Products**: manage products and quantities (see routes below).
- **Transfers**: stock transfers.
- **Customers / Suppliers**: manage master data.
- **Sales / Purchases / Reports**: view transactional data.
- **Security / Operations**: roles, audit log, and settings.

The current codebase includes a fully implemented POS page with a receipt modal and printing logic.

---

## 2) Tech stack

- **Frontend**: React (18) + TypeScript
- **Build tooling**: Vite
- **Routing**: `react-router` (`createBrowserRouter`)
- **State management**: Zustand
- **Styling**: Tailwind CSS (and shadcn-related theme CSS present in the repo)
- **Icons**: `lucide-react`

Key dependencies (from `package.json`):

- `react-router`
- `zustand`
- `tailwindcss`
- `@vitejs/plugin-react`
- `lucide-react`

---

## 3) Project structure (high level)

The app is organized under `src/`.

Important files discovered in this repo:

- `src/app/App.tsx`
- `src/app/routes.ts`
- `src/app/store.ts`
- `src/app/data.ts`
- `src/app/components/pos/POSPage.tsx`

### Routing entry

- `src/app/App.tsx` mounts the router provider:
    - `<RouterProvider router={router} />`

---

## 4) Routes / pages

Routes are declared in `src/app/routes.ts`.

Top-level route list:

- `GET /login` → `LoginPage`
- `GET /` → `Layout` (child routes):
    - `/` (index) → `Dashboard`
    - `/pos` → `POSPage`
    - `/products` → `ProductsPage`
    - `/transfers` → `StockTransferPage`
    - `/customers` → `CustomersPage`
    - `/suppliers` → `SuppliersPage`
    - `/sales` → `SalesPage`
    - `/purchases` → `PurchasesPage`
    - `/reports` → `ReportsPage`
    - `/audit` → `AuditLogPage`
    - `/roles` → `RolesPage`
    - `/settings` → `SettingsPage`

---

## 5) Data model (seed data)

The project uses in-memory seed/static data from:

- `src/app/data.ts`

### Major exported entities

- **Users & roles**
    - `USERS`, `Role`, `ROLE_LABELS`
- **Products**
    - `Product` type, `PRODUCTS`
    - product fields include: `id`, `name`, `sku`, `barcode`, `brand`, `category`, `costPrice`, `sellingPrice`, `quantity`, `reorderLevel`
- **Customers**
    - `Customer` type, `CUSTOMERS`
- **Suppliers**
    - `Supplier` type, `SUPPLIERS`
- **Sales and purchases**
    - `SALES`, `PURCHASES` arrays
      after importing `formatCurrency` for display.

### Currency formatting

- `formatCurrency(amount)` uses `Intl.NumberFormat('ar-EG', { currency: 'EGP' })`.

---

## 6) POS page overview (`POSPage`)

Implementation location:

- `src/app/components/pos/POSPage.tsx`

### 6.1 UI layout

The POS page is a responsive two-column layout:

- **Left (Products Panel)**
    - Search input
    - Category filter chips
    - Product grid
- **Right (Cart Panel)**
    - Cart header (including “clear all”)
    - Optional customer selection
    - Cart items list
    - Totals (subtotal, global discount, tax, total)
    - Payment method selection
    - Checkout button
- **Modals**
    - Customer picker modal
    - Receipt modal after checkout

The page uses RTL-friendly rendering (`dir="rtl"`) inside the receipt.

---

## 7) POS state management (`usePOSStore`)

Implementation location:

- `src/app/store.ts`

The POS cart and checkout configuration are managed by Zustand:

- Hook: `usePOSStore`

### CartItem type

```ts
export interface CartItem {
    productId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    discount: number; // percent per line item
    total: number;
}
```

### POS store fields

- `cart: CartItem[]`
- `customerId: string`
- `customerName: string`
- `notes: string`
- `paymentMethod: 'cash' | 'visa' | 'transfer' | 'instapay'`
- `discountAmount: number` (global discount)
- `taxRate: number` (percent)

### Store actions

- `addToCart(item: Omit<CartItem, 'total'>)`
- `removeFromCart(productId: string)`
- `updateQuantity(productId: string, quantity: number)`
- `updateDiscount(productId: string, discount: number)`
- `clearCart()`
- `setCustomer(id, name)`
- `setNotes(notes)`
- `setPaymentMethod(method)`
- `setDiscountAmount(amount)`
- `setTaxRate(rate)`

### Discount & tax calculations (POS)

In `POSPage.tsx` and store methods:

- **Line totals**: `quantity * unitPrice * (1 - discount/100)`
- **Cart subtotal**: sum of `item.total`
- **After discount**: `subtotal - discountAmount`
- **Tax amount**: `(afterDiscount * taxRate) / 100`
- **Total**: `afterDiscount + taxAmount`

---

## 8) Checkout & receipt generation

### 8.1 Checkout (`handleCheckout`)

When user clicks **إتمام البيع**:

1. Guard: if cart is empty, do nothing.
2. Create an invoice object:
    - `id`: `INV-2026-XXX` (auto-incrementing counter)
    - `customerName`: default to `'عميل عام'`
    - `date`/`time`: formatted with `ar-EG`
    - `items`: copy of cart items
    - `subtotal`, `discountAmount`, `taxRate`, `taxAmount`, `total`
    - `paymentMethod`
3. Update component state:
    - `setLastInvoice(invoice)`
    - `setShowReceipt(true)`
4. Clear the cart via `clearCart()`.

### 8.2 Receipt modal (`showReceipt`)

The receipt modal renders:

- Store name / contact info (hard-coded in `POSPage`)
- Invoice ID, date/time, customer name
- Items (each line: price + product name × quantity)
- Discount (if global discount > 0)
- Tax amount and total
- Payment method label
- Footer message

---

## 9) Printing receipt (`handlePrint`)

Printing is performed entirely in the browser:

- It opens a new browser tab/window via `window.open('', '_blank')`.
- It writes a complete HTML document to the new window.
- The HTML includes:
    - Cairo font import from Google Fonts
    - RTL direction (`direction: rtl`)
    - Receipt-related styles for 80mm printing
- Then it triggers:
    - `win.print()` after a short timeout
    - closes the window with `win.close()`

Important behavior:

- The content printed is `receiptRef.current.innerHTML`, meaning the receipt modal DOM is reused as print markup.

---

## 10) Internationalization / localization notes

- The UI is Arabic-first (RTL layout).
- Currency formatting is Egyptian Pound in `formatCurrency`.
- Receipt date/time uses `ar-EG` locale.

---

## 11) Licensing / attribution

Third-party UI resources are referenced in:

- `ATTRIBUTIONS.md`

Example referenced sources:

- shadcn/ui (MIT)
- Unsplash images

---

## 12) Known implementation details / considerations

These are implementation notes based on current code:

- The POS invoice counter is initialized with `let invoiceCounter = 19;` in `POSPage.tsx`. It increments in-memory only (resets on refresh).
- Customer selection is optional. “بدون عميل (عميل عام)” sets an empty id and clears name in the store.
- Global discount is treated as an **absolute amount** (`subtotal - discountAmount`) rather than a percent.
- Per-line discount is a **percent** stored in each cart item.
- Receipt header info (store name and phone) is hard-coded in the receipt markup.

---

## Where to look next

- POS UI: `src/app/components/pos/POSPage.tsx`
- POS state/actions: `src/app/store.ts`
- Seed data: `src/app/data.ts`
- Route definitions: `src/app/routes.ts`
