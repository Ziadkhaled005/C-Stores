import { PRODUCTS } from './data';

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

export interface BranchStock {
  branchId: string;
  productId: string;
  quantity: number;
}

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
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedBy: string;
  date: string;
}

export const BRANCHES: Branch[] = [
  { id: 'b1', name: 'الفرع الرئيسي', code: 'HQ', address: '١٢ شارع الأهرام، الجيزة', phone: '0223456789', manager: 'أحمد الإداري', isActive: true, isMain: true },
  { id: 'b2', name: 'فرع المعادي', code: 'MAD', address: '٥ شارع النصر، المعادي، القاهرة', phone: '0227654321', manager: 'سارة المديرة', isActive: true, isMain: false },
  { id: 'b3', name: 'فرع مدينة نصر', code: 'NSR', address: '٨ شارع عباس العقاد، مدينة نصر', phone: '0225678901', manager: 'محمد عبد الرحمن', isActive: true, isMain: false },
  { id: 'b4', name: 'فرع الجيزة', code: 'GIZ', address: '٣ شارع التحرير، الدقي، الجيزة', phone: '0223456701', manager: 'فاطمة حسن', isActive: true, isMain: false },
  { id: 'b5', name: 'فرع الإسكندرية', code: 'ALX', address: '٢٢ شارع الكورنيش، الإسكندرية', phone: '0345678901', manager: 'عمر خالد', isActive: false, isMain: false },
];

// Branch inventory: each product has stock per branch
const BASE_STOCKS: Record<string, number[]> = {
  p1:  [8,  5,  3,  6,  2],
  p2:  [5,  4,  2,  3,  1],
  p3:  [10, 8,  5,  7,  3],
  p4:  [2,  1,  0,  1,  0],
  p5:  [4,  3,  2,  2,  1],
  p6:  [15, 10, 8,  12, 5],
  p7:  [6,  4,  3,  5,  2],
  p8:  [7,  5,  4,  6,  2],
  p9:  [9,  6,  5,  7,  3],
  p10: [25, 18, 15, 20, 8],
  p11: [30, 22, 18, 25, 10],
  p12: [20, 15, 12, 18, 7],
  p13: [12, 8,  6,  10, 4],
  p14: [1,  0,  0,  1,  0],
  p15: [18, 12, 10, 15, 6],
  p16: [45, 30, 25, 35, 15],
  p17: [10, 7,  5,  8,  3],
  p18: [3,  2,  1,  2,  1],
  p19: [22, 15, 12, 18, 8],
  p20: [3,  2,  1,  2,  0],
};

export const BRANCH_STOCKS: BranchStock[] = BRANCHES.flatMap((branch, bIdx) =>
  Object.entries(BASE_STOCKS).map(([productId, qtys]) => ({
    branchId: branch.id,
    productId,
    quantity: qtys[bIdx] ?? 0,
  }))
);

export const getBranchStock = (branchId: string, productId: string, stocks: BranchStock[]) =>
  stocks.find(s => s.branchId === branchId && s.productId === productId)?.quantity ?? 0;

export const STOCK_TRANSFERS: StockTransfer[] = [
  {
    id: 'TR-2026-001', fromBranchId: 'b1', fromBranchName: 'الفرع الرئيسي', toBranchId: 'b2', toBranchName: 'فرع المعادي',
    productId: 'p1', productName: 'لابتوب Dell Inspiron 15', quantity: 3, notes: 'طلب طارئ للفرع',
    status: 'completed', requestedBy: 'سارة المديرة', date: '2026-06-15',
  },
  {
    id: 'TR-2026-002', fromBranchId: 'b1', fromBranchName: 'الفرع الرئيسي', toBranchId: 'b3', toBranchName: 'فرع مدينة نصر',
    productId: 'p6', productName: 'شاشة Dell 24 بوصة', quantity: 5, notes: 'تغطية نقص المخزون',
    status: 'approved', requestedBy: 'محمد عبد الرحمن', date: '2026-06-17',
  },
  {
    id: 'TR-2026-003', fromBranchId: 'b2', fromBranchName: 'فرع المعادي', toBranchId: 'b4', toBranchName: 'فرع الجيزة',
    productId: 'p10', productName: 'كيبورد لاسلكي Logitech K380', quantity: 10, notes: '',
    status: 'pending', requestedBy: 'فاطمة حسن', date: '2026-06-18',
  },
  {
    id: 'TR-2026-004', fromBranchId: 'b1', fromBranchName: 'الفرع الرئيسي', toBranchId: 'b2', toBranchName: 'فرع المعادي',
    productId: 'p3', productName: 'لابتوب Lenovo IdeaPad 3', quantity: 2, notes: 'تحويل روتيني',
    status: 'rejected', requestedBy: 'سارة المديرة', date: '2026-06-14',
  },
];

export const TRANSFER_STATUS_LABELS: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'موافق عليه',
  rejected: 'مرفوض',
  completed: 'مكتمل',
};

export const TRANSFER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-600',
  completed: 'bg-green-100 text-green-700',
};
