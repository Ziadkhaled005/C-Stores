import { useEffect, useState, useRef } from 'react';
import { Search, Plus, Minus, Trash2, Printer, CreditCard, Banknote, Building2, Smartphone, X, Check, User } from 'lucide-react';
import { PRODUCTS as FALLBACK_PRODUCTS, CUSTOMERS as FALLBACK_CUSTOMERS, CATEGORIES, formatCurrency } from '../../data';
import { usePOSStore } from '../../store';
import { checkoutPOS, getCustomers, getProducts } from '../../api';

let invoiceCounter = 19;

const PAYMENT_ICONS = {
  cash: <Banknote size={16} />,
  visa: <CreditCard size={16} />,
  transfer: <Building2 size={16} />,
  instapay: <Smartphone size={16} />,
};
const PAYMENT_LABELS = { cash: 'نقدي', visa: 'فيزا', transfer: 'تحويل بنكي', instapay: 'إنستاباي' };

export function POSPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [showReceipt, setShowReceipt] = useState(false);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [customers, setCustomers] = useState(FALLBACK_CUSTOMERS);
  const [isLoading, setIsLoading] = useState(true);
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const {
    cart, customerId, customerName, notes, paymentMethod, discountAmount, taxRate,
    addToCart, removeFromCart, updateQuantity, updateDiscount,
    clearCart, setCustomer, setNotes, setPaymentMethod, setDiscountAmount,
  } = usePOSStore();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [apiProducts, apiCustomers] = await Promise.all([getProducts(), getCustomers()]);
        if (!cancelled) {
          setProducts(apiProducts.map((p: any) => ({
            id: p.id,
            name: p.name ?? p.productName ?? '',
            sku: p.sku ?? p.barcode ?? '',
            brand: p.brand ?? p.brandName ?? '—',
            category: p.category ?? p.categoryName ?? 'عام',
            sellingPrice: Number(p.sellingPrice ?? p.price ?? 0),
            quantity: Number(p.quantity ?? p.stock ?? 0),
          })));
          setCustomers(apiCustomers.map((c: any) => ({
            id: c.id,
            name: c.name ?? c.fullName ?? '',
            phone: c.phone ?? '',
            email: c.email ?? '',
            address: c.address ?? '',
          })));
        }
      } catch {
        if (!cancelled) {
          setProducts(FALLBACK_PRODUCTS);
          setCustomers(FALLBACK_CUSTOMERS);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const categories = ['الكل', ...CATEGORIES];
  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'الكل' || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const total = afterDiscount + taxAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const payload = {
      customerId,
      customerName: customerName || 'عميل عام',
      notes,
      paymentMethod,
      discountAmount,
      taxRate,
      items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount }))
    };
    try {
      const created = await checkoutPOS(payload);
      const invoice = {
        id: created?.id ?? `INV-2026-${String(invoiceCounter++).padStart(3, '0')}`,
        customerName: customerName || 'عميل عام',
        date: new Date().toLocaleDateString('ar-EG'),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        items: cart.map(i => ({ ...i })),
        subtotal, discountAmount, taxRate, taxAmount, total, paymentMethod,
      };
      setLastInvoice(invoice);
      setShowReceipt(true);
      clearCart();
    } catch {
      const invoice = {
        id: `INV-2026-${String(invoiceCounter++).padStart(3, '0')}`,
        customerName: customerName || 'عميل عام',
        date: new Date().toLocaleDateString('ar-EG'),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        items: cart.map(i => ({ ...i })),
        subtotal, discountAmount, taxRate, taxAmount, total, paymentMethod,
      };
      setLastInvoice(invoice);
      setShowReceipt(true);
      clearCart();
    }
  };

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Cairo', sans-serif; direction: rtl; background: white; }
          .receipt { width: 80mm; margin: 0 auto; padding: 10px; }
          .center { text-align: center; }
          .bold { font-weight: 700; }
          .separator { border-top: 1px dashed #999; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px; }
          .logo-text { font-size: 20px; font-weight: 900; margin-bottom: 4px; }
          .total-row { font-size: 14px; font-weight: 800; }
        </style>
      </head><body>
        ${printContent.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-120px)]">
      {isLoading && <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-gray-500">جارٍ تحميل المنتجات والعملاء...</div>}
      {/* Products Panel */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative mb-3">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الباركود..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">لا توجد منتجات</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToCart({ productId: p.id, productName: p.name, sku: p.sku, unitPrice: p.sellingPrice, quantity: 1, discount: 0 })}
                  disabled={p.quantity === 0}
                  className="group relative bg-gray-50 rounded-xl p-3 text-right border border-gray-100 hover:border-[#7C3AED] hover:bg-purple-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/20 flex items-center justify-center mb-2 mx-auto">
                    <span className="text-[#7C3AED] font-black text-lg">{p.brand.charAt(0)}</span>
                  </div>
                  <div className="text-xs font-semibold text-gray-700 leading-tight mb-1 line-clamp-2">{p.name}</div>
                  <div className="text-sm font-black text-[#7C3AED]">{formatCurrency(p.sellingPrice)}</div>
                  <div className="text-xs text-gray-400 mt-0.5">متبقي: {p.quantity}</div>
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#7C3AED] text-white rounded-full w-5 h-5 flex items-center justify-center">
                    <Plus size={12} />
                  </div>
                  {p.quantity === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-xl">
                      <span className="text-xs font-bold text-red-500">نفد</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-l from-[#7C3AED]/5 to-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-gray-800">سلة المبيعات</h3>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1">
                <Trash2 size={12} />
                مسح الكل
              </button>
            )}
          </div>

          {/* Customer */}
          <button
            onClick={() => setShowCustomerPicker(true)}
            className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl hover:border-[#7C3AED] transition-all text-sm"
          >
            <User size={14} className="text-gray-400" />
            <span className={customerName ? 'text-gray-700 font-semibold' : 'text-gray-400'}>
              {customerName || 'اختر عميل (اختياري)'}
            </span>
            {customerName && (
              <button
                onClick={e => { e.stopPropagation(); setCustomer('', ''); }}
                className="mr-auto text-gray-300 hover:text-red-400"
              >
                <X size={14} />
              </button>
            )}
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-300">
              <ShoppingCartIcon />
              <span className="text-sm mt-2">السلة فارغة</span>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {cart.map(item => (
                <div key={item.productId} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-700 leading-tight">{item.productName}</div>
                      <div className="text-xs text-gray-400">{item.sku}</div>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="text-gray-300 hover:text-red-400 mr-2 flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded-r-lg text-gray-500"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded-l-lg text-gray-500"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <input
                      type="number"
                      value={item.discount}
                      onChange={e => updateDiscount(item.productId, Number(e.target.value))}
                      placeholder="خصم%"
                      className="w-16 text-center text-xs border border-gray-200 rounded-lg py-1 focus:outline-none focus:border-[#7C3AED]"
                      min={0} max={100}
                    />
                    <span className="mr-auto text-sm font-black text-[#7C3AED]">{formatCurrency(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Payment */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          {/* Global discount */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-20">خصم إجمالي</label>
            <input
              type="number"
              value={discountAmount}
              onChange={e => setDiscountAmount(Number(e.target.value))}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#7C3AED]"
              min={0}
            />
          </div>

          {/* Notes */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-20">ملاحظات</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="ملاحظة..."
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>المجموع الفرعي</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>الخصم</span>
                <span>- {formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>ضريبة القيمة المضافة ({taxRate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between font-black text-gray-800 pt-1.5 border-t border-gray-200">
              <span>الإجمالي</span>
              <span className="text-[#7C3AED]">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <p className="text-xs text-gray-500 mb-2">طريقة الدفع</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(PAYMENT_LABELS) as [keyof typeof PAYMENT_LABELS, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setPaymentMethod(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    paymentMethod === key
                      ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-md shadow-purple-200'
                      : 'border-gray-200 text-gray-600 hover:border-[#7C3AED]'
                  }`}
                >
                  {PAYMENT_ICONS[key]}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Checkout */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-black text-base hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
          >
            إتمام البيع • {formatCurrency(total)}
          </button>
        </div>
      </div>

      {/* Customer Picker Modal */}
      {showCustomerPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCustomerPicker(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold">اختر عميل</h3>
              <button onClick={() => setShowCustomerPicker(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              <button
                onClick={() => { setCustomer('', ''); setShowCustomerPicker(false); }}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
              >
                بدون عميل (عميل عام)
              </button>
              {customers.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setCustomer(c.id, c.name); setShowCustomerPicker(false); }}
                  className="w-full text-right px-4 py-2.5 rounded-xl hover:bg-purple-50 transition-all"
                >
                  <div className="text-sm font-semibold text-gray-700">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.phone}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2 text-green-600">
                <Check size={18} />
                <h3 className="font-bold">تم البيع بنجاح</h3>
              </div>
              <button onClick={() => setShowReceipt(false)}><X size={18} className="text-gray-400" /></button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div ref={receiptRef} className="text-center text-sm" dir="rtl">
                <div className="mb-3">
                  <div className="text-xl font-black">سي تكنولوجي ستور</div>
                  <div className="text-gray-500 text-xs">C Technology Store</div>
                  <div className="text-gray-400 text-xs">القاهرة، مصر | 01012345678</div>
                </div>
                <div className="border-t border-dashed border-gray-300 my-2"></div>
                <div className="text-right space-y-0.5 text-xs mb-2">
                  <div className="flex justify-between">
                    <span>{lastInvoice.id}</span>
                    <span className="font-bold">رقم الفاتورة:</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lastInvoice.date} - {lastInvoice.time}</span>
                    <span className="font-bold">التاريخ:</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lastInvoice.customerName}</span>
                    <span className="font-bold">العميل:</span>
                  </div>
                </div>
                <div className="border-t border-dashed border-gray-300 my-2"></div>
                {lastInvoice.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs mb-1">
                    <span>{formatCurrency(item.total)}</span>
                    <span className="text-right flex-1 mr-2">{item.productName} × {item.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-dashed border-gray-300 my-2"></div>
                <div className="text-xs space-y-0.5">
                  {lastInvoice.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span>- {formatCurrency(lastInvoice.discountAmount)}</span>
                      <span>الخصم:</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{formatCurrency(lastInvoice.taxAmount)}</span>
                    <span>ض.ق.م ({lastInvoice.taxRate}%):</span>
                  </div>
                  <div className="flex justify-between font-black text-base pt-1">
                    <span>{formatCurrency(lastInvoice.total)}</span>
                    <span>الإجمالي:</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{PAYMENT_LABELS[lastInvoice.paymentMethod as keyof typeof PAYMENT_LABELS]}</span>
                    <span>طريقة الدفع:</span>
                  </div>
                </div>
                <div className="border-t border-dashed border-gray-300 mt-2 pt-2 text-xs text-gray-400">
                  شكراً لتعاملكم معنا
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[#7C3AED] text-[#7C3AED] rounded-xl font-semibold text-sm hover:bg-purple-50 transition-all"
              >
                <Printer size={16} />
                طباعة
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-2.5 bg-[#7C3AED] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
              >
                بيع جديد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShoppingCartIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}
