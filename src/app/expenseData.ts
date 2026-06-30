export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
}

export type ExpenseStatus  = 'pending' | 'approved' | 'rejected';
export type ExpensePayment = 'cash' | 'visa' | 'transfer' | 'instapay';

export interface Expense {
  id: string;
  date: string;
  branchId: string;
  branchName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number;
  paymentMethod: ExpensePayment;
  status: ExpenseStatus;
  notes: string;
  createdBy: string;
  // Approval
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  // Rejection
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  // Cancel approval
  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  // Soft delete / archive
  isArchived: boolean;
  deletedBy?: string;
  deletedAt?: string;
  deletionReason?: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'ec1',  name: 'الإيجار',               icon: '🏢', isActive: true },
  { id: 'ec2',  name: 'الكهرباء',              icon: '⚡', isActive: true },
  { id: 'ec3',  name: 'المياه',                icon: '💧', isActive: true },
  { id: 'ec4',  name: 'الإنترنت',              icon: '🌐', isActive: true },
  { id: 'ec5',  name: 'المرتبات',              icon: '👥', isActive: true },
  { id: 'ec6',  name: 'الصيانة',               icon: '🔧', isActive: true },
  { id: 'ec7',  name: 'النقل',                 icon: '🚗', isActive: true },
  { id: 'ec8',  name: 'الضيافة',               icon: '☕', isActive: true },
  { id: 'ec9',  name: 'المصروفات الإدارية',    icon: '📋', isActive: true },
  { id: 'ec10', name: 'مصروفات التسويق',       icon: '📣', isActive: true },
  { id: 'ec11', name: 'مصروفات تشغيلية',       icon: '⚙️', isActive: true },
  { id: 'ec12', name: 'مصروفات أخرى',          icon: '📦', isActive: true },
];

export const EXPENSES: Expense[] = [
  {
    id: 'EXP-2026-001', date: '2026-06-01', branchId: 'b1', branchName: 'الفرع الرئيسي',
    categoryId: 'ec1', categoryName: 'الإيجار', description: 'إيجار يونيو 2026',
    amount: 25000, paymentMethod: 'transfer', status: 'approved', notes: '', createdBy: 'أحمد الإداري',
    approvedBy: 'أحمد الإداري', approvedAt: '2026-06-01 09:00', approvalNotes: '', isArchived: false,
  },
  {
    id: 'EXP-2026-002', date: '2026-06-01', branchId: 'b2', branchName: 'فرع المعادي',
    categoryId: 'ec1', categoryName: 'الإيجار', description: 'إيجار فرع المعادي يونيو',
    amount: 18000, paymentMethod: 'transfer', status: 'approved', notes: '', createdBy: 'سارة المديرة',
    approvedBy: 'أحمد الإداري', approvedAt: '2026-06-01 09:30', isArchived: false,
  },
  {
    id: 'EXP-2026-003', date: '2026-06-01', branchId: 'b3', branchName: 'فرع مدينة نصر',
    categoryId: 'ec1', categoryName: 'الإيجار', description: 'إيجار فرع مدينة نصر يونيو',
    amount: 15000, paymentMethod: 'transfer', status: 'approved', notes: '', createdBy: 'أحمد الإداري',
    approvedBy: 'أحمد الإداري', approvedAt: '2026-06-01 10:00', isArchived: false,
  },
  {
    id: 'EXP-2026-004', date: '2026-06-05', branchId: 'b1', branchName: 'الفرع الرئيسي',
    categoryId: 'ec5', categoryName: 'المرتبات', description: 'مرتبات موظفي الفرع الرئيسي',
    amount: 45000, paymentMethod: 'transfer', status: 'approved', notes: 'مرتبات يونيو', createdBy: 'أحمد الإداري',
    approvedBy: 'أحمد الإداري', approvedAt: '2026-06-05 08:00', isArchived: false,
  },
  {
    id: 'EXP-2026-005', date: '2026-06-05', branchId: 'b2', branchName: 'فرع المعادي',
    categoryId: 'ec5', categoryName: 'المرتبات', description: 'مرتبات موظفي فرع المعادي',
    amount: 28000, paymentMethod: 'transfer', status: 'approved', notes: 'مرتبات يونيو', createdBy: 'سارة المديرة',
    approvedBy: 'أحمد الإداري', approvedAt: '2026-06-05 08:30', isArchived: false,
  },
  {
    id: 'EXP-2026-006', date: '2026-06-07', branchId: 'b1', branchName: 'الفرع الرئيسي',
    categoryId: 'ec2', categoryName: 'الكهرباء', description: 'فاتورة الكهرباء مايو',
    amount: 3800, paymentMethod: 'cash', status: 'approved', notes: '', createdBy: 'محمد الكاشير',
    approvedBy: 'أحمد الإداري', approvedAt: '2026-06-07 11:00', isArchived: false,
  },
  {
    id: 'EXP-2026-007', date: '2026-06-07', branchId: 'b2', branchName: 'فرع المعادي',
    categoryId: 'ec2', categoryName: 'الكهرباء', description: 'فاتورة الكهرباء مايو',
    amount: 2200, paymentMethod: 'cash', status: 'approved', notes: '', createdBy: 'سارة المديرة',
    approvedBy: 'سارة المديرة', approvedAt: '2026-06-07 11:30', isArchived: false,
  },
  {
    id: 'EXP-2026-008', date: '2026-06-08', branchId: 'b1', branchName: 'الفرع الرئيسي',
    categoryId: 'ec4', categoryName: 'الإنترنت', description: 'اشتراك الإنترنت الشهري',
    amount: 850, paymentMethod: 'visa', status: 'approved', notes: '', createdBy: 'أحمد الإداري',
    approvedBy: 'أحمد الإداري', approvedAt: '2026-06-08 09:00', isArchived: false,
  },
  {
    id: 'EXP-2026-009', date: '2026-06-10', branchId: 'b1', branchName: 'الفرع الرئيسي',
    categoryId: 'ec6', categoryName: 'الصيانة', description: 'صيانة أجهزة التكييف',
    amount: 2500, paymentMethod: 'cash', status: 'pending', notes: 'صيانة دورية', createdBy: 'عمر المخزن',
    isArchived: false,
  },
  {
    id: 'EXP-2026-010', date: '2026-06-12', branchId: 'b3', branchName: 'فرع مدينة نصر',
    categoryId: 'ec10', categoryName: 'مصروفات التسويق', description: 'حملة إعلانية سوشيال ميديا',
    amount: 3500, paymentMethod: 'visa', status: 'approved', notes: 'حملة رمضان', createdBy: 'فاطمة المبيعات',
    approvedBy: 'أحمد الإداري', approvedAt: '2026-06-12 14:00', isArchived: false,
  },
  {
    id: 'EXP-2026-011', date: '2026-06-13', branchId: 'b1', branchName: 'الفرع الرئيسي',
    categoryId: 'ec7', categoryName: 'النقل', description: 'مصاريف التوصيل والشحن',
    amount: 680, paymentMethod: 'cash', status: 'pending', notes: '', createdBy: 'محمد الكاشير',
    isArchived: false,
  },
  {
    id: 'EXP-2026-012', date: '2026-06-14', branchId: 'b2', branchName: 'فرع المعادي',
    categoryId: 'ec8', categoryName: 'الضيافة', description: 'ضيافة اجتماع العملاء',
    amount: 450, paymentMethod: 'cash', status: 'rejected', notes: '', createdBy: 'سارة المديرة',
    rejectedBy: 'أحمد الإداري', rejectedAt: '2026-06-14 16:00', rejectionReason: 'المبلغ غير مبرر وتجاوز الحد المسموح', isArchived: false,
  },
  {
    id: 'EXP-2026-013', date: '2026-06-15', branchId: 'b1', branchName: 'الفرع الرئيسي',
    categoryId: 'ec9', categoryName: 'المصروفات الإدارية', description: 'قرطاسية ومستلزمات مكتبية',
    amount: 1200, paymentMethod: 'cash', status: 'approved', notes: '', createdBy: 'أحمد الإداري',
    approvedBy: 'أحمد الإداري', approvedAt: '2026-06-15 10:00', isArchived: false,
  },
  {
    id: 'EXP-2026-014', date: '2026-06-16', branchId: 'b1', branchName: 'الفرع الرئيسي',
    categoryId: 'ec6', categoryName: 'الصيانة', description: 'صيانة سيرفر الشبكة',
    amount: 7500, paymentMethod: 'transfer', status: 'pending', notes: 'انتظار موافقة المدير', createdBy: 'عمر المخزن',
    isArchived: false,
  },
  {
    id: 'EXP-2026-015', date: '2026-06-17', branchId: 'b3', branchName: 'فرع مدينة نصر',
    categoryId: 'ec11', categoryName: 'مصروفات تشغيلية', description: 'احتياجات تشغيلية متنوعة',
    amount: 960, paymentMethod: 'cash', status: 'pending', notes: '', createdBy: 'فاطمة المبيعات',
    isArchived: false,
  },
  {
    id: 'EXP-2026-016', date: '2026-06-17', branchId: 'b2', branchName: 'فرع المعادي',
    categoryId: 'ec7', categoryName: 'النقل', description: 'مصاريف نقل بضاعة',
    amount: 380, paymentMethod: 'cash', status: 'pending', notes: '', createdBy: 'سارة المديرة',
    isArchived: false,
  },
  {
    id: 'EXP-2026-017', date: '2026-06-18', branchId: 'b1', branchName: 'الفرع الرئيسي',
    categoryId: 'ec2', categoryName: 'الكهرباء', description: 'دفعة تسوية فاتورة كهرباء',
    amount: 1200, paymentMethod: 'cash', status: 'pending', notes: '', createdBy: 'أحمد الإداري',
    isArchived: false,
  },
  {
    id: 'EXP-2026-018', date: '2026-06-18', branchId: 'b1', branchName: 'الفرع الرئيسي',
    categoryId: 'ec8', categoryName: 'الضيافة', description: 'مصروف ضيافة يومي',
    amount: 120, paymentMethod: 'cash', status: 'pending', notes: '', createdBy: 'محمد الكاشير',
    isArchived: false,
  },
  {
    id: 'EXP-2026-019', date: '2026-06-18', branchId: 'b2', branchName: 'فرع المعادي',
    categoryId: 'ec12', categoryName: 'مصروفات أخرى', description: 'مصروفات طارئة',
    amount: 350, paymentMethod: 'cash', status: 'pending', notes: 'قيد المراجعة', createdBy: 'سارة المديرة',
    isArchived: false,
  },
  {
    id: 'EXP-2026-020', date: '2026-06-18', branchId: 'b3', branchName: 'فرع مدينة نصر',
    categoryId: 'ec7', categoryName: 'النقل', description: 'توصيل طلبيات عملاء',
    amount: 280, paymentMethod: 'instapay', status: 'pending', notes: '', createdBy: 'فاطمة المبيعات',
    isArchived: false,
  },
];

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  pending:  'قيد الانتظار',
  approved: 'معتمد',
  rejected: 'مرفوض',
};

export const EXPENSE_STATUS_COLORS: Record<ExpenseStatus, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

export const EXPENSE_PAYMENT_LABELS: Record<ExpensePayment, string> = {
  cash:     'نقدي',
  visa:     'فيزا',
  transfer: 'تحويل بنكي',
  instapay: 'إنستاباي',
};

export const MONTHLY_EXPENSE_TREND = [
  { month: 'يناير', amount: 98000 },
  { month: 'فبراير', amount: 102000 },
  { month: 'مارس',  amount: 95000 },
  { month: 'أبريل', amount: 108000 },
  { month: 'مايو',  amount: 112000 },
  { month: 'يونيو', amount: 118000 },
];

export function getTodayExpenses(expenses: Expense[], branchId?: string) {
  const today = '2026-06-18';
  return expenses.filter(e =>
    e.date === today && e.status === 'approved' && !e.isArchived &&
    (!branchId || e.branchId === branchId)
  );
}

export function getMonthExpenses(expenses: Expense[], branchId?: string) {
  return expenses.filter(e =>
    e.date.startsWith('2026-06') && e.status === 'approved' && !e.isArchived &&
    (!branchId || e.branchId === branchId)
  );
}

export const expenseTotal = (list: Expense[]) =>
  list.reduce((s, e) => s + e.amount, 0);

export function getCategoryBreakdown(expenses: Expense[]) {
  const map: Record<string, number> = {};
  for (const e of expenses) {
    if (e.status === 'approved' && !e.isArchived) {
      map[e.categoryName] = (map[e.categoryName] ?? 0) + e.amount;
    }
  }
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getBranchBreakdown(expenses: Expense[]) {
  const map: Record<string, number> = {};
  for (const e of expenses) {
    if (e.status === 'approved' && !e.isArchived) {
      map[e.branchName] = (map[e.branchName] ?? 0) + e.amount;
    }
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function nowDatetime() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(amount);
