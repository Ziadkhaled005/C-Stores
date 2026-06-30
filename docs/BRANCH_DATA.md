# Branch Data & Stock Model

This document describes the branch inventory data model and helper functions used across the app.

Source: `src/app/branchData.ts`

---

## 1) Why this exists

Multiple pages depend on **branch-specific stock**:

- `Layout` shows the current branch and lets you switch branches.
- `Dashboard` computes low stock per branch.
- `POS` uses global product quantities (not per-branch stock) in the current implementation.
- `StockTransferPage` reads and updates **branch stock records**.

---

## 2) Types

### `Branch`

```ts
export interface Branch {
    id: string;
    name: string;
    code: string;
    address: string;
    phone: string;
    manager: string;
    isActive: boolean;
    isMain: boolean;
}
```

### `BranchStock`

Represents stock quantity for a product inside a branch.

```ts
export interface BranchStock {
    branchId: string;
    productId: string;
    quantity: number;
}
```

### `StockTransfer`

Represents a transfer request between branches for a product.

```ts
export interface StockTransfer {
    id: string;
    fromBranchId: string;
    fromBranchName: string;
    toBranchId: string;
    toBranchName: string;
    productId: string;
    productName: string;
    quantity: number;
    notes: string;
    status: "pending" | "approved" | "rejected" | "completed";
    requestedBy: string;
    date: string;
}
```

---

## 3) Seed data

### `BRANCHES`

A list of branch records with status flags:

- `isActive`: determines whether the branch is shown in branch selector.
- `isMain`: used for UI labels (“رئيسي”).

### `BASE_STOCKS`

A map of product id → array of quantities.
The array is ordered to match the order of `BRANCHES`.

Example (conceptually):

- For `p1`, `BASE_STOCKS.p1[0]` is the quantity at `BRANCHES[0]`, `BASE_STOCKS.p1[1]` is quantity at `BRANCHES[1]`, etc.

### `BRANCH_STOCKS`

A derived array created from `BRANCHES` + `BASE_STOCKS`:

- It flattens everything into `BranchStock[]` records.

---

## 4) Helper functions

### `getBranchStock(branchId, productId, stocks)`

Returns the quantity for a given branch/product combination.

- If the record is not found, it returns `0`.

Signature:

```ts
export const getBranchStock = (
    branchId: string,
    productId: string,
    stocks: BranchStock[],
) =>
    stocks.find((s) => s.branchId === branchId && s.productId === productId)
        ?.quantity ?? 0;
```

---

## 5) How branch switching works (end-to-end)

### Current branch selection

- The selected branch is stored in `useBranchStore.currentBranch`.
- `Layout` updates it by calling `setCurrentBranch(branch)` when the user selects a branch.

### Stock usage

- `Dashboard` reads `currentBranch.id`, then calculates low stock by comparing:
    - `getBranchStock(currentBranch.id, productId, BRANCH_STOCKS)`
    - against the product’s `reorderLevel`.

### Stock transfers

`StockTransferPage` holds local state for:

- `transfers` (initially `STOCK_TRANSFERS`)
- `stocks` (initially `BRANCH_STOCKS`)

When a transfer is completed:

- it decrements source branch stock
- increments destination branch stock

---

## 6) Important implementation notes

- All data is **in-memory**. Branch stock changes exist only while the app session is running.
- `POSPage` currently uses `PRODUCTS` quantities for “remaining” display, but it does not read or update `BRANCH_STOCKS`.
    - If you need POS to be branch-aware, you would need to wire POS cart checkout to branch stock updates.
