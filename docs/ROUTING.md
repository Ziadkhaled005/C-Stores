# Routing Reference

Routes are defined in `src/app/routes.ts` using `createBrowserRouter`.

## Top-level routes

- **`/login`** → `LoginPage`

## Main layout and child routes

The `Layout` component is mounted at **`/`** and renders children routes:

| Path         | Component           |
| ------------ | ------------------- |
| `/` (index)  | `Dashboard`         |
| `/pos`       | `POSPage`           |
| `/products`  | `ProductsPage`      |
| `/transfers` | `StockTransferPage` |
| `/customers` | `CustomersPage`     |
| `/suppliers` | `SuppliersPage`     |
| `/sales`     | `SalesPage`         |
| `/purchases` | `PurchasesPage`     |
| `/reports`   | `ReportsPage`       |
| `/audit`     | `AuditLogPage`      |
| `/roles`     | `RolesPage`         |
| `/settings`  | `SettingsPage`      |
