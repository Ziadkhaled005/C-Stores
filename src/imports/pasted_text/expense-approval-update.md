# IMPORTANT UPDATE REQUEST

Apply the following modifications to the existing ERP/POS system **without changing the current UI/UX design, branding, colors, layout, Arabic RTL support, permissions architecture, or existing functionality.**

## IMPORTANT

**All user-facing content must remain in Arabic (RTL).**

This includes, but is not limited to:

* UI Labels
* Buttons
* Forms
* Validation Messages
* Dialogs
* Notifications
* Reports
* Dashboard Cards
* Tables
* Tooltips
* Status Labels
* Error Messages
* Success Messages
* Print Templates

The implementation should follow enterprise ERP best practices while keeping the system simple and user-friendly.

---

# Expense Approval Workflow

The current workflow automatically marks every newly created expense as:

**معتمد**

This behavior must be removed completely.

Every newly created expense must automatically start with the status:

🟡 **قيد الانتظار**

No expense should ever become approved automatically.

---

# Expense Statuses

Support exactly three statuses:

🟡 قيد الانتظار

🟢 معتمد

🔴 مرفوض

Display each status as a colored badge consistently across the entire application.

---

# Approve / Reject Actions

Users who have the permission:

**"اعتماد المصروفات"**

must be able to approve or reject expenses.

Display two action buttons:

✅ اعتماد

❌ رفض

These actions should be available:

* Inside the Expenses Table
* Inside the Expense Details Page

---

## When Approving

When the user clicks:

**اعتماد**

Update:

Status → معتمد

Store:

* Approved By
* Approval Date
* Approval Time
* Approval Notes (Optional)

Display:

"تم اعتماد المصروف بنجاح."

---

## When Rejecting

When the user clicks:

**رفض**

Update:

Status → مرفوض

The field:

"سبب الرفض"

must become mandatory.

Store:

* Rejected By
* Rejected Date
* Rejected Time
* Rejection Reason

Display:

"تم رفض المصروف."

---

# Status Filter

Update the existing Status Filter.

Available options:

* الكل
* قيد الانتظار
* معتمد
* مرفوض

---

# Dashboard Updates

Add new dashboard statistics:

* عدد المصروفات قيد الانتظار
* عدد المصروفات المعتمدة
* عدد المصروفات المرفوضة

---

# Reports

Update Expense Reports to include:

* الحالة
* اعتمد بواسطة
* تاريخ الاعتماد
* رفض بواسطة
* سبب الرفض

Allow filtering by expense status.

---

# Lock Approved Expenses

Once an expense becomes:

🟢 معتمد

it must become completely Read-Only.

Disable all editing operations including:

* Edit
* Delete
* Change Amount
* Change Category
* Change Branch
* Change Payment Method
* Change Description
* Change Date
* Modify Attachments

Display a lock icon:

🔒

next to the approved badge.

Show the following tooltip:

"تم اعتماد هذا المصروف ولا يمكن تعديله."

---

# Prevent Editing

If a user attempts to edit an approved expense, display:

"لا يمكن تعديل هذا المصروف لأنه تم اعتماده. إذا كنت ترغب في تعديله، يجب أولًا إلغاء الاعتماد بواسطة مستخدم يمتلك صلاحية الإدارة."

---

# Cancel Approval

Create a new permission:

**إلغاء اعتماد المصروفات**

Only authorized users (typically System Administrator or Financial Manager) can cancel approvals.

Show a new action:

🔄 إلغاء الاعتماد

Only users with this permission should see this action.

---

## When Cancel Approval is Clicked

Update:

Status:

معتمد

↓

قيد الانتظار

The expense becomes editable again.

Store:

* Cancelled By
* Cancelled Date
* Cancelled Time
* Cancellation Reason (Required)

Display:

"تم إلغاء اعتماد المصروف."

---

# Delete Rules

Approved expenses:

🟢 معتمد

cannot be deleted.

Display:

"لا يمكن حذف هذا المصروف لأنه تم اعتماده. يجب أولًا إلغاء الاعتماد."

Deletion is only allowed after approval has been cancelled.

---

# Soft Delete (Archive Instead of Permanent Delete)

Do NOT permanently delete expenses.

Instead, implement Soft Delete.

When Delete is clicked:

Move the expense into:

**أرشيف المصروفات**

Store:

* Deleted By
* Deleted Date
* Deletion Reason

Archived expenses must disappear from all normal screens while remaining stored in the database.

---

# Expense Archive

Create a dedicated page:

**أرشيف المصروفات**

Only users with the permission:

**إدارة أرشيف المصروفات**

can access this page.

Available actions:

* استعادة
* حذف نهائي

---

# Restore Expense

When restoring:

Move the expense back to the active expenses list.

Restore all previous data.

Display:

"تم استعادة المصروف بنجاح."

---

# Permanent Delete

Permanent deletion should only be available to users with the permission:

**حذف نهائي**

Before deleting permanently, display a confirmation dialog.

Example:

"هل أنت متأكد من حذف هذا المصروف نهائيًا؟ لا يمكن التراجع عن هذه العملية."

---

# Permissions

Extend the existing Role & Permission Management system.

Add the following permissions:

* عرض المصروفات
* إضافة مصروف
* تعديل مصروف
* حذف مصروف
* اعتماد المصروفات
* إلغاء اعتماد المصروفات
* استعادة المصروفات
* حذف نهائي
* عرض أرشيف المصروفات
* إدارة أرشيف المصروفات

Integrate them into the existing Permission Matrix.

---

# Audit Log

Record every action performed on expenses.

Track:

* Expense Created
* Expense Edited
* Expense Approved
* Expense Rejected
* Approval Cancelled
* Expense Archived
* Expense Restored
* Expense Permanently Deleted

Each log entry should include:

* User
* Branch
* Date
* Time
* Previous Status
* New Status
* Action
* Notes

---

# Database Updates

Update the Expenses table by adding:

* status
* approvedBy
* approvedAt
* approvalNotes
* rejectedBy
* rejectedAt
* rejectionReason
* cancelledBy
* cancelledAt
* cancellationReason
* deletedBy
* deletedAt
* deletionReason
* isArchived

Create additional tables if necessary:

* ExpenseAuditLogs
* ExpenseArchive

---

# UI Requirements

Keep the existing UI exactly as it is.

Do NOT redesign the interface.

Maintain:

* Arabic RTL Layout
* Responsive Design
* Existing Theme
* Existing Colors
* Existing Components
* Existing Navigation

Only implement the new business logic and workflow.

All buttons must be fully functional.

No placeholder actions.

No fake interactions.

---

# Development Standards

* Follow clean architecture principles.
* Use reusable React components.
* Keep the code scalable and maintainable.
* Respect the existing Role-Based Access Control (RBAC).
* Respect the existing Multi-Branch architecture.
* Follow enterprise ERP best practices similar to Odoo, SAP Business One, and Microsoft Dynamics while preserving the simplicity and usability of the current ERP/POS system.

**Reminder:** Although this prompt is written in English, every visible part of the application must remain **100% in Arabic (RTL)**.
