import { useEffect, useState } from 'react';
import { TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Printer } from 'lucide-react';
import {
  EXPENSES, MONTHLY_EXPENSE_TREND, getTodayExpenses, getMonthExpenses,
  expenseTotal, getCategoryBreakdown, getBranchBreakdown, EXPENSE_PAYMENT_LABELS
} from '../../expenseData';
import { SALES, REVENUE_DATA, formatCurrency } from '../../data';
import { getExpenses, getSales, getCashflow } from '../../api';
import { useBranchStore } from '../../store';
import { BRANCHES } from '../../branchData';
import { SimpleBarChart } from '../ui/SimpleBarChart';
import { SimplePieChart } from '../ui/SimplePieChart';

const COMPARE_DATA = REVENUE_DATA.map((r, i) => ({
  month: r.month,
  الإيرادات: r.revenue,
  المصروفات: MONTHLY_EXPENSE_TREND[i]?.amount ?? 0,
}));

const normalizeExpense = (value: any) => ({
  id: value?.id ?? '',
  date: value?.date ?? value?.createdAt?.split('T')[0] ?? '2026-06-18',
  branchId: value?.branchId ?? value?.branch?.id ?? '',
  branchName: value?.branchName ?? value?.branch?.name ?? 'فرع رئيسي',
  categoryId: value?.categoryId ?? value?.category?.id ?? '',
  categoryName: value?.categoryName ?? value?.category?.name ?? 'أخرى',
  description: value?.description ?? '',
  amount: Number(value?.amount ?? value?.total ?? 0),
  paymentMethod: (value?.paymentMethod ?? 'cash').toLowerCase(),
  status: (value?.status ?? 'approved').toLowerCase(),
  notes: value?.notes ?? '',
  createdBy: value?.createdBy ?? value?.createdByName ?? 'مستخدم',
  isArchived: Boolean(value?.isArchived),
});

const normalizeSale = (value: any) => ({
  id: value?.id ?? '',
  date: value?.date ?? value?.createdAt?.split('T')[0] ?? '2026-06-18',
  status: (value?.status ?? 'paid').toLowerCase(),
  total: Number(value?.total ?? value?.amount ?? 0),
  items: Array.isArray(value?.items) ? value.items : [],
  customerName: value?.customerName ?? value?.customer?.name ?? '',
});

export function CashFlowPage() {
  const { currentBranch } = useBranchStore();
  const [selectedDate, setSelectedDate] = useState('2026-06-18');
  const [filterBranch, setFilterBranch] = useState('الكل');
  const [expensesData, setExpensesData] = useState(EXPENSES);
  const [salesData, setSalesData] = useState(SALES);
  const [isLoading, setIsLoading] = useState(true);

  const branchFilter = filterBranch === 'الكل' ? undefined : BRANCHES.find(b => b.name === filterBranch)?.id;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [apiExpenses, apiSales, cashflowData] = await Promise.all([
          getExpenses({ branchId: branchFilter, status: 'approved' }),
          getSales({ branchId: branchFilter, status: 'paid' }),
          getCashflow(selectedDate, branchFilter),
        ]);
        if (!cancelled) {
          setExpensesData(apiExpenses.map(normalizeExpense));
          setSalesData(apiSales.map(normalizeSale));
        }
      } catch {
        if (!cancelled) {
          setExpensesData(EXPENSES);
          setSalesData(SALES);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [branchFilter, selectedDate]);

  const todayExpList  = getTodayExpenses(expensesData, branchFilter);
  const todayExpTotal = expenseTotal(todayExpList);

  const todaySales = salesData.filter(s => (s.date ?? '').split('T')[0] === selectedDate && s.status === 'paid');
  const todaySalesTotal = todaySales.reduce((s, sale) => s + sale.total, 0);

  const todayReturns = 0;
  const netDailyRevenue = todaySalesTotal - todayExpTotal - todayReturns;
  const monthExpList = getMonthExpenses(expensesData, branchFilter);
  const monthExpTotal = expenseTotal(monthExpList);

  const monthSalesTotal = salesData
    .filter(s => (s.date ?? '').split('T')[0].slice(0, 7) === selectedDate.slice(0, 7))
    .reduce((s, sale) => s + sale.total, 0);
  const monthProfit = monthSalesTotal - monthExpTotal;

  const paymentBreakdown = Object.entries(EXPENSE_PAYMENT_LABELS).map(([key, label]) => ({
    name: label,
    value: todayExpList.filter(e => e.paymentMethod === key).reduce((s, e) => s + e.amount, 0),
  })).filter(p => p.value > 0);

  const categoryBreakdown = getCategoryBreakdown(monthExpList).slice(0, 6);
  const branchBreakdown   = getBranchBreakdown(getMonthExpenses(expensesData));

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cairo', sans-serif; direction: rtl; margin: 30px; }
          h1 { color: #7C3AED; } h2 { color: #374151; font-size: 16px; }
          .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 15px; margin: 10px 0; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
          .positive { color: #059669; font-weight: 900; } .negative { color: #dc2626; font-weight: 900; }
          .total { font-size: 20px; font-weight: 900; color: #7C3AED; }
        </style>
      </head><body>
        <h1>سي تكنولوجي ستور — الخزنة اليومية</h1>
        <p>التاريخ: ${selectedDate} | الفرع: ${filterBranch}</p>
        <div class="card">
          <div class="row"><span>إجمالي المبيعات اليومية</span><span class="positive">${formatCurrency(todaySalesTotal)}</span></div>
          <div class="row"><span>إجمالي المصروفات اليومية</span><span class="negative">- ${formatCurrency(todayExpTotal)}</span></div>
          <div class="row"><span>إجمالي المرتجعات</span><span class="negative">- ${formatCurrency(todayReturns)}</span></div>
          <div class="row" style="border:0"><span>صافي الإيراد اليومي</span><span class="${netDailyRevenue >= 0 ? 'positive' : 'negative'} total">${formatCurrency(netDailyRevenue)}</span></div>
        </div>
        <h2>تفاصيل المصروفات اليومية</h2>
        ${todayExpList.map(e => `<div class="row"><span>${e.description} (${e.categoryName})</span><span class="negative">${formatCurrency(e.amount)}</span></div>`).join('')}
      </body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div>
      {isLoading && <div className="mb-4 text-sm text-gray-500">جارٍ تحميل التدفقات النقدية...</div>}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">الخزنة اليومية</h1>
          <p className="text-gray-500 text-sm mt-0.5">التدفق النقدي اليومي والشهري</p>
        </div>
        <div className="flex items-center gap-2 mr-auto">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED] bg-white" />
          <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED] bg-white">
            <option value="الكل">كل الفروع</option>
            {BRANCHES.map(b => <option key={b.id}>{b.name}</option>)}
          </select>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border border-[#7C3AED] text-[#7C3AED] rounded-xl text-sm font-semibold hover:bg-purple-50 transition-all">
            <Printer size={15} />
            طباعة
          </button>
        </div>
      </div>

      {/* Daily Cash Summary */}
      <div className="bg-gradient-to-l from-[#7C3AED]/10 to-[#06B6D4]/5 rounded-2xl border border-purple-100 p-5 mb-5">
        <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2">
          <Wallet size={18} className="text-[#7C3AED]" />
          ملخص الخزنة اليومية — {selectedDate}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'إجمالي المبيعات',   value: formatCurrency(todaySalesTotal),   color: 'text-green-600',  bg: 'bg-green-50',  icon: <ArrowUpRight size={16} className="text-green-500" /> },
            { label: 'إجمالي المصروفات',  value: formatCurrency(todayExpTotal),    color: 'text-red-600',    bg: 'bg-red-50',    icon: <ArrowDownRight size={16} className="text-red-500" /> },
            { label: 'إجمالي المرتجعات',  value: formatCurrency(todayReturns),     color: 'text-orange-500', bg: 'bg-orange-50', icon: <TrendingDown size={16} className="text-orange-400" /> },
            { label: 'صافي الإيراد',       value: formatCurrency(netDailyRevenue),  color: netDailyRevenue >= 0 ? 'text-[#7C3AED]' : 'text-red-600', bg: 'bg-purple-50', icon: <DollarSign size={16} className="text-[#7C3AED]" /> },
            { label: 'صافي النقدية الحالية', value: formatCurrency(netDailyRevenue), color: netDailyRevenue >= 0 ? 'text-emerald-600' : 'text-red-600', bg: 'bg-emerald-50', icon: <Wallet size={16} className="text-emerald-500" /> },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-1">{s.icon}</div>
              <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Formula display */}
        <div className="mt-4 p-3 bg-white/70 rounded-xl text-sm text-center text-gray-600">
          <span className="font-semibold text-green-600">{formatCurrency(todaySalesTotal)}</span>
          <span className="mx-2 text-gray-400">—</span>
          <span className="font-semibold text-red-500">{formatCurrency(todayExpTotal)}</span>
          <span className="mx-2 text-gray-400">—</span>
          <span className="font-semibold text-orange-500">{formatCurrency(todayReturns)}</span>
          <span className="mx-2 text-gray-400">=</span>
          <span className={`font-black text-lg ${netDailyRevenue >= 0 ? 'text-[#7C3AED]' : 'text-red-600'}`}>{formatCurrency(netDailyRevenue)}</span>
          <span className="text-gray-400 mr-2">صافي الإيراد اليومي</span>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Revenue vs Expenses */}
        {/* Revenue chart — single series */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4">الإيرادات الشهرية</h3>
          <SimpleBarChart
            data={COMPARE_DATA.map(d => ({ label: d.month, value: d.الإيرادات }))}
            color="#7C3AED" height={220} valueFormatter={v => formatCurrency(v)}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4">المصروفات الشهرية</h3>
          <SimpleBarChart
            data={MONTHLY_EXPENSE_TREND.map(r => ({ label: r.month, value: r.amount }))}
            color="#F97316" height={220} valueFormatter={v => formatCurrency(v)}
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4">المصروفات حسب الفئة</h3>
          <SimplePieChart data={categoryBreakdown} valueFormatter={v => formatCurrency(v)} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4">المصروفات حسب الفرع</h3>
          <SimpleBarChart
            data={branchBreakdown.map(b => ({ label: b.name.replace('فرع ', ''), value: b.value }))}
            color="#EC4899" height={200} valueFormatter={v => formatCurrency(v)}
          />
        </div>

        {/* Monthly P&L Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4">ملخص الربح والخسارة — يونيو</h3>
          <div className="space-y-3">
            {[
              { label: 'إجمالي المبيعات',     value: monthSalesTotal,           color: 'text-green-600',  sign: '+' },
              { label: 'إجمالي المرتجعات',    value: 0,                          color: 'text-orange-500', sign: '—' },
              { label: 'إجمالي المصروفات',    value: monthExpTotal,              color: 'text-red-500',    sign: '—' },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">{r.label}</span>
                <span className={`font-bold text-sm ${r.color}`}>{r.sign} {formatCurrency(r.value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-3 bg-gradient-to-l from-[#7C3AED]/10 to-transparent rounded-xl px-3">
              <span className="font-black text-gray-800">صافي الربح</span>
              <span className={`font-black text-xl ${monthProfit >= 0 ? 'text-[#7C3AED]' : 'text-red-600'}`}>
                {formatCurrency(monthProfit)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>هامش الربح</span>
              <span className="font-semibold text-green-600">
                {monthSalesTotal > 0 ? ((monthProfit / monthSalesTotal) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Expenses Detail Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">تفاصيل مصروفات اليوم</h3>
          <span className="text-sm font-black text-orange-600">{formatCurrency(todayExpTotal)}</span>
        </div>
        {todayExpList.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">لا توجد مصروفات معتمدة لهذا اليوم</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['الفئة', 'البيان', 'الفرع', 'المبلغ', 'طريقة الدفع'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-gray-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {todayExpList.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{e.categoryName}</td>
                  <td className="px-4 py-3 text-gray-600">{e.description}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{e.branchName}</td>
                  <td className="px-4 py-3 font-bold text-orange-600">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{EXPENSE_PAYMENT_LABELS[e.paymentMethod]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
