# Developer Guide

This document explains how the codebase is structured and how to safely extend it.

---

## 1) Setup & local development

The root `README.md` provides basic commands:

- Install dependencies:
    - `npm i`
- Start dev server:
    - `npm run dev`

Vite will start the app, and routing works client-side.

---

## 2) Folder conventions

Key folders:

- `src/app/`
    - `routes.ts` — routing configuration
    - `App.tsx` — app entry
    - `store.ts` — Zustand stores
    - `data.ts` — in-memory seed data
    - `components/` — page/component implementations

---

## 3) State management (Zustand)

All global application state in this repo is handled via Zustand hooks in `src/app/store.ts`.

### Auth store

- `useAuthStore`
- fields: `user`, `isAuthenticated`
- actions: `login(email, password)`, `logout()`

### Branch store

- `useBranchStore`
- fields: `currentBranch`
- actions: `setCurrentBranch(branch)`

### POS store

- `usePOSStore`
- stores the current cart, customer selection, notes, payment method, and discount/tax settings.

**Guideline when modifying POS behavior**:

- Keep calculations consistent:
    - line totals depend on line discount percent.
    - cart totals depend on cart subtotal, global discount amount, then tax.

---

## 4) POS page extension points

Primary file:

- `src/app/components/pos/POSPage.tsx`

Common extension tasks and where to implement them:

### 4.1 Add a new payment method

1. Update `paymentMethod` union type in `src/app/store.ts` if needed.
2. Update the UI payment button list in `POSPage.tsx`:
    - `PAYMENT_ICONS`
    - `PAYMENT_LABELS`
    - ensure keys match the union type.

### 4.2 Change tax behavior

- The tax rate is stored in `usePOSStore` (`taxRate`).
- The POS page calculates tax:
    - `taxAmount = (afterDiscount * taxRate) / 100`
- If tax should be computed differently (e.g., tax on subtotal before global discount), change the formulas in `POSPage.tsx`.

### 4.3 Receipt contents

Receipt markup exists in the `showReceipt` modal section inside `POSPage.tsx`.

- Receipt is also used for printing via `receiptRef`.
- If you add fields, also ensure they appear within the element referenced by `receiptRef`.

### 4.4 Printing

Printing logic is in `handlePrint`.

- It writes an entire HTML doc and uses `receiptRef.current.innerHTML`.
- If print styles need updates (e.g., font size, separators), update the `<style>` block inside `handlePrint`.

---

## 5) Routing

Routing is defined in `src/app/routes.ts`.

- If you add a new page:
    1. Create a new component under `src/app/components/<area>/`.
    2. Add a route entry under the `Layout` children list.

---

## 6) Data updates

Seed data is in `src/app/data.ts`.

- Products: `PRODUCTS`
- Customers: `CUSTOMERS`
- Suppliers: `SUPPLIERS`
- Sales: `SALES`
- Purchases: `PURCHASES`

If you want the UI to reflect changes immediately without a backend, update these arrays.

---

## 7) Code quality recommendations

Based on typical practices for this repo:

- Keep UI components focused.
- Prefer extracting complex pieces (e.g., receipt rendering, cart item rendering) into smaller components when expanding.
- Avoid introducing inconsistent naming between store state and UI.

---

## 8) Testing

This repository currently does not show explicit test tooling in `package.json`.

Practical testing checklist for POS changes:

- Add product → verify cart quantity increments.
- Update line discount → verify per-line total recomputes.
- Update global discount → verify subtotal and totals recompute correctly.
- Set payment method → verify receipt shows correct label.
- Checkout with empty cart → verify guard behavior.
- Print receipt → verify printing uses receipt modal DOM.

---

## Attribution

See `ATTRIBUTIONS.md` for licensing and third-party usage notes.
