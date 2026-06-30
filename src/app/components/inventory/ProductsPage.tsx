import { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    AlertTriangle,
    Package,
    Filter,
} from "lucide-react";
import { CATEGORIES, BRANDS, Product, formatCurrency } from "../../data";
import { getProducts } from "../../api";

export function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [filterCat, setFilterCat] = useState("الكل");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState<Partial<Product>>({});
    const [showAdjust, setShowAdjust] = useState<Product | null>(null);
    const [adjustQty, setAdjustQty] = useState(0);
    const [adjustType, setAdjustType] = useState<"in" | "out">("in");

    useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            try {
                const data = await getProducts();
                if (isMounted) {
                    setProducts(
                        data.map((p: any) => ({
                            id: p.id,
                            name: p.name,
                            sku: p.sku,
                            barcode: p.barcode ?? "",
                            brand: p.brand ?? "",
                            category: p.category ?? "",
                            costPrice: Number(p.costPrice) ?? 0,
                            sellingPrice: Number(p.sellingPrice) ?? 0,
                            quantity: Number(p.quantity) ?? 0,
                            reorderLevel: Number(p.reorderLevel) ?? 0,
                        })),
                    );
                }
            } catch {
                if (isMounted) {
                    setProducts([]);
                }
            }
        };

        void loadProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    const filtered = products.filter((p) => {
        const matchSearch =
            !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCat === "الكل" || p.category === filterCat;
        return matchSearch && matchCat;
    });

    const openAdd = () => {
        setEditing(null);
        setForm({
            category: CATEGORIES[0],
            brand: BRANDS[0],
            costPrice: 0,
            sellingPrice: 0,
            quantity: 0,
            reorderLevel: 5,
        });
        setShowModal(true);
    };

    const openEdit = (p: Product) => {
        setEditing(p);
        setForm({ ...p });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!form.name || !form.sku) return;
        if (editing) {
            setProducts((ps) =>
                ps.map((p) =>
                    p.id === editing.id ? ({ ...p, ...form } as Product) : p,
                ),
            );
        } else {
            const newP: Product = {
                id: `p${Date.now()}`,
                name: form.name!,
                sku: form.sku!,
                barcode: form.barcode || "",
                brand: form.brand || BRANDS[0],
                category: form.category || CATEGORIES[0],
                costPrice: Number(form.costPrice) || 0,
                sellingPrice: Number(form.sellingPrice) || 0,
                quantity: Number(form.quantity) || 0,
                reorderLevel: Number(form.reorderLevel) || 5,
            };
            setProducts((ps) => [newP, ...ps]);
        }
        setShowModal(false);
    };

    const handleDelete = (id: string) => {
        if (confirm("هل تريد حذف هذا المنتج؟")) {
            setProducts((ps) => ps.filter((p) => p.id !== id));
        }
    };

    const handleAdjust = () => {
        if (!showAdjust) return;
        setProducts((ps) =>
            ps.map((p) => {
                if (p.id !== showAdjust.id) return p;
                const newQty =
                    adjustType === "in"
                        ? p.quantity + adjustQty
                        : Math.max(0, p.quantity - adjustQty);
                return { ...p, quantity: newQty };
            }),
        );
        setShowAdjust(null);
        setAdjustQty(0);
    };

    const lowStockCount = products.filter(
        (p) => p.quantity <= p.reorderLevel,
    ).length;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-800">
                        إدارة المخزون
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {products.length} منتج • {lowStockCount} منتج بمخزون
                        منخفض
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="mr-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-purple-500/30">
                    <Plus size={16} />
                    إضافة منتج
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {[
                    {
                        label: "إجمالي المنتجات",
                        value: products.length,
                        color: "bg-purple-100 text-purple-700",
                    },
                    {
                        label: "قيمة المخزون",
                        value: formatCurrency(
                            products.reduce(
                                (s, p) => s + p.costPrice * p.quantity,
                                0,
                            ),
                        ),
                        color: "bg-teal-100 text-teal-700",
                    },
                    {
                        label: "مخزون منخفض",
                        value: lowStockCount,
                        color: "bg-orange-100 text-orange-700",
                    },
                    {
                        label: "نفد من المخزون",
                        value: products.filter((p) => p.quantity === 0).length,
                        color: "bg-red-100 text-red-700",
                    },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div
                            className={`text-xl font-black mb-1 ${s.color.split(" ")[1]}`}>
                            {s.value}
                        </div>
                        <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
                    <div className="relative flex-1 min-w-48">
                        <Search
                            size={15}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الكود..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter
                            size={14}
                            className="text-gray-400"
                        />
                        <select
                            value={filterCat}
                            onChange={(e) => setFilterCat(e.target.value)}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50">
                            <option value="الكل">كل الفئات</option>
                            {CATEGORIES.map((c) => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    "المنتج",
                                    "الكود",
                                    "الفئة",
                                    "الماركة",
                                    "سعر الشراء",
                                    "سعر البيع",
                                    "الكمية",
                                    "الحالة",
                                    "إجراءات",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-right text-gray-500 font-semibold whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((p) => (
                                <tr
                                    key={p.id}
                                    className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/20 flex items-center justify-center flex-shrink-0">
                                                <Package
                                                    size={14}
                                                    className="text-[#7C3AED]"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-700">
                                                    {p.name}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {p.barcode || "—"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-gray-600">
                                        {p.sku}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg text-xs font-semibold">
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {p.brand}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {formatCurrency(p.costPrice)}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-[#7C3AED]">
                                        {formatCurrency(p.sellingPrice)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            {p.quantity <= p.reorderLevel &&
                                                p.quantity > 0 && (
                                                    <AlertTriangle
                                                        size={12}
                                                        className="text-orange-500"
                                                    />
                                                )}
                                            {p.quantity === 0 && (
                                                <AlertTriangle
                                                    size={12}
                                                    className="text-red-500"
                                                />
                                            )}
                                            <span
                                                className={`font-bold ${p.quantity === 0 ? "text-red-500" : p.quantity <= p.reorderLevel ? "text-orange-500" : "text-green-600"}`}>
                                                {p.quantity}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                                                p.quantity === 0
                                                    ? "bg-red-100 text-red-600"
                                                    : p.quantity <=
                                                        p.reorderLevel
                                                      ? "bg-orange-100 text-orange-600"
                                                      : "bg-green-100 text-green-600"
                                            }`}>
                                            {p.quantity === 0
                                                ? "نفد"
                                                : p.quantity <= p.reorderLevel
                                                  ? "منخفض"
                                                  : "متوفر"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setShowAdjust(p);
                                                    setAdjustQty(0);
                                                }}
                                                className="text-xs px-2 py-1 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-all">
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="text-gray-400 hover:text-[#7C3AED] transition-colors">
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(p.id)
                                                }
                                                className="text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="py-12 text-center text-gray-400 text-sm">
                            لا توجد منتجات تطابق البحث
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}>
                    <div
                        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b">
                            <h3 className="font-black text-gray-800">
                                {editing ? "تعديل منتج" : "إضافة منتج جديد"}
                            </h3>
                            <button onClick={() => setShowModal(false)}>
                                <X
                                    size={18}
                                    className="text-gray-400"
                                />
                            </button>
                        </div>
                        <div className="p-5 grid grid-cols-2 gap-4">
                            <FormField
                                label="اسم المنتج *"
                                className="col-span-2">
                                <input
                                    type="text"
                                    value={form.name || ""}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            name: e.target.value,
                                        }))
                                    }
                                    className={inputCls}
                                    placeholder="اسم المنتج"
                                />
                            </FormField>
                            <FormField label="كود المنتج (SKU) *">
                                <input
                                    type="text"
                                    value={form.sku || ""}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            sku: e.target.value,
                                        }))
                                    }
                                    className={inputCls}
                                    placeholder="DL-INS-15"
                                />
                            </FormField>
                            <FormField label="الباركود">
                                <input
                                    type="text"
                                    value={form.barcode || ""}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            barcode: e.target.value,
                                        }))
                                    }
                                    className={inputCls}
                                    placeholder="6900000001234"
                                />
                            </FormField>
                            <FormField label="الفئة">
                                <select
                                    value={form.category || ""}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            category: e.target.value,
                                        }))
                                    }
                                    className={inputCls}>
                                    {CATEGORIES.map((c) => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                            </FormField>
                            <FormField label="الماركة">
                                <select
                                    value={form.brand || ""}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            brand: e.target.value,
                                        }))
                                    }
                                    className={inputCls}>
                                    {BRANDS.map((b) => (
                                        <option key={b}>{b}</option>
                                    ))}
                                </select>
                            </FormField>
                            <FormField label="سعر الشراء (EGP)">
                                <input
                                    type="number"
                                    value={form.costPrice || 0}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            costPrice: Number(e.target.value),
                                        }))
                                    }
                                    className={inputCls}
                                    min={0}
                                />
                            </FormField>
                            <FormField label="سعر البيع (EGP)">
                                <input
                                    type="number"
                                    value={form.sellingPrice || 0}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            sellingPrice: Number(
                                                e.target.value,
                                            ),
                                        }))
                                    }
                                    className={inputCls}
                                    min={0}
                                />
                            </FormField>
                            <FormField label="الكمية">
                                <input
                                    type="number"
                                    value={form.quantity || 0}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            quantity: Number(e.target.value),
                                        }))
                                    }
                                    className={inputCls}
                                    min={0}
                                />
                            </FormField>
                            <FormField label="حد إعادة الطلب">
                                <input
                                    type="number"
                                    value={form.reorderLevel || 5}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            reorderLevel: Number(
                                                e.target.value,
                                            ),
                                        }))
                                    }
                                    className={inputCls}
                                    min={0}
                                />
                            </FormField>
                        </div>
                        <div className="flex gap-3 p-5 border-t">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-50">
                                إلغاء
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-bold text-sm hover:opacity-90">
                                {editing ? "حفظ التغييرات" : "إضافة المنتج"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Adjustment Modal */}
            {showAdjust && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowAdjust(null)}>
                    <div
                        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b">
                            <h3 className="font-black text-gray-800">
                                تعديل المخزون
                            </h3>
                            <button onClick={() => setShowAdjust(null)}>
                                <X
                                    size={18}
                                    className="text-gray-400"
                                />
                            </button>
                        </div>
                        <div className="p-5">
                            <p className="font-semibold text-gray-700 mb-4">
                                {showAdjust.name}
                            </p>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm text-gray-500">
                                    الكمية الحالية:
                                </span>
                                <span className="font-black text-[#7C3AED]">
                                    {showAdjust.quantity}
                                </span>
                            </div>
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setAdjustType("in")}
                                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${adjustType === "in" ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-600"}`}>
                                    + إضافة (وارد)
                                </button>
                                <button
                                    onClick={() => setAdjustType("out")}
                                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${adjustType === "out" ? "bg-red-500 text-white border-red-500" : "border-gray-200 text-gray-600"}`}>
                                    - خصم (صادر)
                                </button>
                            </div>
                            <input
                                type="number"
                                value={adjustQty}
                                onChange={(e) =>
                                    setAdjustQty(Number(e.target.value))
                                }
                                className={`${inputCls} mb-4`}
                                placeholder="الكمية"
                                min={0}
                            />
                        </div>
                        <div className="flex gap-3 p-5 border-t">
                            <button
                                onClick={() => setShowAdjust(null)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">
                                إلغاء
                            </button>
                            <button
                                onClick={handleAdjust}
                                className="flex-1 py-2.5 bg-[#7C3AED] text-white rounded-xl font-bold text-sm hover:opacity-90">
                                تأكيد التعديل
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const inputCls =
    "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50";

function FormField({
    label,
    children,
    className = "",
}: {
    label: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}
