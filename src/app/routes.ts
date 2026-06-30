import { createBrowserRouter } from 'react-router';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './components/auth/LoginPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { POSPage } from './components/pos/POSPage';
import { ProductsPage } from './components/inventory/ProductsPage';
import { StockTransferPage } from './components/inventory/StockTransferPage';
import { CustomersPage } from './components/customers/CustomersPage';
import { SuppliersPage } from './components/suppliers/SuppliersPage';
import { SalesPage } from './components/sales/SalesPage';
import { PurchasesPage } from './components/purchases/PurchasesPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { RolesPage } from './components/roles/RolesPage';
import { AuditLogPage } from './components/audit/AuditLogPage';
import { ExpensesPage } from './components/expenses/ExpensesPage';
import { CashFlowPage } from './components/expenses/CashFlowPage';
import { ExpenseArchivePage } from './components/expenses/ExpenseArchivePage';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'pos', Component: POSPage },
      { path: 'products', Component: ProductsPage },
      { path: 'transfers', Component: StockTransferPage },
      { path: 'customers', Component: CustomersPage },
      { path: 'suppliers', Component: SuppliersPage },
      { path: 'sales', Component: SalesPage },
      { path: 'purchases', Component: PurchasesPage },
      { path: 'reports', Component: ReportsPage },
      { path: 'expenses', Component: ExpensesPage },
      { path: 'cashflow', Component: CashFlowPage },
      { path: 'expense-archive', Component: ExpenseArchivePage },
      { path: 'audit', Component: AuditLogPage },
      { path: 'roles', Component: RolesPage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
]);
