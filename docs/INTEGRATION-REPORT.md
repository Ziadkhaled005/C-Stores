# C Store — تقرير التكامل Frontend vs Backend

> **تاريخ التقرير:** 10 يوليو 2026
> **Base URL:** `https://sports.runasp.net/api`

---

## ملخص سريع

| الحالة | العدد |
|---|---|
| ✅ متكامل بالكامل | 3 صفحات |
| ⚠️ متكامل جزئياً | 2 صفحات |
| ❌ بيانات وهمية فقط | 11 صفحة |
| 🔌 دوال API جاهزة غير مربوطة بالصفحات | 3 دوال |

---

## حالة التكامل لكل صفحة

### ✅ متكامل بالكامل (3 صفحات)

| الصفحة | الـ API المستخدم |
|---|---|
| Login — تسجيل الدخول | `POST /auth/login` |
| Auth getMe — بيانات المستخدم | `GET /auth/me` |
| ProductsPage — المنتجات | `GET /products` |

---

### ⚠️ متكامل جزئياً (2 صفحات)

| الصفحة | الـ API | المشكلة |
|---|---|---|
| Dashboard — لوحة التحكم | `GET /dashboard/stats` | لا يزال يستخدم `REVENUE_DATA` و `EXPENSES` و `BRANCH_STOCKS` من الملفات الوهمية |
| BranchStore — تحميل الفروع | `GET /branches` | عند فشل الـ API يرجع للبيانات الوهمية من `branchData.ts` |

---

### ❌ بيانات وهمية فقط — بدون أي API (11 صفحة)

#### 🔴 أولوية عالية

| الصفحة | المصدر الوهمي | الـ API المتاح في الباك اند |
|---|---|---|
| **SalesPage** — المبيعات | `SALES`, `CUSTOMERS`, `PRODUCTS` من `data.ts` | `GET /sales` · `GET /sales/stats` · `POST /sales` · `PUT /sales/{id}/status` |
| **PurchasesPage** — المشتريات | `PURCHASES`, `SUPPLIERS`, `PRODUCTS` من `data.ts` | `GET /purchases` · `GET /purchases/stats` · `POST /purchases` · `PUT /purchases/{id}/status` |
| **CustomersPage** — العملاء | `CUSTOMERS`, `SALES` من `data.ts` | `GET /customers` · `GET /customers/stats` · `POST /customers` · `PUT /customers/{id}` · `DELETE /customers/{id}` |
| **SuppliersPage** — الموردون | `SUPPLIERS` من `data.ts` | `GET /suppliers` · `GET /suppliers/stats` · `POST /suppliers` · `PUT /suppliers/{id}` · `DELETE /suppliers/{id}` |
| **POSPage** — نقطة البيع | `PRODUCTS`, `CUSTOMERS`, `CATEGORIES` من `data.ts` | `GET /products` · `GET /customers` · `POST /pos/checkout` |
| **ExpensesPage** — المصروفات | `EXPENSES`, `EXPENSE_CATEGORIES` من `expenseData.ts` | `GET /expenses` · `GET /expense-categories` · `POST /expenses` · `PUT /expenses/{id}/approve` · `PUT /expenses/{id}/reject` · `PUT /expenses/{id}/archive` |

#### 🟡 أولوية متوسطة

| الصفحة | المصدر الوهمي | الـ API المتاح في الباك اند |
|---|---|---|
| **CashFlowPage** — الخزنة اليومية | `EXPENSES`, `MONTHLY_EXPENSE_TREND`, `SALES`, `REVENUE_DATA` من `expenseData.ts` + `data.ts` | `GET /cashflow?date=&branchId=` — endpoint واحد يُرجع كل البيانات |
| **StockTransferPage** — تحويل المخزون | `STOCK_TRANSFERS`, `BRANCH_STOCKS`, `BRANCHES` من `branchData.ts` | `GET /stocktransfers` · `POST /stocktransfers` · `PUT /stocktransfers/{id}/approve` · `PUT /stocktransfers/{id}/complete` |
| **SettingsPage** — الإعدادات | `USERS`, `ROLE_LABELS` من `data.ts` · `BRANCHES` من `branchData.ts` | `GET /users` · `POST /users` · `PUT /users/{id}` · `DELETE /users/{id}` · `GET /branches` · `GET /settings/company` · `GET /settings/tax` |
| **RolesPage** — الأدوار والصلاحيات | `DEFAULT_ROLES` من `rbacData.ts` | `GET /roles` · `POST /roles` · `PUT /roles/{id}/permissions` · `PATCH /roles/{id}/toggle-active` |
| **ExpenseArchivePage** — أرشيف المصروفات | `EXPENSES` (يفلتر isArchived يدوياً) من `expenseData.ts` | `GET /expenses/archived` · `PUT /expenses/{id}/restore` |

#### 🟢 أولوية منخفضة

| الصفحة | المصدر الوهمي | الـ API المتاح في الباك اند |
|---|---|---|
| **AuditLogPage** — سجل التدقيق | `AUDIT_LOG` من `rbacData.ts` | `GET /audit-log?userId=&module=&branchId=&dateFrom=&dateTo=` |
| **ReportsPage** — التقارير | `SALES`, `PRODUCTS`, `CUSTOMERS`, `REVENUE_DATA`, `EXPENSES` | `GET /reports/sales` · `GET /reports/products` · `GET /reports/customers` · `GET /reports/profit` · `GET /reports/expenses` |

---

## ملفات البيانات الوهمية

| الملف | المتغيرات المُصدَّرة | الصفحات التي تستخدمه |
|---|---|---|
| `src/app/data.ts` | `USERS` · `PRODUCTS` · `CUSTOMERS` · `SUPPLIERS` · `SALES` · `PURCHASES` · `REVENUE_DATA` · `CATEGORIES` · `BRANDS` | Dashboard · SalesPage · PurchasesPage · CustomersPage · SuppliersPage · POSPage · ReportsPage · SettingsPage |
| `src/app/expenseData.ts` | `EXPENSE_CATEGORIES` · `EXPENSES` · `MONTHLY_EXPENSE_TREND` | ExpensesPage · CashFlowPage · ExpenseArchivePage · ReportsPage · Dashboard |
| `src/app/branchData.ts` | `BRANCHES` · `BRANCH_STOCKS` · `STOCK_TRANSFERS` | StockTransferPage · CashFlowPage · ExpensesPage · AuditLogPage · SettingsPage |
| `src/app/rbacData.ts` | `DEFAULT_ROLES` · `AUDIT_LOG` · `MODULE_LABELS` · `ALL_MODULES` | RolesPage · AuditLogPage |

---

## دوال API موجودة في `api.ts` لكن غير مربوطة

هذه الدوال مكتوبة بالفعل في `src/app/api.ts` لكن الصفحات لا تستخدمها:

| الدالة | الـ Endpoint | الصفحة المفروض تُربط بها |
|---|---|---|
| `getCustomers()` | `GET /customers` | CustomersPage — لا تزال تستخدم `CUSTOMERS` من `data.ts` |
| `getSuppliers()` | `GET /suppliers` | SuppliersPage — لا تزال تستخدم `SUPPLIERS` من `data.ts` |
| `getSales()` | `GET /sales` | SalesPage — لا تزال تستخدم `SALES` من `data.ts` |

---

## خارطة طريق التكامل

### 🔴 المرحلة الأولى — الصفحات التجارية الأساسية
1. **SalesPage** ← ربط `getSales()` + إنشاء وتحديث الفواتير
2. **POSPage** ← ربط المنتجات والعملاء + `POST /pos/checkout`
3. **CustomersPage** ← ربط `getCustomers()` + CRUD كامل
4. **SuppliersPage** ← ربط `getSuppliers()` + CRUD كامل
5. **PurchasesPage** ← ربط `GET /purchases` + إنشاء وتغيير الحالة
6. **ExpensesPage** ← ربط `GET /expenses` + `GET /expense-categories` + كل workflow

### 🟡 المرحلة الثانية — الإعدادات والتشغيل
7. **CashFlowPage** ← استبدال كل البيانات بـ `GET /cashflow` (endpoint واحد يكفي)
8. **StockTransferPage** ← ربط `GET /stocktransfers` + approve/complete
9. **SettingsPage** ← ربط users + settings/company + settings/tax
10. **RolesPage** ← ربط `GET /roles` + permissions
11. **ExpenseArchivePage** ← ربط `GET /expenses/archived` + restore

### 🟢 المرحلة الثالثة — التقارير والسجلات
12. **Dashboard** ← استخدام `monthlyRevenue` من API بدل `REVENUE_DATA` الوهمية
13. **AuditLogPage** ← ربط `GET /audit-log`
14. **ReportsPage** ← ربط 5 endpoints للتقارير

---

> تم إنشاء هذا التقرير بواسطة Claude Code
