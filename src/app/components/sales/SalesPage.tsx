import { useState } from 'react';
import { Plus, Search, Printer, Download, Eye, X, Check, FileText, ShoppingBag, FileCheck } from 'lucide-react';
import { SALES, CUSTOMERS, PRODUCTS, Sale, SaleItem, formatCurrency, PAYMENT_LABELS, STATUS_LABELS } from '../../data';

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50';

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

let saleCounter = 20;

export function SalesPage() {
  const [sales, setSales] = useState<Sale[]>(SALES);
  const [tab, setTab] = useState<'invoice' | 'order' | 'quotation'>('invoice');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [createType, setCreateType] = useState<'invoice' | 'order' | 'quotation'>('invoice');
  const [form, setForm] = useState({ customerId: '', notes: '', paymentMethod: 'cash' as Sale['paymentMethod'], taxRate: 14, discountAmount: 0 });
  const [items, setItems] = useState<SaleItem[]>([]);

  const filtered = sales.filter(s => s.type === tab && (!search || s.customerName.includes(search) || s.id.includes(search)));

  const addItem = () => {
    const p = PRODUCTS[0];
    setItems(prev => [...prev, { productId: p.id, productName: p.name, sku: p.sku, quantity: 1, unitPrice: p.sellingPrice, discount: 0, total: p.sellingPrice }]);
  };

  const updateItem = (i: number, field: keyof SaleItem, value: any) => {
    setItems(prev => {
      const next = [...prev];
      const item = { ...next[i], [field]: value };
      if (field === 'productId') {
        const p = PRODUCTS.find(p => p.id === value);
        if (p) { item.productName = p.name; item.sku = p.sku; item.unitPrice = p.sellingPrice; }
      }
      item.total = item.quantity * item.unitPrice * (1 - item.discount / 100);
      next[i] = item;
      return next;
    });
  };

  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = ((subtotal - form.discountAmount) * form.taxRate) / 100;
  const total = subtotal - form.discountAmount + taxAmount;

  const handleCreate = () => {
    if (!form.customerId || items.length === 0) return;
    const customer = CUSTOMERS.find(c => c.id === form.customerId);
    const prefix = createType === 'invoice' ? 'INV' : createType === 'order' ? 'ORD' : 'QT';
    const newSale: Sale = {
      id: `${prefix}-2026-${String(saleCounter++).padStart(3, '0')}`,
      type: createType,
      customerId: form.customerId,
      customerName: customer?.name || '',
      date: new Date().toISOString().split('T')[0],
      items,
      subtotal,
      discountAmount: form.discountAmount,
      taxRate: form.taxRate,
      taxAmount,
      total,
      paymentMethod: form.paymentMethod,
      status: createType === 'invoice' ? 'paid' : createType === 'order' ? 'pending' : 'draft',
      notes: form.notes,
    };
    setSales(prev => [newSale, ...prev]);
    setShowCreate(false);
    setItems([]);
    setForm({ customerId: '', notes: '', paymentMethod: 'cash', taxRate: 14, discountAmount: 0 });
  };

  const handlePrint = (sale: Sale) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cairo', sans-serif; direction: rtl; margin: 20px; }
          h1 { font-size: 24px; } h2 { font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: right; }
          th { background: #f5f5f5; font-weight: 700; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .total { font-size: 20px; font-weight: 900; }
        </style>
      </head><body>
        <div class="header">
          <div>
            <h1>سي تكنولوجي ستور</h1>
            <p>القاهرة، مصر | 01012345678</p>
          </div>
          <div style="text-align:left">
            <h2>فاتورة مبيعات</h2>
            <p>رقم: ${sale.id}</p>
            <p>التاريخ: ${sale.date}</p>
          </div>
        </div>
        <div style="margin-bottom:15px">
          <strong>العميل:</strong> ${sale.customerName}<br>
          <strong>طريقة الدفع:</strong> ${PAYMENT_LABELS[sale.paymentMethod]}<br>
        </div>
        <table>
          <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الخصم</th><th>الإجمالي</th></tr></thead>
          <tbody>
            ${sale.items.map(i => `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>${formatCurrency(i.unitPrice)}</td><td>${i.discount}%</td><td>${formatCurrency(i.total)}</td></tr>`).join('')}
          </tbody>
        </table>
        <div style="text-align:left; margin-top:15px">
          <p>المجموع الفرعي: ${formatCurrency(sale.subtotal)}</p>
          ${sale.discountAmount > 0 ? `<p>الخصم: - ${formatCurrency(sale.discountAmount)}</p>` : ''}
          <p>ضريبة القيمة المضافة (${sale.taxRate}%): ${formatCurrency(sale.taxAmount)}</p>
          <p class="total">الإجمالي: ${formatCurrency(sale.total)}</p>
        </div>
        ${sale.notes ? `<p style="margin-top:15px"><strong>ملاحظات:</strong> ${sale.notes}</p>` : ''}
      </body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const TABS = [
    { key: 'invoice' as const, label: 'الفواتير', icon: FileCheck },
    { key: 'order' as const, label: 'أوامر البيع', icon: ShoppingBag },
    { key: 'quotation' as const, label: 'عروض الأسعار', icon: FileText },
  ];

  const openCreate = (type: typeof tab) => {
    setCreateType(type);
    setItems([]);
    setForm({ customerId: '', notes: '', paymentMethod: 'cash', taxRate: 14, discountAmount: 0 });
    setShowCreate(true);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">المبيعات</h1>
          <p className="text-gray-500 text-sm mt-0.5">{sales.filter(s => s.type === 'invoice').length} فاتورة • {sales.filter(s => s.type === 'order').length} أمر بيع</p>
        </div>
        <button
          onClick={() => openCreate(tab)}
          className="mr-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-semibold text-sm hover:opacity-90 shadow-lg shadow-purple-500/30"
        >
          <Plus size={16} />
          {tab === 'invoice' ? 'فاتورة جديدة' : tab === 'order' ? 'أمر بيع جديد' : 'عرض سعر جديد'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'مبيعات هذا الشهر', value: formatCurrency(sales.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.total, 0)), c: 'text-purple-700' },
          { label: 'فواتير مدفوعة', value: sales.filter(s => s.status === 'paid').length, c: 'text-green-600' },
          { label: 'طلبات معلقة', value: sales.filter(s => s.status === 'pending').length, c: 'text-yellow-600' },
          { label: 'عروض أسعار', value: sales.filter(s => s.type === 'quotation').length, c: 'text-teal-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`text-xl font-black mb-1 ${s.c}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4 pt-4 gap-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold border-b-2 transition-all -mb-px ${
                tab === key ? 'border-[#7C3AED] text-[#7C3AED] bg-purple-50' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={14} />
              {label}
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {sales.filter(s => s.type === key).length}
              </span>
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
                {['رقم المستند', 'العميل', 'التاريخ', 'الإجمالي', 'طريقة الدفع', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-700 font-semibold">{s.id}</td>
                  <td className="px-4 py-3 text-gray-700">{s.customerName}</td>
                  <td className="px-4 py-3 text-gray-500">{s.date}</td>
                  <td className="px-4 py-3 font-black text-[#7C3AED]">{formatCurrency(s.total)}</td>
                  <td className="px-4 py-3 text-gray-600">{PAYMENT_LABELS[s.paymentMethod]}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewSale(s)} className="text-gray-400 hover:text-teal-500"><Eye size={15} /></button>
                      <button onClick={() => handlePrint(s)} className="text-gray-400 hover:text-[#7C3AED]"><Printer size={15} /></button>
                      <button onClick={() => handlePrint(s)} className="text-gray-400 hover:text-orange-500"><Download size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">لا توجد سجلات</div>
          )}
        </div>
      </div>

      {/* Create Sale Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-gray-800">
                {createType === 'invoice' ? 'فاتورة جديدة' : createType === 'order' ? 'أمر بيع جديد' : 'عرض سعر جديد'}
              </h3>
              <button onClick={() => setShowCreate(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">العميل *</label>
                  <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} className={inputCls}>
                    <option value="">اختر عميل</option>
                    {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">طريقة الدفع</label>
                  <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as Sale['paymentMethod'] }))} className={inputCls}>
                    {Object.entries(PAYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-600">المنتجات *</label>
                  <button onClick={addItem} className="flex items-center gap-1 text-xs text-[#7C3AED] hover:underline">
                    <Plus size={12} />
                    إضافة منتج
                  </button>
                </div>
                {items.length === 0 ? (
                  <div className="py-6 text-center text-gray-300 text-sm border border-dashed border-gray-200 rounded-xl">
                    اضغط "إضافة منتج" لبدء الفاتورة
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                        <select
                          value={item.productId}
                          onChange={e => updateItem(i, 'productId', e.target.value)}
                          className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#7C3AED]"
                        >
                          {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input
                          type="number" value={item.quantity} min={1}
                          onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                          className="w-14 text-center text-xs border border-gray-200 rounded-lg py-1.5 focus:outline-none focus:border-[#7C3AED]"
                          placeholder="كمية"
                        />
                        <input
                          type="number" value={item.unitPrice} min={0}
                          onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))}
                          className="w-24 text-center text-xs border border-gray-200 rounded-lg py-1.5 focus:outline-none focus:border-[#7C3AED]"
                          placeholder="السعر"
                        />
                        <input
                          type="number" value={item.discount} min={0} max={100}
                          onChange={e => updateItem(i, 'discount', Number(e.target.value))}
                          className="w-16 text-center text-xs border border-gray-200 rounded-lg py-1.5 focus:outline-none focus:border-[#7C3AED]"
                          placeholder="خصم%"
                        />
                        <span className="text-xs font-bold text-[#7C3AED] w-24 text-left">{formatCurrency(item.total)}</span>
                        <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-400"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">خصم (EGP)</label>
                  <input type="number" value={form.discountAmount} onChange={e => setForm(f => ({ ...f, discountAmount: Number(e.target.value) }))} className={inputCls} min={0} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">نسبة الضريبة %</label>
                  <input type="number" value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: Number(e.target.value) }))} className={inputCls} min={0} max={100} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">ملاحظات</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={`${inputCls} resize-none h-16`} />
              </div>

              {items.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                  <div className="flex justify-between text-gray-600"><span>المجموع الفرعي</span><span>{formatCurrency(subtotal)}</span></div>
                  {form.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>الخصم</span><span>- {formatCurrency(form.discountAmount)}</span></div>}
                  <div className="flex justify-between text-gray-600"><span>الضريبة ({form.taxRate}%)</span><span>{formatCurrency(taxAmount)}</span></div>
                  <div className="flex justify-between font-black text-gray-800 pt-1 border-t border-gray-200"><span>الإجمالي</span><span className="text-[#7C3AED]">{formatCurrency(total)}</span></div>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">إلغاء</button>
              <button onClick={handleCreate} disabled={!form.customerId || items.length === 0} className="flex-1 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-bold text-sm disabled:opacity-40">
                <Check size={14} className="inline ml-1" />
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Sale Modal */}
      {viewSale && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewSale(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-gray-800">{viewSale.id}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => handlePrint(viewSale)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#7C3AED] text-[#7C3AED] rounded-xl text-xs font-semibold hover:bg-purple-50">
                  <Printer size={13} />
                  طباعة
                </button>
                <button onClick={() => setViewSale(null)}><X size={18} className="text-gray-400" /></button>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div><span className="text-gray-400">العميل: </span><span className="font-semibold">{viewSale.customerName}</span></div>
                <div><span className="text-gray-400">التاريخ: </span><span className="font-semibold">{viewSale.date}</span></div>
                <div><span className="text-gray-400">الدفع: </span><span className="font-semibold">{PAYMENT_LABELS[viewSale.paymentMethod]}</span></div>
                <div>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${STATUS_COLORS[viewSale.status]}`}>
                    {STATUS_LABELS[viewSale.status]}
                  </span>
                </div>
              </div>
              <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    {['المنتج', 'كمية', 'سعر', 'خصم', 'إجمالي'].map(h => (
                      <th key={h} className="px-3 py-2 text-right text-gray-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {viewSale.items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2.5 text-gray-700">{item.productName}</td>
                      <td className="px-3 py-2.5 text-center text-gray-600">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-gray-600">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2.5 text-center text-gray-600">{item.discount}%</td>
                      <td className="px-3 py-2.5 font-semibold text-[#7C3AED]">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 space-y-1 text-sm text-right">
                <div className="flex justify-between text-gray-600"><span>المجموع</span><span>{formatCurrency(viewSale.subtotal)}</span></div>
                {viewSale.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>الخصم</span><span>- {formatCurrency(viewSale.discountAmount)}</span></div>}
                <div className="flex justify-between text-gray-600"><span>الضريبة ({viewSale.taxRate}%)</span><span>{formatCurrency(viewSale.taxAmount)}</span></div>
                <div className="flex justify-between font-black text-gray-800 pt-2 border-t"><span>الإجمالي</span><span className="text-[#7C3AED]">{formatCurrency(viewSale.total)}</span></div>
              </div>
              {viewSale.notes && <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">{viewSale.notes}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
