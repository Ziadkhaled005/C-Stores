import { useState } from 'react';
import { Download, FileText, TrendingUp, Package, Users, BarChart3, Receipt } from 'lucide-react';
import { SALES, PRODUCTS, CUSTOMERS, REVENUE_DATA, formatCurrency } from '../../data';
import { EXPENSES, getMonthExpenses, getCategoryBreakdown, getBranchBreakdown, expenseTotal, MONTHLY_EXPENSE_TREND, EXPENSE_STATUS_LABELS, EXPENSE_STATUS_COLORS, EXPENSE_PAYMENT_LABELS } from '../../expenseData';
import type { ExpenseStatus } from '../../expenseData';
import { SimpleBarChart } from '../ui/SimpleBarChart';
import { SimplePieChart } from '../ui/SimplePieChart';

const categoryData = [
  { name: 'لابتوبات', value: 45, revenue: 850000 },
  { name: 'شاشات',   value: 20, revenue: 320000 },
  { name: 'طابعات',  value: 12, revenue: 180000 },
  { name: 'ملحقات',  value: 10, revenue: 95000  },
  { name: 'شبكات',   value: 8,  revenue: 72000  },
  { name: 'تخزين',   value: 5,  revenue: 65000  },
];

const topCustomersData = CUSTOMERS.slice(0, 5).map(c => ({
  name: c.name.split(' ').slice(0, 2).join(' '),
  value: c.totalPurchases,
}));

export function ReportsPage() {
  const [reportType, setReportType] = useState('sales');
  const [period, setPeriod] = useState('monthly');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-06-18');

  const totalRevenue  = REVENUE_DATA.reduce((s, r) => s + r.revenue, 0);
  const totalProfit   = REVENUE_DATA.reduce((s, r) => s + r.profit, 0);
  const totalOrders   = REVENUE_DATA.reduce((s, r) => s + r.orders, 0);
  const profitMargin  = ((totalProfit / totalRevenue) * 100).toFixed(1);

  const totalExpenses = expenseTotal(EXPENSES.filter(e => e.status === 'approved'));
  const catBreakdown  = getCategoryBreakdown(EXPENSES.filter(e => e.status === 'approved')).slice(0, 8);
  const branchBreakdown = getBranchBreakdown(EXPENSES.filter(e => e.status === 'approved'));

  const handleExport = () => alert('سيتم تنزيل التقرير كملف PDF');

  const REPORT_TABS = [
    { key: 'sales',     label: 'تقرير المبيعات',   icon: TrendingUp },
    { key: 'products',  label: 'تقرير المنتجات',   icon: Package },
    { key: 'customers', label: 'تقرير العملاء',    icon: Users },
    { key: 'expenses',  label: 'تقرير المصروفات',  icon: Receipt },
    { key: 'profit',    label: 'الأرباح والخسائر', icon: BarChart3 },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">التقارير</h1>
          <p className="text-gray-500 text-sm mt-0.5">تحليل شامل للأداء التجاري</p>
        </div>
        <button
          onClick={handleExport}
          className="mr-auto flex items-center gap-2 px-5 py-2.5 border border-[#7C3AED] text-[#7C3AED] rounded-xl font-semibold text-sm hover:bg-purple-50 transition-all"
        >
          <Download size={16} />
          تصدير PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'إجمالي الإيرادات', value: formatCurrency(totalRevenue), sub: 'يناير - يونيو ٢٠٢٦', color: 'text-purple-700', bg: 'bg-purple-50' },
          { label: 'إجمالي الأرباح',   value: formatCurrency(totalProfit),  sub: `هامش ${profitMargin}%`,   color: 'text-green-700',  bg: 'bg-green-50' },
          { label: 'عدد الطلبات',       value: totalOrders.toString(),        sub: 'خلال ٦ أشهر',            color: 'text-teal-700',   bg: 'bg-teal-50' },
          { label: 'متوسط الفاتورة',    value: formatCurrency(totalRevenue / totalOrders), sub: 'لكل عملية بيع', color: 'text-pink-700', bg: 'bg-pink-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
            <div className={`text-xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-sm font-semibold text-gray-700">{s.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
            {REPORT_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setReportType(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  reportType === key ? 'bg-white text-[#7C3AED] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mr-auto">
            {[
              { key: 'daily', label: 'يومي' }, { key: 'weekly', label: 'أسبوعي' },
              { key: 'monthly', label: 'شهري' }, { key: 'custom', label: 'مخصص' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setPeriod(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === key ? 'bg-white text-[#7C3AED] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >{label}</button>
            ))}
          </div>

          {period === 'custom' && (
            <>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-[#7C3AED]" />
              <span className="text-gray-400">—</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-[#7C3AED]" />
            </>
          )}
        </div>
      </div>

      {/* ══ SALES ══ */}
      {reportType === 'sales' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">الإيرادات الشهرية</h3>
              <SimpleBarChart
                data={REVENUE_DATA.map(r => ({ label: r.month, value: r.revenue }))}
                color="#7C3AED" height={220} valueFormatter={v => formatCurrency(v)}
              />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">الأرباح الشهرية</h3>
              <SimpleBarChart
                data={REVENUE_DATA.map(r => ({ label: r.month, value: r.profit }))}
                color="#10B981" height={220} valueFormatter={v => formatCurrency(v)}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold text-gray-800">سجل المبيعات</h3>
              <button onClick={handleExport} className="flex items-center gap-1.5 text-xs text-[#7C3AED]">
                <FileText size={12} />
                تصدير Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['رقم الفاتورة', 'العميل', 'التاريخ', 'الإجمالي', 'الضريبة', 'صافي الربح'].map(h => (
                      <th key={h} className="px-4 py-3 text-right text-gray-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {SALES.filter(s => s.status === 'paid').map(s => {
                    const cost = s.items.reduce((sum, i) => {
                      const p = PRODUCTS.find(p => p.id === i.productId);
                      return sum + (p?.costPrice || 0) * i.quantity;
                    }, 0);
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-gray-600">{s.id}</td>
                        <td className="px-4 py-3 text-gray-700">{s.customerName}</td>
                        <td className="px-4 py-3 text-gray-500">{s.date}</td>
                        <td className="px-4 py-3 font-semibold text-[#7C3AED]">{formatCurrency(s.total)}</td>
                        <td className="px-4 py-3 text-gray-500">{formatCurrency(s.taxAmount)}</td>
                        <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(s.total - cost)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ PRODUCTS ══ */}
      {reportType === 'products' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">مبيعات حسب الفئة (%)</h3>
              <SimplePieChart
                data={categoryData.map(c => ({ name: c.name, value: c.value }))}
                valueFormatter={v => `${v}%`}
              />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">إيرادات الفئات</h3>
              <SimpleBarChart
                data={categoryData.map(c => ({ label: c.name, value: c.revenue }))}
                color="#7C3AED" height={220} valueFormatter={v => formatCurrency(v)}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b"><h3 className="font-bold text-gray-800">أعلى المنتجات مبيعاً</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{['المنتج', 'الفئة', 'الماركة', 'سعر البيع', 'المخزون', 'هامش الربح'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-gray-500 font-semibold">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {PRODUCTS.slice(0, 10).map(p => {
                    const margin = (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-700">{p.name}</td>
                        <td className="px-4 py-3"><span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg text-xs">{p.category}</span></td>
                        <td className="px-4 py-3 text-gray-500">{p.brand}</td>
                        <td className="px-4 py-3 font-semibold text-[#7C3AED]">{formatCurrency(p.sellingPrice)}</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${p.quantity === 0 ? 'text-red-500' : p.quantity <= p.reorderLevel ? 'text-orange-500' : 'text-green-600'}`}>
                            {p.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-xs font-bold">{margin}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ CUSTOMERS ══ */}
      {reportType === 'customers' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">أعلى العملاء إنفاقاً</h3>
              <SimpleBarChart
                data={topCustomersData.map(c => ({ label: c.name, value: c.value }))}
                color="#EC4899" height={220} valueFormatter={v => formatCurrency(v)}
              />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">إحصاءات العملاء</h3>
              <div className="space-y-4 mt-2">
                {[
                  { label: 'إجمالي العملاء',               value: CUSTOMERS.length,                                                                          color: '#7C3AED' },
                  { label: 'عملاء نشطون',                  value: CUSTOMERS.filter(c => c.totalPurchases > 0).length,                                        color: '#06B6D4' },
                  { label: 'عملاء بأرصدة مستحقة',         value: CUSTOMERS.filter(c => c.balance > 0).length,                                               color: '#F97316' },
                  { label: 'متوسط قيمة العميل',            value: formatCurrency(CUSTOMERS.reduce((s, c) => s + c.totalPurchases, 0) / CUSTOMERS.length),    color: '#EC4899' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600">{s.label}</span>
                    <span className="font-black text-base" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b"><h3 className="font-bold text-gray-800">تفاصيل العملاء</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{['العميل', 'الهاتف', 'إجمالي المشتريات', 'عدد الفواتير', 'الرصيد', 'تاريخ الانضمام'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-gray-500 font-semibold">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {CUSTOMERS.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-700">{c.name}</td>
                      <td className="px-4 py-3 text-gray-500">{c.phone}</td>
                      <td className="px-4 py-3 font-bold text-[#7C3AED]">{formatCurrency(c.totalPurchases)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg text-xs font-bold">
                          {SALES.filter(s => s.customerId === c.id).length}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-orange-600">{formatCurrency(c.balance)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{c.joinDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ EXPENSES ══ */}
      {reportType === 'expenses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'إجمالي معتمد',  value: formatCurrency(totalExpenses), c: 'text-red-600' },
              { label: 'قيد الانتظار',  value: EXPENSES.filter(e => e.status === 'pending' && !e.isArchived).length, c: 'text-yellow-600' },
              { label: 'معتمد',          value: EXPENSES.filter(e => e.status === 'approved' && !e.isArchived).length, c: 'text-green-600' },
              { label: 'مرفوض',          value: EXPENSES.filter(e => e.status === 'rejected' && !e.isArchived).length, c: 'text-red-500' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className={`text-xl font-black mb-1 ${s.c}`}>{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">المصروفات المعتمدة حسب الفئة</h3>
              <SimplePieChart data={catBreakdown} valueFormatter={v => formatCurrency(v)} />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">المصروفات حسب الفرع</h3>
              <SimpleBarChart
                data={branchBreakdown.map(b => ({ label: b.name.replace('فرع ', ''), value: b.value }))}
                color="#EC4899" height={220} valueFormatter={v => formatCurrency(v)}
              />
            </div>
          </div>

          {/* Filter by status */}
          <ExpenseReportTable onExport={handleExport} /></div>
      )}


      {/* ══ P&L ══ */}
      {reportType === 'profit' && (
        <div className="space-y-4">
          {/* P&L Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-black text-gray-800 mb-5 text-lg">تقرير الأرباح والخسائر — يونيو ٢٠٢٦</h3>
            <div className="space-y-3 max-w-lg">
              {[
                { label: 'إجمالي المبيعات',  value: totalRevenue,  color: 'text-green-600',  sign: '+', bg: 'bg-green-50' },
                { label: 'إجمالي المرتجعات', value: 0,             color: 'text-orange-500', sign: '—', bg: 'bg-orange-50' },
                { label: 'إجمالي المصروفات', value: totalExpenses,  color: 'text-red-500',    sign: '—', bg: 'bg-red-50' },
              ].map(r => (
                <div key={r.label} className={`flex items-center justify-between p-4 rounded-xl ${r.bg}`}>
                  <span className="font-semibold text-gray-700">{r.label}</span>
                  <span className={`font-black text-lg ${r.color}`}>{r.sign} {formatCurrency(r.value)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-5 bg-gradient-to-l from-[#7C3AED]/15 to-purple-50 rounded-2xl border-2 border-[#7C3AED]/20">
                <div>
                  <div className="font-black text-gray-800 text-lg">صافي الربح</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    هامش الربح: {totalRevenue > 0 ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <span className={`font-black text-3xl ${totalRevenue - totalExpenses >= 0 ? 'text-[#7C3AED]' : 'text-red-600'}`}>
                  {formatCurrency(totalRevenue - totalExpenses)}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly charts */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">الإيرادات الشهرية</h3>
              <SimpleBarChart
                data={REVENUE_DATA.map(r => ({ label: r.month, value: r.revenue }))}
                color="#7C3AED" height={200} valueFormatter={v => formatCurrency(v)}
              />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">المصروفات الشهرية</h3>
              <SimpleBarChart
                data={MONTHLY_EXPENSE_TREND.map(r => ({ label: r.month, value: r.amount }))}
                color="#F87171" height={200} valueFormatter={v => formatCurrency(v)}
              />
            </div>
          </div>

          {/* Monthly P&L grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {REVENUE_DATA.map((r, i) => {
              const exp    = MONTHLY_EXPENSE_TREND[i]?.amount ?? 0;
              const net    = r.revenue - exp;
              const margin = r.revenue > 0 ? ((net / r.revenue) * 100).toFixed(1) : '0';
              return (
                <div key={r.month} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="font-bold text-gray-700 mb-3">{r.month}</div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">الإيرادات</span><span className="text-green-600 font-semibold">{formatCurrency(r.revenue)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">المصروفات</span><span className="text-red-500 font-semibold">{formatCurrency(exp)}</span></div>
                    <div className="flex justify-between pt-1 border-t border-gray-100"><span className="font-bold text-gray-700">الصافي</span><span className={`font-black ${net >= 0 ? 'text-[#7C3AED]' : 'text-red-600'}`}>{formatCurrency(net)}</span></div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: `${Math.max(0, Number(margin))}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{margin}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ExpenseReportTable({ onExport }: { onExport: () => void }) {
  const [statusFilter, setStatusFilter] = useState<'all' | ExpenseStatus>('all');
  const rows = EXPENSES.filter(e =>
    !e.isArchived && (statusFilter === 'all' || e.status === statusFilter)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b">
        <h3 className="font-bold text-gray-800">تفاصيل المصروفات</h3>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {([['all', 'الكل'], ['pending', '🟡 قيد الانتظار'], ['approved', '🟢 معتمد'], ['rejected', '🔴 مرفوض']] as [string, string][]).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setStatusFilter(k as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === k ? 'bg-white text-[#7C3AED] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >{l}</button>
            ))}
          </div>
          <button onClick={onExport} className="flex items-center gap-1.5 text-xs text-[#7C3AED]">
            <FileText size={12} />تصدير
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>{['التاريخ', 'الفرع', 'الفئة', 'البيان', 'المبلغ', 'الحالة', 'اعتمد بواسطة', 'تاريخ الاعتماد', 'سبب الرفض'].map(h => (
              <th key={h} className="px-3 py-3 text-right text-gray-500 font-semibold whitespace-nowrap text-xs">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.length === 0 ? (
              <tr><td colSpan={9} className="py-10 text-center text-gray-400 text-sm">لا توجد بيانات</td></tr>
            ) : rows.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-3 py-2.5 text-gray-500 text-xs">{e.date}</td>
                <td className="px-3 py-2.5 text-gray-600 text-xs">{e.branchName}</td>
                <td className="px-3 py-2.5 text-gray-600 text-xs">{e.categoryName}</td>
                <td className="px-3 py-2.5 text-gray-700 max-w-36 truncate">{e.description}</td>
                <td className="px-3 py-2.5 font-bold text-orange-600">{formatCurrency(e.amount)}</td>
                <td className="px-3 py-2.5">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${EXPENSE_STATUS_COLORS[e.status]}`}>
                    {EXPENSE_STATUS_LABELS[e.status]}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-gray-500 text-xs">{e.approvedBy ?? '—'}</td>
                <td className="px-3 py-2.5 text-gray-400 text-xs whitespace-nowrap">{e.approvedAt ?? '—'}</td>
                <td className="px-3 py-2.5 text-red-500 text-xs max-w-36 truncate">{e.rejectionReason ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t text-xs text-gray-400 flex justify-between">
        <span>{rows.length} سجل</span>
        <span className="font-bold text-orange-600">{formatCurrency(rows.filter(e => e.status === 'approved').reduce((s, e) => s + e.amount, 0))} إجمالي معتمد</span>
      </div>
    </div>
  );
}
