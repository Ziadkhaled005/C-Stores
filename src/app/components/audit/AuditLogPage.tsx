import { useState } from 'react';
import { Search, Filter, Download, Shield, LogIn, LogOut, Edit2, Plus, Trash2, ArrowLeftRight, Package } from 'lucide-react';
import { AUDIT_LOG, AuditEntry } from '../../rbacData';
import { BRANCHES } from '../../branchData';

const ACTION_ICONS: Record<string, React.ReactNode> = {
  'تسجيل دخول': <LogIn size={14} className="text-green-500" />,
  'تسجيل خروج': <LogOut size={14} className="text-gray-400" />,
  'إنشاء مستخدم': <Plus size={14} className="text-blue-500" />,
  'تعديل دور': <Shield size={14} className="text-purple-500" />,
  'تعديل مخزون': <Package size={14} className="text-orange-500" />,
  'طلب تحويل مخزون': <ArrowLeftRight size={14} className="text-teal-500" />,
  'موافقة تحويل': <ArrowLeftRight size={14} className="text-green-500" />,
  'إنشاء فاتورة': <Plus size={14} className="text-blue-500" />,
  'طباعة فاتورة': <Plus size={14} className="text-gray-500" />,
  'إنشاء عرض سعر': <Plus size={14} className="text-orange-500" />,
  'إضافة فرع': <Plus size={14} className="text-purple-500" />,
};

const MODULE_COLORS: Record<string, string> = {
  'النظام': 'bg-gray-100 text-gray-600',
  'المستخدمون': 'bg-blue-100 text-blue-700',
  'المبيعات': 'bg-green-100 text-green-700',
  'المخزون': 'bg-orange-100 text-orange-700',
  'الأدوار': 'bg-purple-100 text-purple-700',
  'الفروع': 'bg-teal-100 text-teal-700',
};

export function AuditLogPage() {
  const [logs] = useState<AuditEntry[]>(AUDIT_LOG);
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('الكل');
  const [filterBranch, setFilterBranch] = useState('الكل');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const modules = ['الكل', ...Array.from(new Set(logs.map(l => l.module)))];

  const filtered = logs.filter(log => {
    if (filterModule !== 'الكل' && log.module !== filterModule) return false;
    if (filterBranch !== 'الكل' && log.branchName !== filterBranch) return false;
    if (dateFrom && log.date < dateFrom) return false;
    if (dateTo && log.date > dateTo) return false;
    if (search && !log.userName.includes(search) && !log.action.includes(search) && !log.details.includes(search)) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">سجل المراجعة</h1>
          <p className="text-gray-500 text-sm mt-0.5">تتبع جميع العمليات والتغييرات في النظام</p>
        </div>
        <button
          onClick={() => alert('سيتم تنزيل السجل كملف Excel')}
          className="mr-auto flex items-center gap-2 px-5 py-2.5 border border-[#7C3AED] text-[#7C3AED] rounded-xl font-semibold text-sm hover:bg-purple-50 transition-all"
        >
          <Download size={16} />
          تصدير السجل
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'إجمالي الأحداث', value: logs.length, color: 'text-purple-700' },
          { label: 'تسجيلات الدخول', value: logs.filter(l => l.action === 'تسجيل دخول').length, color: 'text-green-600' },
          { label: 'تغييرات المخزون', value: logs.filter(l => l.module === 'المخزون').length, color: 'text-orange-600' },
          { label: 'تغييرات الصلاحيات', value: logs.filter(l => l.module === 'الأدوار').length, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`text-xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث عن مستخدم أو حدث..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50">
              {modules.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50">
            <option value="الكل">كل الفروع</option>
            {BRANCHES.map(b => <option key={b.id}>{b.name}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50" />
          <span className="text-gray-400 text-sm">—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['المستخدم', 'الإجراء', 'الوحدة', 'التفاصيل', 'الفرع', 'عنوان IP', 'التاريخ', 'الوقت'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">لا توجد سجلات تطابق الفلتر</td>
                </tr>
              ) : (
                filtered.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {log.userName.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-700 whitespace-nowrap">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        {ACTION_ICONS[log.action] ?? <Edit2 size={14} className="text-gray-400" />}
                        <span className="text-gray-700">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${MODULE_COLORS[log.module] ?? 'bg-gray-100 text-gray-600'}`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-56 truncate">{log.details}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{log.branchName}</td>
                    <td className="px-4 py-3 font-mono text-gray-400 text-xs">{log.ipAddress}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{log.date}</td>
                    <td className="px-4 py-3 text-gray-500">{log.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
          <span>عرض {filtered.length} من {logs.length} سجل</span>
          <span className="text-xs">يتم تحديث السجل تلقائياً</span>
        </div>
      </div>
    </div>
  );
}
