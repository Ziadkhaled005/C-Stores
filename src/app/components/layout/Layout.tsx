import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { useAuthStore, useBranchStore } from "../../store";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Truck,
    FileText,
    ShoppingBag,
    BarChart3,
    Settings,
    LogOut,
    Bell,
    Menu,
    X,
    Shield,
    ClipboardList,
    ArrowLeftRight,
    Building2,
    ChevronDown,
    Receipt,
    Wallet,
    Archive,
} from "lucide-react";
import { BRANCHES } from "../../branchData";

const NAV_ITEMS = [
    { path: "/", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
    { path: "/pos", label: "نقطة البيع", icon: ShoppingCart },
    { path: "/products", label: "المخزون", icon: Package },
    { path: "/transfers", label: "تحويل المخزون", icon: ArrowLeftRight },
    { path: "/customers", label: "العملاء", icon: Users },
    { path: "/suppliers", label: "الموردون", icon: Truck },
    { path: "/sales", label: "المبيعات", icon: FileText },
    { path: "/purchases", label: "المشتريات", icon: ShoppingBag },
    { path: "/expenses", label: "المصروفات", icon: Receipt },
    { path: "/cashflow", label: "الخزنة اليومية", icon: Wallet },
    { path: "/expense-archive", label: "أرشيف المصروفات", icon: Archive },
    { path: "/reports", label: "التقارير", icon: BarChart3 },
    { path: "/audit", label: "سجل المراجعة", icon: ClipboardList },
    { path: "/roles", label: "الأدوار والصلاحيات", icon: Shield },
    { path: "/settings", label: "الإعدادات", icon: Settings },
];

const ROLE_LABELS: Record<string, string> = {
    admin: "مدير النظام",
    manager: "مدير",
    cashier: "كاشير",
    sales: "مندوب مبيعات",
    inventory: "موظف مخزن",
};

export function Layout() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { branches, currentBranch, setCurrentBranch, loadBranches } =
        useBranchStore();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [branchDropdown, setBranchDropdown] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) navigate("/login");
        loadBranches();
    }, [isAuthenticated, navigate, loadBranches]);

    if (!isAuthenticated) return null;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    const activeBranches = branches.filter((b) => b.isActive);

    return (
        <div
            dir="rtl"
            className="flex h-screen bg-[#F4F6FB] overflow-hidden"
            style={{ fontFamily: "'Cairo', sans-serif" }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
        fixed lg:static inset-y-0 right-0 z-30
        w-64 flex flex-col bg-gradient-to-b from-[#1E1040] to-[#2D1B69]
        shadow-2xl transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] via-[#EC4899] to-[#F97316] flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-lg">C</span>
                    </div>
                    <div>
                        <div className="text-white font-bold text-base leading-tight">
                            سي تكنولوجي
                        </div>
                        <div className="text-purple-300 text-xs">
                            C Technology Store
                        </div>
                    </div>
                    <button
                        className="mr-auto lg:hidden text-white/60 hover:text-white"
                        onClick={() => setSidebarOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                {/* Branch indicator in sidebar */}
                <div className="px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                        <Building2
                            size={14}
                            className="text-purple-300 flex-shrink-0"
                        />
                        <div className="min-w-0">
                            <div className="text-white text-xs font-semibold truncate">
                                {currentBranch.name}
                            </div>
                            <div className="text-purple-400 text-xs">
                                {currentBranch.code}
                            </div>
                        </div>
                        {currentBranch.isMain && (
                            <span className="mr-auto text-xs bg-[#7C3AED]/40 text-purple-200 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                رئيسي
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                    {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={exact}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200
                ${
                    isActive
                        ? "bg-white/15 text-white shadow-inner font-semibold"
                        : "text-purple-200 hover:bg-white/8 hover:text-white"
                }
              `}>
                            <Icon size={17} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User Info */}
                <div className="px-4 py-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white font-bold text-sm">
                            {user?.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-semibold truncate">
                                {user?.name}
                            </div>
                            <div className="text-purple-300 text-xs">
                                {ROLE_LABELS[user?.role || ""]}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-purple-200 hover:bg-red-500/20 hover:text-red-300 text-sm transition-all">
                        <LogOut size={16} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-3 shadow-sm">
                    <button
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                        onClick={() => setSidebarOpen(true)}>
                        <Menu size={20} />
                    </button>

                    {/* Branch Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setBranchDropdown(!branchDropdown)}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-all">
                            <Building2
                                size={15}
                                className="text-[#7C3AED]"
                            />
                            <span className="text-sm font-semibold text-[#7C3AED]">
                                {currentBranch.name}
                            </span>
                            <ChevronDown
                                size={14}
                                className={`text-[#7C3AED] transition-transform ${branchDropdown ? "rotate-180" : ""}`}
                            />
                        </button>
                        {branchDropdown && (
                            <div className="absolute top-full mt-1 right-0 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-48">
                                {activeBranches.map((branch) => (
                                    <button
                                        key={branch.id}
                                        onClick={() => {
                                            setCurrentBranch(branch);
                                            setBranchDropdown(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-purple-50 transition-all ${currentBranch.id === branch.id ? "bg-purple-50" : ""}`}>
                                        <div
                                            className={`w-2 h-2 rounded-full ${currentBranch.id === branch.id ? "bg-[#7C3AED]" : "bg-gray-200"}`}
                                        />
                                        <div>
                                            <div className="text-sm font-semibold text-gray-700">
                                                {branch.name}
                                            </div>
                                            {branch.isMain && (
                                                <div className="text-xs text-purple-500">
                                                    الفرع الرئيسي
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {branchDropdown && (
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setBranchDropdown(false)}
                            />
                        )}
                    </div>

                    <div className="mr-auto flex items-center gap-3">
                        <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-all">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#7C3AED]/10 cursor-pointer hover:bg-[#7C3AED]/15 transition-all">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white font-bold text-xs">
                                {user?.name.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-[#7C3AED] hidden sm:block">
                                {user?.name}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
