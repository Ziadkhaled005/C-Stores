import { useEffect, useState } from 'react';
import { Plus, Search, Printer, Eye, X, Check, ShoppingBag, FileText } from 'lucide-react';
import { PURCHASES, SUPPLIERS, PRODUCTS, Purchase, PurchaseItem, formatCurrency, STATUS_LABELS, Supplier, Product } from '../../data';
import { createPurchase, getProducts, getPurchases, getSuppliers, updatePurchaseStatus } from '../../api';

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50';

const STATUS_COLORS: Record<string, string> = {
  received: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  partial: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
};

let purchaseCounter = 13;

const normalizePurchase = (value: any): Purchase => ({
  id: value?.id ?? value?.purchaseId ?? '',
  type: value?.type === 'invoice' ? 'invoice' : 'order',
  supplierId: value?.supplierId ?? value?.supplier?.id ?? '',
  supplierName: value?.supplierName ?? value?.supplier?.name ?? value?.supplier?.companyName ?? '',
  date: value?.date ?? value?.createdAt?.split('T')[0] ?? new Date().toISOString().split('T')[0],
  items: Array.isArray(value?.items) ? value.items.map((item: any) => ({
    productId: item?.productId ?? item?.product?.id ?? '',
    productName: item?.productName ?? item?.product?.name ?? '',
    sku: item?.sku ?? item?.product?.sku ?? '',
    quantity: Number(item?.quantity ?? 1),
    unitCost: Number(item?.unitCost ?? item?.costPrice ?? item?.price ?? 0),
    total: Number(item?.total ?? (Number(item?.quantity ?? 1) * Number(item?.unitCost ?? item?.costPrice ?? item?.price ?? 0))),
  })) : [],
  subtotal: Number(value?.subtotal ?? value?.amount ?? 0),
  taxAmount: Number(value?.taxAmount ?? 0),
  total: Number(value?.total ?? value?.amount ?? 0),
  status: value?.status === 'received' ? 'received' : value?.status === 'partial' ? 'partial' : value?.status === 'cancelled' ? 'cancelled' : 'pending',
  notes: value?.notes ?? '',
});

const normalizeSupplier = (value: any): Supplier => ({
  id: value?.id ?? value?.supplierId ?? '',
  name: value?.name ?? value?.companyName ?? '',
  phone: value?.phone ?? '',
  email: value?.email ?? '',
  address: value?.address ?? '',
  notes: value?.notes ?? '',
  totalOrders: Number(value?.totalOrders ?? value?.ordersCount ?? 0),
});

const normalizeProduct = (value: any): Product => ({
  id: value?.id ?? value?.productId ?? '',
  name: value?.name ?? '',
  sku: value?.sku ?? '',
  barcode: value?.barcode ?? '',
  brand: value?.brand ?? '',
  category: value?.category ?? '',
  costPrice: Number(value?.costPrice ?? value?.cost ?? 0),
  sellingPrice: Number(value?.sellingPrice ?? value?.price ?? 0),
  quantity: Number(value?.quantity ?? value?.stock ?? 0),
  reorderLevel: Number(value?.reorderLevel ?? 0),
});

export function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>(PURCHASES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [tab, setTab] = useState<'order' | 'invoice'>('order');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);
  const [createType, setCreateType] = useState<'order' | 'invoice'>('order');
  const [form, setForm] = useState({ supplierId: '', notes: '', taxRate: 14 });
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [apiPurchases, apiSuppliers, apiProducts] = await Promise.all([
          getPurchases(),
          getSuppliers(),
          getProducts(),
        ]);
        if (!cancelled) {
          setPurchases(apiPurchases.map(normalizePurchase));
          setSuppliers(apiSuppliers.map(normalizeSupplier));
          setProducts(apiProducts.map(normalizeProduct));
          setStatusMessage('');
        }
      } catch {
        if (!cancelled) {
          setPurchases(PURCHASES);
          setSuppliers(SUPPLIERS);
          setProducts(PRODUCTS);
          setStatusMessage('تم استخدام البيانات المحلية بسبب عدم توفر الخادم حالياً.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = purchases.filter(p => p.type === tab && (!search || p.supplierName.includes(search) || p.id.includes(search)));

  const addItem = () => {
    const p = products[0] ?? PRODUCTS[0];
    setItems(prev => [...prev, { productId: p.id, productName: p.name, sku: p.sku, quantity: 1, unitCost: p.costPrice, total: p.costPrice }]);
  };

  const updateItem = (i: number, field: keyof PurchaseItem, value: any) => {
    setItems(prev => {
      const next = [...prev];
      const item = { ...next[i], [field]: value };
      if (field === 'productId') {
        const p = products.find(p => p.id === value) ?? PRODUCTS.find(p => p.id === value);
        if (p) { item.productName = p.name; item.sku = p.sku; item.unitCost = p.costPrice; }
      }
      item.total = item.quantity * item.unitCost;
      next[i] = item;
      return next;
    });
  };

  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = (subtotal * form.taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleCreate = async () => {
    if (!form.supplierId || items.length === 0) return;
    const supplier = suppliers.find(s => s.id === form.supplierId);
    const prefix = createType === 'order' ? 'PO' : 'PI';
    const payload = {
      type: createType,
      supplierId: form.supplierId,
      supplierName: supplier?.name || '',
      date: new Date().toISOString().split('T')[0],
      items: items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        sku: i.sku,
        quantity: i.quantity,
        unitCost: i.unitCost,
        total: i.total,
      })),
      subtotal,
      taxAmount,
      total,
      status: createType === 'order' ? 'pending' : 'received',
      notes: form.notes,
    };
    try {
      const created = await createPurchase(payload);
      const newPurchase = normalizePurchase(created ?? payload);
      setPurchases(prev => [newPurchase, ...prev]);
      setShowCreate(false);
      setItems([]);
      setForm({ supplierId: '', notes: '', taxRate: 14 });
      setStatusMessage('تم إنشاء الطلب بنجاح.');
    } catch {
      const fallbackPurchase: Purchase = {
        id: `${prefix}-2026-${String(purchaseCounter++).padStart(3, '0')}`,
        type: createType,
        supplierId: form.supplierId,
        supplierName: supplier?.name || '',
        date: new Date().toISOString().split('T')[0],
        items,
        subtotal,
        taxAmount,
        total,
        status: createType === 'order' ? 'pending' : 'received',
        notes: form.notes,
      };
      setPurchases(prev => [fallbackPurchase, ...prev]);
      setShowCreate(false);
      setItems([]);
      setForm({ supplierId: '', notes: '', taxRate: 14 });
      setStatusMessage('تم حفظ الطلب محلياً لأن الخادم غير متاح حالياً.');
    }
  };

  const handlePrint = (p: Purchase) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cairo', sans-serif; direction: rtl; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: right; }
          th { background: #f5f5f5; font-weight: 700; }
          .total { font-size: 20px; font-weight: 900; }
        </style>
      </head><body>
        <h1>سي تكنولوجي ستور - أمر شراء</h1>
        <p><strong>رقم:</strong> ${p.id} | <strong>التاريخ:</strong> ${p.date}</p>
        <p><strong>المورد:</strong> ${p.supplierName}</p>
        <table>
          <thead><tr><th>المنتج</th><th>الكمية</th><th>سعر التكلفة</th><th>الإجمالي</th></tr></thead>
          <tbody>${p.items.map(i => `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>${formatCurrency(i.unitCost)}</td><td>${formatCurrency(i.total)}</td></tr>`).join('')}</tbody>
        </table>
        <p>المجموع: ${formatCurrency(p.subtotal)}</p>
        <p>الضريبة: ${formatCurrency(p.taxAmount)}</p>
        <p class="total">الإجمالي: ${formatCurrency(p.total)}</p>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const updateStatus = async (id: string, status: Purchase['status']) => {
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    try {
      await updatePurchaseStatus(id, status);
    } catch {
      setStatusMessage('تم تحديث الحالة محلياً لأن الخادم غير متاح حالياً.');
    }
  };

  return (
    <div>
      {statusMessage && (
        <div className="mb-4 rounded-xl border border-purple-100 bg-purple-50 px-4 py-2 text-sm text-purple-700">{statusMessage}</div>
      )}
      {loading && (
        <div className="mb-4 text-sm text-gray-500">جارٍ تحميل المشتريات...</div>
      )}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">المشتريات</h1>
          <p className="text-gray-500 text-sm mt-0.5">{purchases.length} سجل شراء</p>
        </div>
        <button
          onClick={() => { setCreateType(tab); setItems([]); setForm({ supplierId: '', notes: '', taxRate: 14 }); setShowCreate(true); }}
          className="mr-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-semibold text-sm hover:opacity-90 shadow-lg shadow-purple-500/30"
        >
          <Plus size={16} />
          {tab === 'order' ? 'أمر شراء جديد' : 'فاتورة شراء جديدة'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'إجمالي المشتريات', value: formatCurrency(purchases.reduce((s, p) => s + p.total, 0)), c: 'text-purple-700' },
          { label: 'طلبات مستلمة', value: purchases.filter(p => p.status === 'received').length, c: 'text-green-600' },
          { label: 'طلبات معلقة', value: purchases.filter(p => p.status === 'pending').length, c: 'text-yellow-600' },
          { label: 'الموردون', value: SUPPLIERS.length, c: 'text-teal-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`text-xl font-black mb-1 ${s.c}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 px-4 pt-4 gap-2">
          {[
            { key: 'order' as const, label: 'أوامر الشراء', icon: ShoppingBag },
            { key: 'invoice' as const, label: 'فواتير الشراء', icon: FileText },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold border-b-2 transition-all -mb-px ${
                tab === key ? 'border-[#7C3AED] text-[#7C3AED] bg-purple-50' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={14} />
              {label}
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{purchases.filter(p => p.type === key).length}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['رقم الطلب', 'المورد', 'التاريخ', 'الإجمالي', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-700 font-semibold">{p.id}</td>
                  <td className="px-4 py-3 text-gray-700">{p.supplierName}</td>
                  <td className="px-4 py-3 text-gray-500">{p.date}</td>
                  <td className="px-4 py-3 font-black text-[#7C3AED]">{formatCurrency(p.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={p.status}
                      onChange={e => updateStatus(p.id, e.target.value as Purchase['status'])}
                      className={`px-2 py-0.5 rounded-lg text-xs font-semibold border-0 cursor-pointer ${STATUS_COLORS[p.status]}`}
                    >
                      {['received', 'pending', 'partial', 'cancelled'].map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewPurchase(p)} className="text-gray-400 hover:text-teal-500"><Eye size={15} /></button>
                      <button onClick={() => handlePrint(p)} className="text-gray-400 hover:text-[#7C3AED]"><Printer size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">لا توجد سجلات</div>}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-gray-800">{createType === 'order' ? 'أمر شراء جديد' : 'فاتورة شراء جديدة'}</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">المورد *</label>
                  <select value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} className={inputCls}>
                    <option value="">اختر مورد</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">نسبة الضريبة %</label>
                  <input type="number" value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: Number(e.target.value) }))} className={inputCls} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-600">المنتجات *</label>
                  <button onClick={addItem} className="flex items-center gap-1 text-xs text-[#7C3AED] hover:underline"><Plus size={12} />إضافة</button>
                </div>
                {items.length === 0 ? (
                  <div className="py-6 text-center text-gray-300 text-sm border border-dashed border-gray-200 rounded-xl">اضغط "إضافة" لإدراج منتج</div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                        <select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)} className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none">
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="number" value={item.quantity} min={1} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} className="w-14 text-center text-xs border border-gray-200 rounded-lg py-1.5" placeholder="كمية" />
                        <input type="number" value={item.unitCost} min={0} onChange={e => updateItem(i, 'unitCost', Number(e.target.value))} className="w-28 text-center text-xs border border-gray-200 rounded-lg py-1.5" placeholder="التكلفة" />
                        <span className="text-xs font-bold text-[#7C3AED] w-24 text-left">{formatCurrency(item.total)}</span>
                        <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-400"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">ملاحظات</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={`${inputCls} resize-none h-16`} />
              </div>
              {items.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                  <div className="flex justify-between text-gray-600"><span>المجموع</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>الضريبة ({form.taxRate}%)</span><span>{formatCurrency(taxAmount)}</span></div>
                  <div className="flex justify-between font-black text-gray-800 pt-1 border-t border-gray-200"><span>الإجمالي</span><span className="text-[#7C3AED]">{formatCurrency(total)}</span></div>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">إلغاء</button>
              <button onClick={handleCreate} disabled={!form.supplierId || items.length === 0} className="flex-1 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-bold text-sm disabled:opacity-40">
                <Check size={14} className="inline ml-1" />
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Purchase Modal */}
      {viewPurchase && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewPurchase(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-gray-800">{viewPurchase.id}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => handlePrint(viewPurchase)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#7C3AED] text-[#7C3AED] rounded-xl text-xs font-semibold hover:bg-purple-50">
                  <Printer size={13} />طباعة
                </button>
                <button onClick={() => setViewPurchase(null)}><X size={18} className="text-gray-400" /></button>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div><span className="text-gray-400">المورد: </span><span className="font-semibold">{viewPurchase.supplierName}</span></div>
                <div><span className="text-gray-400">التاريخ: </span><span className="font-semibold">{viewPurchase.date}</span></div>
                <div>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${STATUS_COLORS[viewPurchase.status]}`}>
                    {STATUS_LABELS[viewPurchase.status]}
                  </span>
                </div>
              </div>
              <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden mb-4">
                <thead className="bg-gray-50">
                  <tr>{['المنتج', 'كمية', 'التكلفة', 'إجمالي'].map(h => <th key={h} className="px-3 py-2 text-right text-gray-500 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {viewPurchase.items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2.5 text-gray-700">{item.productName}</td>
                      <td className="px-3 py-2.5 text-center">{item.quantity}</td>
                      <td className="px-3 py-2.5">{formatCurrency(item.unitCost)}</td>
                      <td className="px-3 py-2.5 font-semibold text-[#7C3AED]">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600"><span>المجموع</span><span>{formatCurrency(viewPurchase.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>الضريبة</span><span>{formatCurrency(viewPurchase.taxAmount)}</span></div>
                <div className="flex justify-between font-black text-gray-800 pt-1 border-t"><span>الإجمالي</span><span className="text-[#7C3AED]">{formatCurrency(viewPurchase.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
