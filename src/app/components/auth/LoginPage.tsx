import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../store";
import { USERS } from "../../data";
import { Eye, EyeOff, Monitor } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
    admin: "مدير النظام",
    manager: "مدير",
    cashier: "كاشير",
    sales: "مندوب مبيعات",
    inventory: "موظف مخزن",
};

export function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);
    const [email, setEmail] = useState("admin@ctech.com");
    const [password, setPassword] = useState("123456");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const ok = await login(email, password);

        setLoading(false);
        if (ok) {
            navigate("/");
        } else {
            setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        }
    };

    const quickLogin = (userEmail: string) => {
        setEmail(userEmail);
        setPassword("123456");
    };

    return (
        <div
            dir="rtl"
            className="min-h-screen flex bg-gradient-to-br from-[#1E1040] via-[#2D1B69] to-[#1E1040]"
            style={{ fontFamily: "'Cairo', sans-serif" }}>
            {/* Left decorative panel */}
            <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-purple-400 blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-cyan-400 blur-3xl"></div>
                </div>
                <div className="relative text-center">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#7C3AED] via-[#EC4899] to-[#F97316] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <span className="text-white font-black text-6xl">
                            C
                        </span>
                    </div>
                    <h1 className="text-white text-4xl font-black mb-3">
                        سي تكنولوجي ستور
                    </h1>
                    <p className="text-purple-300 text-lg mb-8">
                        نظام إدارة المبيعات والمخزون
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {[
                            "نقطة البيع",
                            "إدارة المخزون",
                            "فواتير احترافية",
                            "تقارير شاملة",
                        ].map((f) => (
                            <span
                                key={f}
                                className="px-4 py-2 bg-white/10 text-purple-200 rounded-full text-sm border border-white/10">
                                {f}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Login Form */}
            <div className="flex-1 lg:max-w-md flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    {/* Logo mobile */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#EC4899] to-[#F97316] flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-2xl">
                                C
                            </span>
                        </div>
                        <div className="text-white">
                            <div className="font-bold text-lg">
                                سي تكنولوجي ستور
                            </div>
                            <div className="text-purple-300 text-sm">
                                C Technology Store
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-gray-800 mb-1">
                                مرحباً بك
                            </h2>
                            <p className="text-gray-500 text-sm">
                                سجّل دخولك للمتابعة
                            </p>
                        </div>

                        <form
                            onSubmit={handleLogin}
                            className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    البريد الإلكتروني
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all text-sm bg-gray-50"
                                    placeholder="email@ctech.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    كلمة المرور
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all text-sm bg-gray-50"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPass ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-200">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-bold text-base hover:opacity-90 transition-all disabled:opacity-60 shadow-lg shadow-purple-500/30">
                                {loading
                                    ? "جارٍ تسجيل الدخول..."
                                    : "تسجيل الدخول"}
                            </button>
                        </form>

                        <div className="mt-6">
                            <p className="text-xs text-gray-500 text-center mb-3">
                                دخول سريع للتجربة
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {USERS.map((u) => (
                                    <button
                                        key={u.id}
                                        onClick={() => quickLogin(u.email)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-[#7C3AED] hover:bg-purple-50 transition-all text-right">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-semibold text-gray-700 truncate">
                                                {u.name}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {ROLE_LABELS[u.role]}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <span className="text-purple-300 text-xs flex items-center justify-center gap-1">
                            <Monitor size={12} />
                            سي تكنولوجي ستور © 2026
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
