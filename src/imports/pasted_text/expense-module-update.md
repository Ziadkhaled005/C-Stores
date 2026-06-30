IMPORTANT UPDATE REQUEST

Apply the following modifications to the existing ERP/POS system while preserving all current functionality, Arabic language support (RTL), branch management, permissions system, and current UI design.

=================================================
EXPENSE MANAGEMENT MODULE
=========================

Create a complete module called:

"إدارة المصروفات"

This module will allow the company to track all operational expenses and calculate the actual daily net cash after deducting expenses.

All interfaces must be in Arabic.

=================================================
EXPENSE CATEGORIES
==================

Create default categories:

* الإيجار
* الكهرباء
* المياه
* الإنترنت
* المرتبات
* الصيانة
* النقل
* الضيافة
* المصروفات الإدارية
* مصروفات التسويق
* مصروفات تشغيلية
* مصروفات أخرى

Administrator can:

* Add new categories
* Edit categories
* Delete categories
* Disable categories

=================================================
EXPENSES MANAGEMENT
===================

Create screen:

"تسجيل المصروفات"

Fields:

* رقم العملية
* التاريخ
* الفرع
* نوع المصروف
* الوصف
* المبلغ
* طريقة الدفع
* المرفقات (اختياري)
* ملاحظات

Payment Methods:

* نقدي
* Visa
* تحويل بنكي
* Instapay

Actions:

* إضافة مصروف
* تعديل مصروف
* حذف مصروف
* طباعة المصروف
* عرض التفاصيل

=================================================
BRANCH INTEGRATION
==================

Expenses must support Multi-Branch architecture.

Each expense belongs to a specific branch.

Users can only see expenses of branches they have permission to access.

Examples:

Cashier Branch 1
→ Can only see Branch 1 expenses

Manager Branch 1 & 2
→ Can only see Branch 1 and 2 expenses

System Administrator
→ Can see all branches

=================================================
DAILY CASH FLOW
===============

Create a dedicated section:

"الخزنة اليومية"

Show:

* إجمالي المبيعات اليومية
* إجمالي المصروفات اليومية
* إجمالي المرتجعات
* صافي الإيراد اليومي
* صافي النقدية الحالية

Formula:

صافي الإيراد اليومي =
إجمالي المبيعات

* المصروفات
* المرتجعات

Display values clearly in EGP.

=================================================
FINANCIAL SUMMARY DASHBOARD
===========================

Add new dashboard cards:

* مصروفات اليوم
* مصروفات الشهر
* إجمالي المصروفات
* صافي أرباح اليوم
* صافي أرباح الشهر
* أعلى أنواع المصروفات

Add charts:

* المصروفات حسب الفئة
* المصروفات حسب الفرع
* المصروفات الشهرية
* مقارنة الإيرادات والمصروفات

=================================================
EXPENSE REPORTS
===============

Create reports:

1. تقرير المصروفات اليومي
2. تقرير المصروفات الشهري
3. تقرير المصروفات حسب الفرع
4. تقرير المصروفات حسب الفئة
5. تقرير التدفق النقدي
6. تقرير الأرباح والخسائر المبسط

Filters:

* تاريخ البداية
* تاريخ النهاية
* الفرع
* الفئة
* طريقة الدفع

Export:

* PDF
* Excel

=================================================
PROFIT & LOSS REPORT
====================

Create:

"تقرير الأرباح والخسائر"

Display:

## إجمالي المبيعات

## إجمالي المرتجعات

# إجمالي المصروفات

صافي الربح

Show:

* يومي
* أسبوعي
* شهري
* سنوي
* فترة مخصصة

=================================================
EXPENSE APPROVAL WORKFLOW
=========================

Optional approval workflow:

Statuses:

* مسودة
* بانتظار الموافقة
* معتمد
* مرفوض

Admin can define:

Expenses above a specific amount require approval.

Example:

Expenses under 5,000 EGP
→ Auto Approved

Expenses above 5,000 EGP
→ Manager Approval Required

=================================================
PERMISSIONS
===========

Add permissions for Expense Module:

* عرض المصروفات
* إضافة مصروف
* تعديل مصروف
* حذف مصروف
* اعتماد مصروف
* طباعة المصروفات
* تصدير التقارير المالية

Integrate these permissions into the existing Role & Permission Matrix.

=================================================
DATABASE UPDATE
===============

Add new tables:

ExpenseCategories
Expenses
ExpenseAttachments
CashRegisters
CashTransactions
ExpenseApprovals

=================================================
UI/UX REQUIREMENTS
==================

Maintain the existing modern design.

Requirements:

* Arabic RTL
* Responsive
* Clean Tables
* Financial Cards
* Professional Charts
* Fast Data Entry
* Easy Navigation

The module should feel simple and easy for store employees while still providing complete visibility of expenses and daily cash flow.

=================================================
FINAL DELIVERABLES
==================

Generate:

1. Updated Database Schema
2. Updated API Structure
3. Expense Module UI
4. Cash Flow Dashboard
5. Profit & Loss Reports
6. Branch-Aware Expense Management
7. Updated Permissions
8. Production-Ready React Components
9. Printable Expense Voucher Template

All labels, buttons, forms, reports, dashboards, and generated screens must be in Arabic.
