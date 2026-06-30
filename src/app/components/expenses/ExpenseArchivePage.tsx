import { useState } from 'react';
import { Search, RotateCcw, Trash2, X, AlertTriangle, Archive } from 'lucide-react';
import { EXPENSES, Expense, EXPENSE_STATUS_LABELS, EXPENSE_STATUS_COLORS, EXPENSE_PAYMENT_LABELS, nowDatetime } from '../../expenseData';
import { useAuthStore } from '../../store';
import { formatCurrency } from '../../data';

export function ExpenseArchivePage() {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState<Expense[]>(EXPENSES);
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState<Expense | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const archived = expenses.filter(e => e.isArchived).filter(e =>
    !search || e.description.includes(search) || e.id.includes(search) || e.branchName.includes(search)
  );

  const handleRestore = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? {
      ...e, isArchived: false,
      deletedBy: undefined, deletedAt: undefined, deletionReason: undefined,
    } : e));
    showToast('✅ تم استعادة المصروف بنجاح.');
  };

  const handlePermanentDelete = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setShowConfirm(null);
    showToast('🗑️ تم حذف المصروف نهائياً.');
  };

  return (
    <div>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-gray-800 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Archive size={18} className="text-gray-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">أرشيف المصروفات</h1>
            <p className="text-gray-500 text-sm mt-0.5">{archived.length} مصروف مؤرشف</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 mb-5 text-sm text-yellow-800">
        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-yellow-600" />
        <p>
          المصروفات المؤرشفة لا تظهر في القوائم العادية أو التقارير. يمكن استعادتها أو حذفها نهائياً.
          <strong> الحذف النهائي لا يمكن التراجع عنه.</strong>
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث في الأرشيف..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50"
            />
          </div>
        </div>

        {archived.length === 0 ? (
          <div className="py-20 text-center">
            <Archive size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">لا توجد مصروفات مؤرشفة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['رقم العملية', 'التاريخ', 'الفرع', 'الفئة', 'البيان', 'المبلغ', 'الحالة', 'أُرشف بواسطة', 'سبب الأرشفة', 'إجراءات'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {archived.map(exp => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-400 text-xs">{exp.id}</td>
                    <td className="px-4 py-3 text-gray-500">{exp.date}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{exp.branchName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{exp.categoryName}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-40 truncate">{exp.description}</td>
                    <td className="px-4 py-3 font-bold text-gray-500">{formatCurrency(exp.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${EXPENSE_STATUS_COLORS[exp.status]}`}>
                        {EXPENSE_STATUS_LABELS[exp.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{exp.deletedBy ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-32 truncate">{exp.deletionReason ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Restore */}
                        <button
                          onClick={() => handleRestore(exp.id)}
                          className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold"
                        >
                          <RotateCcw size={11} />
                          استعادة
                        </button>
                        {/* Permanent Delete */}
                        <button
                          onClick={() => setShowConfirm(exp)}
                          className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-semibold"
                        >
                          <Trash2 size={11} />
                          حذف نهائي
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permanent Delete Confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="font-black text-gray-800 text-lg mb-2">حذف نهائي</h3>
              <p className="text-gray-500 text-sm mb-4">
                هل أنت متأكد من حذف هذا المصروف نهائياً؟ لا يمكن التراجع عن هذه العملية.
              </p>
              <div className="bg-gray-50 rounded-xl p-3 mb-5 text-right text-sm">
                <div className="font-semibold text-gray-700">{showConfirm.description}</div>
                <div className="text-orange-600 font-black">{formatCurrency(showConfirm.amount)}</div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">
                  إلغاء
                </button>
                <button
                  onClick={() => handlePermanentDelete(showConfirm.id)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all"
                >
                  حذف نهائي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
