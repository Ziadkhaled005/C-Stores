import { useEffect, useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, Eye, Printer, Check,
  Lock, RotateCcw, Archive, Tag
} from 'lucide-react';
import {
  EXPENSES, EXPENSE_CATEGORIES, Expense, ExpenseCategory,
  ExpenseStatus, ExpensePayment, EXPENSE_STATUS_LABELS,
  EXPENSE_STATUS_COLORS, EXPENSE_PAYMENT_LABELS,
  nowDatetime,
} from '../../expenseData';
import { BRANCHES } from '../../branchData';
import { useBranchStore, useAuthStore } from '../../store';
import { formatCurrency } from '../../data';
import { approveExpense, archiveExpense, createExpense, getExpenseCategories, getExpenses, rejectExpense } from '../../api';

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50';

let expenseCounter = 21;

const normalizeExpense = (value: any): Expense => ({
  id: value?.id ?? '',
  date: value?.date ?? value?.createdAt?.split('T')[0] ?? '2026-06-18',
  branchId: value?.branchId ?? value?.branch?.id ?? '',
  branchName: value?.branchName ?? value?.branch?.name ?? '',
  categoryId: value?.categoryId ?? value?.category?.id ?? '',
  categoryName: value?.categoryName ?? value?.category?.name ?? '',
  description: value?.description ?? '',
  amount: Number(value?.amount ?? value?.total ?? 0),
  paymentMethod: (value?.paymentMethod ?? 'cash').toLowerCase(),
  status: (value?.status ?? 'pending').toLowerCase(),
  notes: value?.notes ?? '',
  createdBy: value?.createdBy ?? value?.createdByName ?? 'مستخدم',
  approvedBy: value?.approvedBy,
  approvedAt: value?.approvedAt,
  approvalNotes: value?.approvalNotes,
  rejectedBy: value?.rejectedBy,
  rejectedAt: value?.rejectedAt,
  rejectionReason: value?.rejectionReason,
  cancelledBy: value?.cancelledBy,
  cancelledAt: value?.cancelledAt,
  cancellationReason: value?.cancellationReason,
  isArchived: Boolean(value?.isArchived),
  deletedBy: value?.deletedBy,
  deletedAt: value?.deletedAt,
  deletionReason: value?.deletionReason,
});

const STATUS_DOT: Record<ExpenseStatus, string> = {
  pending:  '🟡',
  approved: '🟢',
  rejected: '🔴',
};

type ModalType = 'approve' | 'reject' | 'cancel' | 'view' | 'delete' | null;

export function ExpensesPage() {
  const { currentBranch } = useBranchStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  const [expenses, setExpenses]     = useState<Expense[]>(EXPENSES);
  const [categories, setCategories] = useState<ExpenseCategory[]>(EXPENSE_CATEGORIES);
  const [activeTab, setActiveTab]   = useState<'list' | 'categories'>('list');

  // Filters
  const [search,        setSearch]        = useState('');
  const [filterBranch,  setFilterBranch]  = useState('الكل');
  const [filterCat,     setFilterCat]     = useState('الكل');
  const [filterStatus,  setFilterStatus]  = useState('الكل');
  const [filterPayment, setFilterPayment] = useState('الكل');
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');

  // Main expense modal (add/edit)
  const [showExpModal, setShowExpModal]  = useState(false);
  const [editExpense,  setEditExpense]   = useState<Expense | null>(null);
  const [form, setForm] = useState<Partial<Expense>>({});

  // Action modal
  const [modalType,    setModalType]    = useState<ModalType>(null);
  const [targetExp,    setTargetExp]    = useState<Expense | null>(null);
  const [actionNotes,  setActionNotes]  = useState('');
  const [actionError,  setActionError]  = useState('');

  // Toast
  const [toast, setToast] = useState('');

  // Category
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat,      setEditCat]      = useState<ExpenseCategory | null>(null);
  const [catForm,      setCatForm]      = useState({ name: '', icon: '📦' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [apiExpenses, apiCategories] = await Promise.all([
          getExpenses(),
          getExpenseCategories(),
        ]);
        if (!cancelled) {
          setExpenses(apiExpenses.map(normalizeExpense));
          setCategories(apiCategories.map((c: any) => ({ id: c.id, name: c.name, icon: c.icon ?? '📦', isActive: c.isActive ?? true })));
        }
      } catch {
        if (!cancelled) {
          setExpenses(EXPENSES);
          setCategories(EXPENSE_CATEGORIES);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Active (non-archived) expenses
  const active = expenses.filter(e => !e.isArchived);

  const filtered = active.filter(e => {
    if (filterBranch  !== 'الكل' && e.branchName  !== filterBranch)                         return false;
    if (filterCat     !== 'الكل' && e.categoryName !== filterCat)                            return false;
    if (filterStatus  !== 'الكل' && EXPENSE_STATUS_LABELS[e.status] !== filterStatus)        return false;
    if (filterPayment !== 'الكل' && EXPENSE_PAYMENT_LABELS[e.paymentMethod] !== filterPayment) return false;
    if (dateFrom && e.date < dateFrom) return false;
    if (dateTo   && e.date > dateTo)   return false;
    if (search && !e.description.includes(search) && !e.id.includes(search) && !e.categoryName.includes(search)) return false;
    return true;
  });

  const pendingCount  = active.filter(e => e.status === 'pending').length;
  const approvedCount = active.filter(e => e.status === 'approved').length;
  const rejectedCount = active.filter(e => e.status === 'rejected').length;
  const approvedTotal = formatCurrency(active.filter(e => e.status === 'approved').reduce((s, e) => s + e.amount, 0));
  const todayTotal    = formatCurrency(active.filter(e => e.date === '2026-06-18' && e.status === 'approved').reduce((s, e) => s + e.amount, 0));

  // ── Open add/edit form ──
  const openAdd = () => {
    setEditExpense(null);
    setForm({
      date: '2026-06-18', branchId: currentBranch.id, branchName: currentBranch.name,
      categoryId: categories[0]?.id ?? '', categoryName: categories[0]?.name ?? '',
      paymentMethod: 'cash', amount: 0, description: '', notes: '',
    });
    setShowExpModal(true);
  };

  const openEdit = (e: Expense) => {
    if (e.status === 'approved') {
      alert('لا يمكن تعديل هذا المصروف لأنه تم اعتماده. إذا كنت ترغب في تعديله، يجب أولًا إلغاء الاعتماد بواسطة مستخدم يمتلك صلاحية الإدارة.');
      return;
    }
    setEditExpense(e);
    setForm({ ...e });
    setShowExpModal(true);
  };

  const handleSaveExpense = async () => {
    if (!form.description || !form.amount || !form.categoryId) return;
    const amount = Number(form.amount);
    if (editExpense) {
      setExpenses(prev => prev.map(e => e.id === editExpense.id ? { ...e, ...form, amount } as Expense : e));
      showToast('تم حفظ التعديلات بنجاح.');
    } else {
      const cat    = categories.find(c => c.id === form.categoryId);
      const branch = BRANCHES.find(b => b.id === form.branchId);
      const payload = {
        date: form.date ?? '2026-06-18',
        branchId: form.branchId ?? currentBranch.id,
        categoryId: form.categoryId!,
        description: form.description!,
        amount,
        paymentMethod: form.paymentMethod as ExpensePayment ?? 'cash',
        notes: form.notes ?? '',
      };
      try {
        const created = await createExpense(payload);
        const newExp: Expense = {
          id: created?.id ?? `EXP-2026-${String(expenseCounter++).padStart(3, '0')}`,
          date: created?.date ?? payload.date,
          branchId: created?.branchId ?? payload.branchId,
          branchName: branch?.name ?? currentBranch.name,
          categoryId: created?.categoryId ?? payload.categoryId,
          categoryName: created?.categoryName ?? cat?.name ?? '',
          description: created?.description ?? payload.description,
          amount: Number(created?.amount ?? payload.amount),
          paymentMethod: (created?.paymentMethod ?? payload.paymentMethod).toLowerCase(),
          status: created?.status ?? 'pending',
          notes: created?.notes ?? payload.notes,
          createdBy: created?.createdBy ?? user?.name ?? 'مستخدم',
          isArchived: false,
        };
        setExpenses(prev => [newExp, ...prev]);
        showToast('تم إضافة المصروف. الحالة: قيد الانتظار.');
      } catch {
        const newExp: Expense = {
          id: `EXP-2026-${String(expenseCounter++).padStart(3, '0')}`,
          date: form.date ?? '2026-06-18',
          branchId: form.branchId ?? currentBranch.id,
          branchName: branch?.name ?? currentBranch.name,
          categoryId: form.categoryId!, categoryName: cat?.name ?? '',
          description: form.description!, amount,
          paymentMethod: form.paymentMethod as ExpensePayment ?? 'cash',
          status: 'pending',
          notes: form.notes ?? '',
          createdBy: user?.name ?? 'مستخدم',
          isArchived: false,
        };
        setExpenses(prev => [newExp, ...prev]);
        showToast('تم إضافة المصروف محلياً لأن الخادم غير متاح حالياً.');
      }
    }
    setShowExpModal(false);
  };

  // ── Approve ──
  const openApprove = (e: Expense) => { setTargetExp(e); setActionNotes(''); setActionError(''); setModalType('approve'); };
  const handleApprove = async () => {
    if (!targetExp) return;
    try {
      await approveExpense(targetExp.id, actionNotes);
      setExpenses(prev => prev.map(e => e.id === targetExp.id ? {
        ...e, status: 'approved', approvedBy: user?.name ?? 'مدير النظام',
        approvedAt: nowDatetime(), approvalNotes: actionNotes,
        rejectedBy: undefined, rejectedAt: undefined, rejectionReason: undefined,
      } : e));
      setModalType(null);
      showToast('✅ تم اعتماد المصروف بنجاح.');
    } catch {
      setExpenses(prev => prev.map(e => e.id === targetExp.id ? {
        ...e, status: 'approved', approvedBy: user?.name ?? 'مدير النظام',
        approvedAt: nowDatetime(), approvalNotes: actionNotes,
        rejectedBy: undefined, rejectedAt: undefined, rejectionReason: undefined,
      } : e));
      setModalType(null);
      showToast('✅ تم اعتماد المصروف محلياً لأن الخادم غير متاح حالياً.');
    }
  };

  // ── Reject ──
  const openReject = (e: Expense) => { setTargetExp(e); setActionNotes(''); setActionError(''); setModalType('reject'); };
  const handleReject = async () => {
    if (!actionNotes.trim()) { setActionError('سبب الرفض إلزامي.'); return; }
    if (!targetExp) return;
    try {
      await rejectExpense(targetExp.id, actionNotes);
      setExpenses(prev => prev.map(e => e.id === targetExp.id ? {
        ...e, status: 'rejected', rejectedBy: user?.name ?? 'مدير النظام',
        rejectedAt: nowDatetime(), rejectionReason: actionNotes,
      } : e));
      setModalType(null);
      showToast('❌ تم رفض المصروف.');
    } catch {
      setExpenses(prev => prev.map(e => e.id === targetExp.id ? {
        ...e, status: 'rejected', rejectedBy: user?.name ?? 'مدير النظام',
        rejectedAt: nowDatetime(), rejectionReason: actionNotes,
      } : e));
      setModalType(null);
      showToast('❌ تم رفض المصروف محلياً لأن الخادم غير متاح حالياً.');
    }
  };

  // ── Cancel Approval ──
  const openCancel = (e: Expense) => { setTargetExp(e); setActionNotes(''); setActionError(''); setModalType('cancel'); };
  const handleCancelApproval = () => {
    if (!actionNotes.trim()) { setActionError('سبب إلغاء الاعتماد إلزامي.'); return; }
    if (!targetExp) return;
    setExpenses(prev => prev.map(e => e.id === targetExp.id ? {
      ...e, status: 'pending',
      approvedBy: undefined, approvedAt: undefined, approvalNotes: undefined,
      cancelledBy: user?.name ?? 'مدير النظام', cancelledAt: nowDatetime(), cancellationReason: actionNotes,
    } : e));
    setModalType(null);
    showToast('🔄 تم إلغاء اعتماد المصروف. الحالة: قيد الانتظار.');
  };

  // ── Soft Delete → Archive ──
  const openDelete = (e: Expense) => {
    if (e.status === 'approved') { alert('لا يمكن حذف هذا المصروف لأنه تم اعتماده. يجب أولًا إلغاء الاعتماد.'); return; }
    setTargetExp(e); setActionNotes(''); setActionError(''); setModalType('delete');
  };
  const handleSoftDelete = async () => {
    if (!actionNotes.trim()) { setActionError('سبب الحذف إلزامي.'); return; }
    if (!targetExp) return;
    try {
      await archiveExpense(targetExp.id, actionNotes);
      setExpenses(prev => prev.map(e => e.id === targetExp.id ? {
        ...e, isArchived: true,
        deletedBy: user?.name ?? 'مستخدم', deletedAt: nowDatetime(), deletionReason: actionNotes,
      } : e));
      setModalType(null);
      showToast('تم أرشفة المصروف.');
    } catch {
      setExpenses(prev => prev.map(e => e.id === targetExp.id ? {
        ...e, isArchived: true,
        deletedBy: user?.name ?? 'مستخدم', deletedAt: nowDatetime(), deletionReason: actionNotes,
      } : e));
      setModalType(null);
      showToast('تم أرشفة المصروف محلياً لأن الخادم غير متاح حالياً.');
    }
  };

  // ── Print ──
  const handlePrint = (exp: Expense) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          body { font-family:'Cairo',sans-serif; direction:rtl; margin:30px; }
          .header { display:flex; justify-content:space-between; margin-bottom:20px; border-bottom:2px solid #7C3AED; padding-bottom:15px; }
          h1 { color:#7C3AED; font-size:22px; margin:0; }
          .field { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f0f0f0; font-size:13px; }
          .label { color:#666; } .value { font-weight:700; }
          .amount { font-size:24px; font-weight:900; color:#7C3AED; text-align:center; margin:20px 0; }
          .sig { display:flex; justify-content:space-between; margin-top:40px; }
          .sig div { text-align:center; border-top:1px solid #000; width:150px; padding-top:5px; font-size:12px; }
        </style>
      </head><body>
        <div class="header">
          <div><h1>سي تكنولوجي ستور</h1><p style="margin:0;color:#666;font-size:13px">C Technology Store</p></div>
          <div style="text-align:left"><h2 style="margin:0;font-size:16px">سند صرف مصروف</h2><p style="margin:0;color:#666;font-size:13px">${exp.id}</p></div>
        </div>
        <div class="field"><span class="label">التاريخ</span><span class="value">${exp.date}</span></div>
        <div class="field"><span class="label">الفرع</span><span class="value">${exp.branchName}</span></div>
        <div class="field"><span class="label">نوع المصروف</span><span class="value">${exp.categoryName}</span></div>
        <div class="field"><span class="label">البيان</span><span class="value">${exp.description}</span></div>
        <div class="field"><span class="label">طريقة الدفع</span><span class="value">${EXPENSE_PAYMENT_LABELS[exp.paymentMethod]}</span></div>
        <div class="field"><span class="label">الحالة</span><span class="value">${EXPENSE_STATUS_LABELS[exp.status]}</span></div>
        ${exp.approvedBy ? `<div class="field"><span class="label">معتمد من</span><span class="value">${exp.approvedBy} — ${exp.approvedAt}</span></div>` : ''}
        ${exp.rejectionReason ? `<div class="field"><span class="label">سبب الرفض</span><span class="value">${exp.rejectionReason}</span></div>` : ''}
        ${exp.notes ? `<div class="field"><span class="label">ملاحظات</span><span class="value">${exp.notes}</span></div>` : ''}
        <div class="amount">${formatCurrency(exp.amount)}</div>
        <div class="sig"><div>توقيع المستلم</div><div>توقيع المعتمد</div></div>
        <p style="text-align:center;margin-top:30px;color:#999;font-size:12px">سي تكنولوجي ستور — نظام إدارة المصروفات</p>
      </body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  // ── Category CRUD ──
  const openAddCat  = () => { setEditCat(null); setCatForm({ name: '', icon: '📦' }); setShowCatModal(true); };
  const openEditCat = (c: ExpenseCategory) => { setEditCat(c); setCatForm({ name: c.name, icon: c.icon }); setShowCatModal(true); };
  const saveCat = () => {
    if (!catForm.name) return;
    if (editCat) {
      setCategories(prev => prev.map(c => c.id === editCat.id ? { ...c, ...catForm } : c));
    } else {
      setCategories(prev => [...prev, { id: `ec${Date.now()}`, name: catForm.name, icon: catForm.icon, isActive: true }]);
    }
    setShowCatModal(false);
  };
  const toggleCat = (id: string) => setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  const deleteCat = (id: string) => { if (confirm('حذف الفئة؟')) setCategories(prev => prev.filter(c => c.id !== id)); };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-gray-800 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">
          {toast}
        </div>
      )}

      {isLoading && <div className="mb-4 text-sm text-gray-500">جارٍ تحميل المصروفات...</div>}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">إدارة المصروفات</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {active.length} مصروف · <span className="text-yellow-600">{pendingCount} قيد الانتظار</span> · <span className="text-green-600">{approvedCount} معتمد</span> · <span className="text-red-500">{rejectedCount} مرفوض</span>
          </p>
        </div>
        <button
          onClick={openAdd}
          className="mr-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-semibold text-sm hover:opacity-90 shadow-lg shadow-purple-500/30"
        >
          <Plus size={16} />
          إضافة مصروف
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {[
          { label: 'قيد الانتظار',  value: pendingCount,  color: 'text-yellow-600', bg: 'bg-yellow-50',  dot: '🟡' },
          { label: 'معتمد',          value: approvedCount, color: 'text-green-600',  bg: 'bg-green-50',   dot: '🟢' },
          { label: 'مرفوض',          value: rejectedCount, color: 'text-red-600',    bg: 'bg-red-50',     dot: '🔴' },
          { label: 'مصروفات اليوم', value: todayTotal,    color: 'text-orange-600', bg: 'bg-orange-50',  dot: '💰' },
          { label: 'إجمالي معتمد',   value: approvedTotal, color: 'text-purple-700', bg: 'bg-purple-50',  dot: '✅' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
            <div className={`text-xl font-black mb-1 ${s.color}`}>{s.dot} {s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[{ key: 'list', label: 'المصروفات' }, { key: 'categories', label: 'الفئات' }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as any)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === t.key ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-200' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
          >{t.label}</button>
        ))}
      </div>

      {/* ────── EXPENSES LIST ────── */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-100">
            <div className="relative flex-1 min-w-44">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50" />
            </div>
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="border border-gray-200 rounded-xl px-2 py-2 text-xs bg-gray-50">
              <option value="الكل">كل الفروع</option>
              {BRANCHES.map(b => <option key={b.id}>{b.name}</option>)}
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border border-gray-200 rounded-xl px-2 py-2 text-xs bg-gray-50">
              <option value="الكل">كل الفئات</option>
              {categories.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-xl px-2 py-2 text-xs bg-gray-50">
              <option value="الكل">كل الحالات</option>
              <option>قيد الانتظار</option>
              <option>معتمد</option>
              <option>مرفوض</option>
            </select>
            <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} className="border border-gray-200 rounded-xl px-2 py-2 text-xs bg-gray-50">
              <option value="الكل">كل طرق الدفع</option>
              {Object.values(EXPENSE_PAYMENT_LABELS).map(l => <option key={l}>{l}</option>)}
            </select>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border border-gray-200 rounded-xl px-2 py-2 text-xs bg-gray-50" />
            <span className="text-gray-400 text-xs">—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border border-gray-200 rounded-xl px-2 py-2 text-xs bg-gray-50" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['رقم العملية', 'التاريخ', 'الفرع', 'الفئة', 'البيان', 'المبلغ', 'الدفع', 'الحالة', 'إجراءات'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="py-12 text-center text-gray-400 text-sm">لا توجد مصروفات</td></tr>
                ) : filtered.map(exp => (
                  <tr key={exp.id} className={`hover:bg-gray-50 transition-colors ${exp.status === 'approved' ? 'bg-green-50/30' : ''}`}>
                    <td className="px-4 py-3 font-mono text-gray-600 text-xs">{exp.id}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{exp.date}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{exp.branchName}</td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700 text-xs">{categories.find(c => c.id === exp.categoryId)?.icon} {exp.categoryName}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-40 truncate">{exp.description}</td>
                    <td className="px-4 py-3 font-black text-orange-600">{formatCurrency(exp.amount)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{EXPENSE_PAYMENT_LABELS[exp.paymentMethod]}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${EXPENSE_STATUS_COLORS[exp.status]}`}>
                        {STATUS_DOT[exp.status]} {EXPENSE_STATUS_LABELS[exp.status]}
                        {exp.status === 'approved' && <Lock size={10} className="mr-0.5" />}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {/* View */}
                        <button onClick={() => { setTargetExp(exp); setModalType('view'); }} className="text-gray-400 hover:text-teal-500 p-1 rounded" title="عرض"><Eye size={14} /></button>
                        {/* Edit — disabled if approved */}
                        <button
                          onClick={() => openEdit(exp)}
                          className={`p-1 rounded ${exp.status === 'approved' ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-[#7C3AED]'}`}
                          title={exp.status === 'approved' ? 'تم اعتماد هذا المصروف ولا يمكن تعديله.' : 'تعديل'}
                        >
                          <Edit2 size={14} />
                        </button>
                        {/* Print */}
                        <button onClick={() => handlePrint(exp)} className="text-gray-400 hover:text-gray-600 p-1 rounded" title="طباعة"><Printer size={14} /></button>
                        {/* Approve (only pending) */}
                        {exp.status === 'pending' && isAdmin && (
                          <button onClick={() => openApprove(exp)} className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold" title="اعتماد">✅ اعتماد</button>
                        )}
                        {/* Reject (only pending) */}
                        {exp.status === 'pending' && isAdmin && (
                          <button onClick={() => openReject(exp)} className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-semibold" title="رفض">❌ رفض</button>
                        )}
                        {/* Cancel approval (only approved, admin only) */}
                        {exp.status === 'approved' && isAdmin && (
                          <button onClick={() => openCancel(exp)} className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-semibold" title="إلغاء الاعتماد">🔄 إلغاء الاعتماد</button>
                        )}
                        {/* Soft Delete — disabled if approved */}
                        <button
                          onClick={() => openDelete(exp)}
                          className={`p-1 rounded ${exp.status === 'approved' ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-red-500'}`}
                          title={exp.status === 'approved' ? 'لا يمكن حذف مصروف معتمد' : 'أرشفة'}
                        >
                          <Archive size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>{filtered.length} سجل</span>
            <span className="font-black text-orange-600">
              {formatCurrency(filtered.filter(e => e.status === 'approved').reduce((s, e) => s + e.amount, 0))} معتمد
            </span>
          </div>
        </div>
      )}

      {/* ────── CATEGORIES ────── */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">فئات المصروفات</h3>
            <button onClick={openAddCat} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl text-sm font-semibold">
              <Plus size={14} />إضافة فئة
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {categories.map(cat => (
              <div key={cat.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${cat.isActive ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-gray-200 opacity-60'}`}>
                <div className="text-2xl w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm flex-shrink-0">{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-700">{cat.name}</div>
                  <div className="text-xs text-gray-400">{active.filter(e => e.categoryId === cat.id && e.status === 'approved').length} مصروف معتمد</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditCat(cat)} className="p-1 hover:bg-white rounded-lg text-gray-400 hover:text-[#7C3AED]"><Edit2 size={13} /></button>
                  <button onClick={() => toggleCat(cat.id)} className={`p-1 rounded-lg text-xs font-bold ${cat.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}>
                    {cat.isActive ? 'تعطيل' : 'تفعيل'}
                  </button>
                  <button onClick={() => deleteCat(cat.id)} className="p-1 hover:bg-white rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════ Add/Edit Expense Modal ════ */}
      {showExpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowExpModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-gray-800">{editExpense ? 'تعديل مصروف' : 'إضافة مصروف جديد'}</h3>
              <button onClick={() => setShowExpModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">البيان / الوصف *</label>
                <input type="text" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="وصف المصروف..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">التاريخ</label>
                <input type="date" value={form.date ?? ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">الفرع</label>
                <select value={form.branchId ?? ''} onChange={e => { const b = BRANCHES.find(b => b.id === e.target.value); setForm(f => ({ ...f, branchId: e.target.value, branchName: b?.name ?? '' })); }} className={inputCls}>
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">نوع المصروف *</label>
                <select value={form.categoryId ?? ''} onChange={e => { const c = categories.find(c => c.id === e.target.value); setForm(f => ({ ...f, categoryId: e.target.value, categoryName: c?.name ?? '' })); }} className={inputCls}>
                  {categories.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">طريقة الدفع</label>
                <select value={form.paymentMethod ?? 'cash'} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as any }))} className={inputCls}>
                  {Object.entries(EXPENSE_PAYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">المبلغ (EGP) *</label>
                <input type="number" value={form.amount ?? 0} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} className={inputCls} min={0} />
                {!editExpense && (
                  <p className="text-xs text-yellow-600 mt-1">سيبدأ المصروف بحالة "قيد الانتظار" ويحتاج إلى اعتماد.</p>
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">ملاحظات</label>
                <textarea value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={`${inputCls} resize-none h-16`} placeholder="ملاحظات إضافية..." />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowExpModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">إلغاء</button>
              <button onClick={handleSaveExpense} className="flex-1 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-bold text-sm">
                {editExpense ? 'حفظ التغييرات' : 'إضافة المصروف'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ Approve Modal ════ */}
      {modalType === 'approve' && targetExp && (
        <ActionModal
          title="اعتماد المصروف"
          icon="✅"
          color="text-green-600"
          exp={targetExp}
          label="ملاحظات الاعتماد (اختياري)"
          required={false}
          value={actionNotes}
          onChange={setActionNotes}
          error={actionError}
          confirmLabel="تأكيد الاعتماد"
          confirmColor="bg-green-600 hover:bg-green-700"
          onConfirm={handleApprove}
          onClose={() => setModalType(null)}
        />
      )}

      {/* ════ Reject Modal ════ */}
      {modalType === 'reject' && targetExp && (
        <ActionModal
          title="رفض المصروف"
          icon="❌"
          color="text-red-600"
          exp={targetExp}
          label="سبب الرفض *"
          required={true}
          value={actionNotes}
          onChange={v => { setActionNotes(v); setActionError(''); }}
          error={actionError}
          confirmLabel="تأكيد الرفض"
          confirmColor="bg-red-600 hover:bg-red-700"
          onConfirm={handleReject}
          onClose={() => setModalType(null)}
        />
      )}

      {/* ════ Cancel Approval Modal ════ */}
      {modalType === 'cancel' && targetExp && (
        <ActionModal
          title="إلغاء اعتماد المصروف"
          icon="🔄"
          color="text-orange-600"
          exp={targetExp}
          label="سبب إلغاء الاعتماد *"
          required={true}
          value={actionNotes}
          onChange={v => { setActionNotes(v); setActionError(''); }}
          error={actionError}
          confirmLabel="تأكيد إلغاء الاعتماد"
          confirmColor="bg-orange-500 hover:bg-orange-600"
          onConfirm={handleCancelApproval}
          onClose={() => setModalType(null)}
        />
      )}

      {/* ════ Delete (Archive) Modal ════ */}
      {modalType === 'delete' && targetExp && (
        <ActionModal
          title="أرشفة المصروف"
          icon="🗂️"
          color="text-gray-600"
          exp={targetExp}
          label="سبب الأرشفة / الحذف *"
          required={true}
          value={actionNotes}
          onChange={v => { setActionNotes(v); setActionError(''); }}
          error={actionError}
          confirmLabel="أرشفة"
          confirmColor="bg-gray-700 hover:bg-gray-800"
          onConfirm={handleSoftDelete}
          onClose={() => setModalType(null)}
        />
      )}

      {/* ════ View Modal ════ */}
      {modalType === 'view' && targetExp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalType(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-gray-800">تفاصيل المصروف</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => handlePrint(targetExp)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#7C3AED] text-[#7C3AED] rounded-xl text-xs font-semibold hover:bg-purple-50">
                  <Printer size={12} />طباعة
                </button>
                <button onClick={() => setModalType(null)}><X size={18} className="text-gray-400" /></button>
              </div>
            </div>
            <div className="p-5">
              <div className="text-center mb-5">
                <div className="text-3xl mb-1">{categories.find(c => c.id === targetExp.categoryId)?.icon ?? '📦'}</div>
                <div className="text-2xl font-black text-orange-600">{formatCurrency(targetExp.amount)}</div>
                <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold mt-1 ${EXPENSE_STATUS_COLORS[targetExp.status]}`}>
                  {STATUS_DOT[targetExp.status]} {EXPENSE_STATUS_LABELS[targetExp.status]}
                  {targetExp.status === 'approved' && <Lock size={10} />}
                </span>
              </div>
              {[
                { label: 'رقم العملية',   value: targetExp.id },
                { label: 'التاريخ',       value: targetExp.date },
                { label: 'الفرع',         value: targetExp.branchName },
                { label: 'نوع المصروف',   value: targetExp.categoryName },
                { label: 'البيان',        value: targetExp.description },
                { label: 'طريقة الدفع',   value: EXPENSE_PAYMENT_LABELS[targetExp.paymentMethod] },
                { label: 'أنشئ بواسطة',   value: targetExp.createdBy },
                ...(targetExp.approvedBy ? [
                  { label: 'معتمد من', value: targetExp.approvedBy },
                  { label: 'تاريخ الاعتماد', value: targetExp.approvedAt ?? '' },
                  ...(targetExp.approvalNotes ? [{ label: 'ملاحظات الاعتماد', value: targetExp.approvalNotes }] : []),
                ] : []),
                ...(targetExp.rejectedBy ? [
                  { label: 'رفض من', value: targetExp.rejectedBy },
                  { label: 'تاريخ الرفض', value: targetExp.rejectedAt ?? '' },
                  { label: 'سبب الرفض', value: targetExp.rejectionReason ?? '' },
                ] : []),
                ...(targetExp.cancelledBy ? [
                  { label: 'إلغاء الاعتماد من', value: targetExp.cancelledBy },
                  { label: 'تاريخ الإلغاء', value: targetExp.cancelledAt ?? '' },
                  { label: 'سبب الإلغاء', value: targetExp.cancellationReason ?? '' },
                ] : []),
              ].map(f => (
                <div key={f.label} className="flex items-start justify-between py-1.5 border-b border-gray-50 text-sm gap-2">
                  <span className="text-gray-400 flex-shrink-0">{f.label}</span>
                  <span className="font-semibold text-gray-700 text-left">{f.value || '—'}</span>
                </div>
              ))}
              {targetExp.notes && (
                <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 mt-3">{targetExp.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════ Category Modal ════ */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCatModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-gray-800">{editCat ? 'تعديل فئة' : 'إضافة فئة'}</h3>
              <button onClick={() => setShowCatModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">اسم الفئة *</label>
                <input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="اسم الفئة" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">الأيقونة (Emoji)</label>
                <input value={catForm.icon} onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))} className={inputCls} placeholder="📦" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowCatModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">إلغاء</button>
              <button onClick={saveCat} className="flex-1 py-2.5 bg-[#7C3AED] text-white rounded-xl font-bold text-sm">{editCat ? 'حفظ' : 'إضافة'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reusable Action Modal ──
function ActionModal({
  title, icon, color, exp, label, required, value, onChange,
  error, confirmLabel, confirmColor, onConfirm, onClose,
}: {
  title: string; icon: string; color: string; exp: Expense;
  label: string; required: boolean; value: string;
  onChange: (v: string) => void; error: string;
  confirmLabel: string; confirmColor: string;
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className={`font-black text-gray-800 flex items-center gap-2`}>{icon} {title}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-5">
          <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
            <div className="font-semibold text-gray-700 mb-1">{exp.description}</div>
            <div className="flex justify-between text-gray-500">
              <span>{exp.branchName}</span>
              <span className="font-black text-orange-600">{formatCurrency(exp.amount)}</span>
            </div>
          </div>
          <label className="block text-sm font-semibold text-gray-600 mb-1.5">{label}</label>
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50 resize-none h-20"
            placeholder={required ? 'مطلوب...' : 'اختياري...'}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <div className="flex gap-3 p-5 border-t">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">إلغاء</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 text-white rounded-xl font-bold text-sm ${confirmColor}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
