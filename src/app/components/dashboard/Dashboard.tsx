import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Package,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Building2,
} from "lucide-react";
import { PRODUCTS, SALES, REVENUE_DATA, formatCurrency } from "../../data";
import { useBranchStore } from "../../store";
import { getBranchStock, BRANCH_STOCKS } from "../../branchData";
import {
    EXPENSES,
    getTodayExpenses,
    getMonthExpenses,
    expenseTotal,
} from "../../expenseData";
import { getDashboardStats } from "../../api";
import { SimpleBarChart } from "../ui/SimpleBarChart";

const STATUS_COLORS: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    draft: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-100 text-red-600",
    approved: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-600",
};
const STATUS_LABELS: Record<string, string> = {
    paid: "مدفوع",
    pending: "معلق",
    draft: "مسودة",
    cancelled: "ملغي",
    approved: "موافق عليه",
    rejected: "مرفوض",
};

export function Dashboard() {
    const navigate = useNavigate();
    const { currentBranch } = useBranchStore();
    const [dashboardStats, setDashboardStats] = useState<any>(null);

    // Branch-specific stock quantities
    const branchStockMap = (productId: string) =>
        getBranchStock(currentBranch.id, productId, BRANCH_STOCKS);
    const lowStock = PRODUCTS.filter(
        (p) => branchStockMap(p.id) <= p.reorderLevel,
    );

    useEffect(() => {
        let isMounted = true;

        getDashboardStats(currentBranch.id)
            .then((stats) => {
                if (isMounted) setDashboardStats(stats);
            })
            .catch(() => {
                if (isMounted) setDashboardStats(null);
            });

        return () => {
            isMounted = false;
        };
    }, [currentBranch.id]);

    const todaySales =
        dashboardStats?.recentSales?.filter(
            (s: any) => s.status?.toLowerCase() === "paid",
        ) ?? [];
    const todayRevenue = dashboardStats?.todaySales ?? 0;
    const monthRevenue =
        dashboardStats?.monthlySales ?? REVENUE_DATA[5].revenue;
    const totalOrders =
        dashboardStats?.totalOrders ??
        SALES.filter((s) => s.type === "invoice").length;
    const totalProducts = dashboardStats?.totalProducts ?? PRODUCTS.length;
    const lowStockCount = dashboardStats?.lowStockCount ?? lowStock.length;

    const todayExpenses =
        dashboardStats?.todayExpenses ??
        expenseTotal(getTodayExpenses(EXPENSES));
    const monthExpenses =
        dashboardStats?.monthlyExpenses ??
        expenseTotal(getMonthExpenses(EXPENSES));
    const todayNetProfit =
        dashboardStats?.todayNetProfit ?? todayRevenue - todayExpenses;
    const monthNetProfit = monthRevenue - monthExpenses;
    const recentSales = dashboardStats?.recentSales ?? SALES.slice(0, 6);

    const topProducts = [
        { name: "لابتوب Dell Inspiron", sales: 42, revenue: 797958 },
        { name: 'شاشة Dell 24"', sales: 38, revenue: 227962 },
        { name: "لابتوب HP Pavilion", sales: 31, revenue: 495969 },
        { name: "لابتوب Dell XPS 13", sales: 18, revenue: 629982 },
        { name: "طابعة HP LaserJet", sales: 25, revenue: 119975 },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-800">
                        لوحة التحكم
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 text-sm">
                            الخميس، ١٨ يونيو ٢٠٢٦
                        </p>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1 text-sm text-[#7C3AED]">
                            <Building2 size={12} />
                            <span className="font-semibold">
                                {currentBranch.name}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/pos")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-purple-500/30">
                    <ShoppingCart size={16} />
                    نقطة البيع
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard
                    title="مبيعات اليوم"
                    value={formatCurrency(todayRevenue)}
                    sub={`${todaySales.length} فاتورة اليوم`}
                    icon={<TrendingUp size={20} />}
                    color="purple"
                    trend={+12}
                />
                <KpiCard
                    title="مبيعات الشهر"
                    value={formatCurrency(monthRevenue)}
                    sub="يونيو ٢٠٢٦"
                    icon={<TrendingUp size={20} />}
                    color="teal"
                    trend={+14}
                />
                <KpiCard
                    title="إجمالي الطلبات"
                    value={totalOrders.toString()}
                    sub="فاتورة مكتملة"
                    icon={<ShoppingCart size={20} />}
                    color="pink"
                    trend={+8}
                />
                <KpiCard
                    title="المنتجات"
                    value={totalProducts.toString()}
                    sub={`${lowStockCount} منتج نفد`}
                    icon={<Package size={20} />}
                    color="orange"
                    trend={0}
                />
            </div>

            {/* Expense KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                <KpiCard
                    title="مصروفات اليوم"
                    value={formatCurrency(todayExpenses)}
                    sub="المصروفات المعتمدة اليوم"
                    icon={<TrendingDown size={20} />}
                    color="orange"
                    trend={0}
                />
                <KpiCard
                    title="مصروفات الشهر"
                    value={formatCurrency(monthExpenses)}
                    sub="يونيو ٢٠٢٦"
                    icon={<TrendingDown size={20} />}
                    color="pink"
                    trend={0}
                />
                <KpiCard
                    title="صافي أرباح اليوم"
                    value={formatCurrency(todayNetProfit)}
                    sub="مبيعات — مصروفات"
                    icon={<TrendingUp size={20} />}
                    color="teal"
                    trend={todayNetProfit > 0 ? 5 : -5}
                />
                <KpiCard
                    title="صافي أرباح الشهر"
                    value={formatCurrency(monthNetProfit)}
                    sub="إجمالي شهر يونيو"
                    icon={<TrendingUp size={20} />}
                    color="purple"
                    trend={monthNetProfit > 0 ? 10 : -10}
                />
            </div>

            {/* Approval Status Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    {
                        label: "مصروفات قيد الانتظار",
                        count:
                            dashboardStats?.pendingExpensesCount ??
                            EXPENSES.filter(
                                (e) => e.status === "pending" && !e.isArchived,
                            ).length,
                        color: "text-yellow-600",
                        bg: "bg-yellow-50",
                        dot: "🟡",
                    },
                    {
                        label: "مصروفات معتمدة",
                        count:
                            dashboardStats?.approvedExpensesCount ??
                            EXPENSES.filter(
                                (e) => e.status === "approved" && !e.isArchived,
                            ).length,
                        color: "text-green-600",
                        bg: "bg-green-50",
                        dot: "🟢",
                    },
                    {
                        label: "مصروفات مرفوضة",
                        count:
                            dashboardStats?.rejectedExpensesCount ??
                            EXPENSES.filter(
                                (e) => e.status === "rejected" && !e.isArchived,
                            ).length,
                        color: "text-red-600",
                        bg: "bg-red-50",
                        dot: "🔴",
                    },
                ].map((s) => (
                    <div
                        key={s.label}
                        className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
                        <div className={`text-2xl font-black mb-1 ${s.color}`}>
                            {s.dot} {s.count}
                        </div>
                        <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800">
                            الإيرادات الشهرية
                        </h3>
                        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
                            ٢٠٢٦
                        </span>
                    </div>
                    <SimpleBarChart
                        data={REVENUE_DATA.map((r) => ({
                            label: r.month,
                            value: r.revenue,
                        }))}
                        color="#7C3AED"
                        height={180}
                        valueFormatter={(v) => formatCurrency(v)}
                    />
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800">
                            الأرباح الشهرية
                        </h3>
                        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
                            ٢٠٢٦
                        </span>
                    </div>
                    <SimpleBarChart
                        data={REVENUE_DATA.map((r) => ({
                            label: r.month,
                            value: r.profit,
                        }))}
                        color="#06B6D4"
                        height={180}
                        valueFormatter={(v) => formatCurrency(v)}
                    />
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">
                        أعلى المبيعات (وحدة)
                    </h3>
                    <SimpleBarChart
                        data={topProducts.map((p) => ({
                            label: p.name.split(" ").slice(0, 2).join(" "),
                            value: p.sales,
                        }))}
                        color="#EC4899"
                        height={180}
                        valueFormatter={(v) => `${v} وحدة`}
                    />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-3 gap-4">
                {/* Recent Invoices */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">
                            آخر الفواتير
                        </h3>
                        <button
                            onClick={() => navigate("/sales")}
                            className="text-xs text-[#7C3AED] hover:underline flex items-center gap-1">
                            <Eye size={12} />
                            عرض الكل
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-right text-gray-500 font-semibold">
                                        رقم الفاتورة
                                    </th>
                                    <th className="px-5 py-3 text-right text-gray-500 font-semibold">
                                        العميل
                                    </th>
                                    <th className="px-5 py-3 text-right text-gray-500 font-semibold">
                                        المبلغ
                                    </th>
                                    <th className="px-5 py-3 text-right text-gray-500 font-semibold">
                                        الحالة
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentSales.slice(0, 6).map((sale: any) => (
                                    <tr
                                        key={sale.documentNumber ?? sale.id}
                                        className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 font-mono text-gray-700">
                                            {sale.documentNumber ?? sale.id}
                                        </td>
                                        <td className="px-5 py-3 text-gray-700">
                                            {sale.customerName}
                                        </td>
                                        <td className="px-5 py-3 font-semibold text-gray-800">
                                            {formatCurrency(sale.total)}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-lg text-xs font-semibold ${STATUS_COLORS[(sale.status ?? "").toLowerCase()] ?? "bg-gray-100 text-gray-600"}`}>
                                                {STATUS_LABELS[
                                                    (
                                                        sale.status ?? ""
                                                    ).toLowerCase()
                                                ] ?? sale.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                        <AlertTriangle
                            size={16}
                            className="text-orange-500"
                        />
                        <h3 className="font-bold text-gray-800">
                            تنبيهات المخزون
                        </h3>
                        {lowStock.length > 0 && (
                            <span className="mr-auto bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                {lowStock.length}
                            </span>
                        )}
                    </div>
                    <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                        {lowStock.length === 0 ? (
                            <div className="px-5 py-8 text-center text-gray-400 text-sm">
                                المخزون في حالة جيدة ✓
                            </div>
                        ) : (
                            lowStock.map((p) => {
                                const qty = branchStockMap(p.id);
                                return (
                                    <div
                                        key={p.id}
                                        className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-gray-700 truncate">
                                                {p.name}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {p.category}
                                            </div>
                                        </div>
                                        <span
                                            className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${qty === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                                            {qty} متبقي
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className="px-5 py-3 border-t border-gray-100">
                        <button
                            onClick={() => navigate("/products")}
                            className="w-full py-2 text-sm text-[#7C3AED] font-semibold hover:bg-purple-50 rounded-xl transition-all">
                            إدارة المخزون
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({
    title,
    value,
    sub,
    icon,
    color,
    trend,
}: {
    title: string;
    value: string;
    sub: string;
    icon: ReactNode;
    color: "purple" | "teal" | "pink" | "orange";
    trend: number;
}) {
    const colors = {
        purple: {
            bg: "bg-[#7C3AED]/10",
            text: "text-[#7C3AED]",
            icon: "bg-[#7C3AED]",
        },
        teal: {
            bg: "bg-[#06B6D4]/10",
            text: "text-[#06B6D4]",
            icon: "bg-[#06B6D4]",
        },
        pink: {
            bg: "bg-[#EC4899]/10",
            text: "text-[#EC4899]",
            icon: "bg-[#EC4899]",
        },
        orange: {
            bg: "bg-[#F97316]/10",
            text: "text-[#F97316]",
            icon: "bg-[#F97316]",
        },
    };
    const c = colors[color];

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
                <div
                    className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center text-white`}>
                    {icon}
                </div>
                {trend !== 0 && (
                    <span
                        className={`flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? "text-green-600" : "text-red-500"}`}>
                        {trend > 0 ? (
                            <ArrowUpRight size={14} />
                        ) : (
                            <ArrowDownRight size={14} />
                        )}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div className="text-2xl font-black text-gray-800 mb-1 leading-tight">
                {value}
            </div>
            <div className="text-sm font-semibold text-gray-600">{title}</div>
            <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
        </div>
    );
}
