import { useState } from 'react';
import { Plus, Search, X, Check, ArrowLeftRight, Filter, Building2 } from 'lucide-react';
import {
  BRANCHES, STOCK_TRANSFERS, StockTransfer,
  TRANSFER_STATUS_LABELS, TRANSFER_STATUS_COLORS, getBranchStock, BRANCH_STOCKS
} from '../../branchData';
import { PRODUCTS, formatCurrency } from '../../data';

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50';

let transferCounter = 5;

export function StockTransferPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>(STOCK_TRANSFERS);
  const [stocks, setStocks] = useState(BRANCH_STOCKS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    fromBranchId: BRANCHES[0].id,
    toBranchId: BRANCHES[1].id,
    productId: PRODUCTS[0].id,
    quantity: 1,
    notes: '',
  });

  const filtered = transfers.filter(t => {
    if (filterStatus !== 'الكل' && TRANSFER_STATUS_LABELS[t.status] !== filterStatus) return false;
    if (search && !t.productName.includes(search) && !t.fromBranchName.includes(search) && !t.toBranchName.includes(search)) return false;
    return true;
  });

  const selectedProduct = PRODUCTS.find(p => p.id === form.productId);
  const sourceStock = getBranchStock(form.fromBranchId, form.productId, stocks);
  const fromBranch = BRANCHES.find(b => b.id === form.fromBranchId);
  const toBranch = BRANCHES.find(b => b.id === form.toBranchId);

  const handleCreate = () => {
    if (!form.productId || form.quantity <= 0 || form.fromBranchId === form.toBranchId) return;
    if (form.quantity > sourceStock) { alert('الكمية المطلوبة أكبر من المتوفر في الفرع المصدر'); return; }

    const newTransfer: StockTransfer = {
      id: `TR-2026-${String(transferCounter++).padStart(3, '0')}`,
      fromBranchId: form.fromBranchId,
      fromBranchName: fromBranch?.name ?? '',
      toBranchId: form.toBranchId,
      toBranchName: toBranch?.name ?? '',
      productId: form.productId,
      productName: selectedProduct?.name ?? '',
      quantity: form.quantity,
      notes: form.notes,
      status: 'pending',
      requestedBy: 'أحمد الإداري',
      date: new Date().toISOString().split('T')[0],
    };
    setTransfers(prev => [newTransfer, ...prev]);
    setShowCreate(false);
    setForm({ fromBranchId: BRANCHES[0].id, toBranchId: BRANCHES[1].id, productId: PRODUCTS[0].id, quantity: 1, notes: '' });
  };

  const handleApprove = (transfer: StockTransfer) => {
    // Update stocks
    setStocks(prev => prev.map(s => {
      if (s.branchId === transfer.fromBranchId && s.productId === transfer.productId) {
        return { ...s, quantity: Math.max(0, s.quantity - transfer.quantity) };
      }
      if (s.branchId === transfer.toBranchId && s.productId === transfer.productId) {
        return { ...s, quantity: s.quantity + transfer.quantity };
      }
      return s;
    }));
    setTransfers(prev => prev.map(t => t.id === transfer.id ? { ...t, status: 'completed' } : t));
  };

  const handleReject = (id: string) => {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
  };

  const handleApproveStatus = (id: string) => {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">تحويل المخزون بين الفروع</h1>
          <p className="text-gray-500 text-sm mt-0.5">{transfers.length} طلب تحويل • {transfers.filter(t => t.status === 'pending').length} قيد المراجعة</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="mr-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-semibold text-sm hover:opacity-90 shadow-lg shadow-purple-500/30"
        >
          <Plus size={16} />
          طلب تحويل جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'إجمالي التحويلات', value: transfers.length, color: 'text-purple-700' },
          { label: 'قيد المراجعة', value: transfers.filter(t => t.status === 'pending').length, color: 'text-yellow-600' },
          { label: 'موافق عليها', value: transfers.filter(t => t.status === 'approved').length, color: 'text-blue-600' },
          { label: 'مكتملة', value: transfers.filter(t => t.status === 'completed').length, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`text-xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Branch Stock Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <h3 className="font-bold text-gray-800 mb-3">مخزون الفروع - نظرة عامة</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-right text-gray-500 font-semibold">المنتج</th>
                {BRANCHES.map(b => (
                  <th key={b.id} className="px-3 py-2 text-center text-gray-500 font-semibold whitespace-nowrap">
                    <div>{b.name}</div>
                    <div className="text-gray-400 font-normal">{b.code}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PRODUCTS.slice(0, 8).map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold text-gray-700">{p.name}</td>
                  {BRANCHES.map(b => {
                    const qty = getBranchStock(b.id, p.id, stocks);
                    return (
                      <td key={b.id} className="px-3 py-2 text-center">
                        <span className={`font-bold ${qty === 0 ? 'text-red-500' : qty <= p.reorderLevel ? 'text-orange-500' : 'text-green-600'}`}>
                          {qty}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50"
            />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50">
            <option value="الكل">كل الحالات</option>
            {Object.values(TRANSFER_STATUS_LABELS).map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['رقم الطلب', 'المنتج', 'من فرع', 'إلى فرع', 'الكمية', 'طالب التحويل', 'التاريخ', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-600 font-semibold">{t.id}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-40 truncate">{t.productName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={12} className="text-gray-400" />
                      <span className="text-gray-600">{t.fromBranchName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <ArrowLeftRight size={12} className="text-[#7C3AED]" />
                      <span className="text-gray-600">{t.toBranchName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-lg">{t.quantity}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{t.requestedBy}</td>
                  <td className="px-4 py-3 text-gray-500">{t.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${TRANSFER_STATUS_COLORS[t.status]}`}>
                      {TRANSFER_STATUS_LABELS[t.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {t.status === 'pending' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleApproveStatus(t.id)}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                        >
                          موافقة
                        </button>
                        <button
                          onClick={() => handleReject(t.id)}
                          className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                        >
                          رفض
                        </button>
                      </div>
                    )}
                    {t.status === 'approved' && (
                      <button
                        onClick={() => handleApprove(t)}
                        className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center gap-1"
                      >
                        <Check size={11} />
                        إتمام التحويل
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 text-sm">لا توجد سجلات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Transfer Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-gray-800">طلب تحويل مخزون</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">الفرع المصدر</label>
                <select
                  value={form.fromBranchId}
                  onChange={e => setForm(f => ({ ...f, fromBranchId: e.target.value }))}
                  className={inputCls}
                >
                  {BRANCHES.filter(b => b.isActive).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 text-[#7C3AED] bg-purple-50 px-4 py-2 rounded-xl">
                  <ArrowLeftRight size={16} />
                  <span className="text-sm font-semibold">التحويل إلى</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">الفرع الوجهة</label>
                <select
                  value={form.toBranchId}
                  onChange={e => setForm(f => ({ ...f, toBranchId: e.target.value }))}
                  className={inputCls}
                >
                  {BRANCHES.filter(b => b.id !== form.fromBranchId && b.isActive).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">المنتج</label>
                <select
                  value={form.productId}
                  onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                  className={inputCls}
                >
                  {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {selectedProduct && (
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="text-gray-400">المتوفر في الفرع المصدر:</span>
                    <span className={`font-bold ${sourceStock === 0 ? 'text-red-500' : sourceStock < 3 ? 'text-orange-500' : 'text-green-600'}`}>
                      {sourceStock} وحدة
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">الكمية</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                  className={inputCls}
                  min={1}
                  max={sourceStock}
                />
                {form.quantity > sourceStock && (
                  <p className="text-xs text-red-500 mt-1">⚠ الكمية تتجاوز المتوفر في الفرع المصدر</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">ملاحظات</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className={`${inputCls} resize-none h-16`}
                  placeholder="سبب التحويل..."
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">إلغاء</button>
              <button
                onClick={handleCreate}
                disabled={form.fromBranchId === form.toBranchId || form.quantity > sourceStock || form.quantity <= 0}
                className="flex-1 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-bold text-sm disabled:opacity-40"
              >
                إرسال الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
