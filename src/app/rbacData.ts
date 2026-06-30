export type Module =
  | 'dashboard' | 'pos' | 'sales' | 'purchases' | 'inventory'
  | 'customers' | 'suppliers' | 'reports' | 'settings' | 'users'
  | 'branches' | 'roles' | 'expenses';

export type Permission = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'print';

export type PermissionMap = Record<Module, Record<Permission, boolean>>;

export interface AppRole {
  id: string;
  name: string;
  description: string;
  color: string;
  isSystem: boolean;
  isActive: boolean;
  userCount: number;
  permissions: PermissionMap;
}

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  date: string;
  time: string;
  branchName: string;
}

export const MODULE_LABELS: Record<Module, string> = {
  dashboard: 'لوحة التحكم',
  pos: 'نقطة البيع',
  sales: 'المبيعات',
  purchases: 'المشتريات',
  inventory: 'المخزون',
  customers: 'العملاء',
  suppliers: 'الموردون',
  expenses: 'المصروفات',
  reports: 'التقارير',
  settings: 'الإعدادات',
  users: 'المستخدمون',
  branches: 'الفروع',
  roles: 'الأدوار والصلاحيات',
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  view: 'عرض',
  create: 'إنشاء',
  edit: 'تعديل',
  delete: 'حذف',
  approve: 'موافقة',
  export: 'تصدير',
  print: 'طباعة',
};

export const ALL_MODULES: Module[] = [
  'dashboard', 'pos', 'sales', 'purchases', 'inventory',
  'customers', 'suppliers', 'expenses', 'reports', 'settings', 'users', 'branches', 'roles',
];

export const ALL_PERMISSIONS: Permission[] = [
  'view', 'create', 'edit', 'delete', 'approve', 'export', 'print',
];

const fullAccess = (): Record<Permission, boolean> =>
  ({ view: true, create: true, edit: true, delete: true, approve: true, export: true, print: true });

const viewOnly = (): Record<Permission, boolean> =>
  ({ view: true, create: false, edit: false, delete: false, approve: false, export: false, print: false });

const noAccess = (): Record<Permission, boolean> =>
  ({ view: false, create: false, edit: false, delete: false, approve: false, export: false, print: false });

export const buildMatrix = (overrides: Partial<Record<Module, Partial<Record<Permission, boolean>>>>) => {
  const matrix = {} as PermissionMap;
  for (const mod of ALL_MODULES) {
    matrix[mod] = { ...noAccess(), ...(overrides[mod] ?? {}) };
  }
  return matrix;
};

export const DEFAULT_ROLES: AppRole[] = [
  {
    id: 'r1', name: 'مدير النظام', description: 'صلاحيات كاملة على جميع أجزاء النظام', color: '#7C3AED',
    isSystem: true, isActive: true, userCount: 1,
    permissions: buildMatrix({
      dashboard: fullAccess(), pos: fullAccess(), sales: fullAccess(), purchases: fullAccess(),
      inventory: fullAccess(), customers: fullAccess(), suppliers: fullAccess(), reports: fullAccess(),
      settings: fullAccess(), users: fullAccess(), branches: fullAccess(), roles: fullAccess(),
    }),
  },
  {
    id: 'r2', name: 'مدير', description: 'صلاحيات واسعة بدون إدارة النظام والأدوار', color: '#06B6D4',
    isSystem: true, isActive: true, userCount: 1,
    permissions: buildMatrix({
      dashboard: fullAccess(), pos: fullAccess(), sales: fullAccess(), purchases: fullAccess(),
      inventory: fullAccess(), customers: fullAccess(), suppliers: fullAccess(), reports: fullAccess(),
      settings: { view: true, create: false, edit: true, delete: false, approve: false, export: false, print: false },
      users: { view: true, create: true, edit: true, delete: false, approve: false, export: false, print: false },
      branches: viewOnly(), roles: viewOnly(),
    }),
  },
  {
    id: 'r3', name: 'كاشير', description: 'نقطة البيع والفواتير فقط', color: '#10B981',
    isSystem: true, isActive: true, userCount: 1,
    permissions: buildMatrix({
      dashboard: viewOnly(),
      pos: { view: true, create: true, edit: false, delete: false, approve: false, export: false, print: true },
      sales: { view: true, create: false, edit: false, delete: false, approve: false, export: false, print: true },
      customers: viewOnly(),
    }),
  },
  {
    id: 'r4', name: 'مندوب مبيعات', description: 'المبيعات والعملاء وعروض الأسعار', color: '#F97316',
    isSystem: true, isActive: true, userCount: 1,
    permissions: buildMatrix({
      dashboard: viewOnly(),
      pos: { view: true, create: true, edit: true, delete: false, approve: false, export: false, print: true },
      sales: { view: true, create: true, edit: true, delete: false, approve: false, export: true, print: true },
      customers: { view: true, create: true, edit: true, delete: false, approve: false, export: false, print: false },
    }),
  },
  {
    id: 'r5', name: 'موظف مخزن', description: 'إدارة المخزون والمنتجات فقط', color: '#EC4899',
    isSystem: true, isActive: true, userCount: 1,
    permissions: buildMatrix({
      dashboard: viewOnly(),
      inventory: { view: true, create: true, edit: true, delete: false, approve: true, export: true, print: false },
      purchases: { view: true, create: true, edit: true, delete: false, approve: false, export: false, print: true },
      suppliers: viewOnly(),
    }),
  },
];

export const AUDIT_LOG: AuditEntry[] = [
  { id: 'a1', userId: '1', userName: 'أحمد الإداري', action: 'تسجيل دخول', module: 'النظام', details: 'تسجيل دخول ناجح', ipAddress: '192.168.1.10', date: '2026-06-18', time: '09:02', branchName: 'الفرع الرئيسي' },
  { id: 'a2', userId: '1', userName: 'أحمد الإداري', action: 'إنشاء مستخدم', module: 'المستخدمون', details: 'تم إنشاء مستخدم جديد: فاطمة المبيعات', ipAddress: '192.168.1.10', date: '2026-06-18', time: '09:15', branchName: 'الفرع الرئيسي' },
  { id: 'a3', userId: '3', userName: 'محمد الكاشير', action: 'إنشاء فاتورة', module: 'المبيعات', details: 'فاتورة INV-2026-018 بقيمة ٥٦,٩٩٥ جنيه', ipAddress: '192.168.1.25', date: '2026-06-18', time: '10:30', branchName: 'الفرع الرئيسي' },
  { id: 'a4', userId: '5', userName: 'عمر المخزن', action: 'تعديل مخزون', module: 'المخزون', details: 'تعديل كمية لابتوب Dell Inspiron: +5 وحدات', ipAddress: '192.168.1.32', date: '2026-06-18', time: '11:00', branchName: 'الفرع الرئيسي' },
  { id: 'a5', userId: '2', userName: 'سارة المديرة', action: 'تسجيل دخول', module: 'النظام', details: 'تسجيل دخول ناجح', ipAddress: '10.0.0.5', date: '2026-06-18', time: '08:45', branchName: 'فرع المعادي' },
  { id: 'a6', userId: '2', userName: 'سارة المديرة', action: 'طلب تحويل مخزون', module: 'المخزون', details: 'تحويل ٢ وحدة Lenovo IdeaPad من المعادي إلى الجيزة', ipAddress: '10.0.0.5', date: '2026-06-18', time: '11:30', branchName: 'فرع المعادي' },
  { id: 'a7', userId: '1', userName: 'أحمد الإداري', action: 'تعديل دور', module: 'الأدوار', details: 'تعديل صلاحيات دور "مندوب مبيعات": إضافة صلاحية تصدير التقارير', ipAddress: '192.168.1.10', date: '2026-06-17', time: '14:20', branchName: 'الفرع الرئيسي' },
  { id: 'a8', userId: '4', userName: 'فاطمة المبيعات', action: 'إنشاء عرض سعر', module: 'المبيعات', details: 'عرض سعر QT-2026-003 للعميل: نور الدين شريف', ipAddress: '10.0.0.8', date: '2026-06-17', time: '13:00', branchName: 'فرع المعادي' },
  { id: 'a9', userId: '3', userName: 'محمد الكاشير', action: 'طباعة فاتورة', module: 'المبيعات', details: 'طباعة الفاتورة INV-2026-016', ipAddress: '192.168.1.25', date: '2026-06-17', time: '15:45', branchName: 'الفرع الرئيسي' },
  { id: 'a10', userId: '1', userName: 'أحمد الإداري', action: 'إضافة فرع', module: 'الفروع', details: 'تم تفعيل فرع الإسكندرية', ipAddress: '192.168.1.10', date: '2026-06-16', time: '09:30', branchName: 'الفرع الرئيسي' },
  { id: 'a11', userId: '5', userName: 'عمر المخزن', action: 'موافقة تحويل', module: 'المخزون', details: 'موافقة على تحويل TR-2026-002: ٥ شاشات Dell 24 إلى فرع مدينة نصر', ipAddress: '192.168.1.32', date: '2026-06-17', time: '10:00', branchName: 'الفرع الرئيسي' },
  { id: 'a12', userId: '2', userName: 'سارة المديرة', action: 'تسجيل خروج', module: 'النظام', details: 'تسجيل خروج', ipAddress: '10.0.0.5', date: '2026-06-18', time: '17:00', branchName: 'فرع المعادي' },
];
