import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Eye, Phone, Mail, MapPin } from 'lucide-react';
import { CUSTOMERS, SALES, Customer, formatCurrency } from '../../data';

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(CUSTOMERS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [viewing, setViewing] = useState<Customer | null>(null);

  const filtered = customers.filter(c =>
    !search || c.name.includes(search) || c.phone.includes(search) || c.email.includes(search)
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ balance: 0, totalPurchases: 0, joinDate: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ ...c });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.phone) return;
    if (editing) {
      setCustomers(cs => cs.map(c => c.id === editing.id ? { ...c, ...form } as Customer : c));
    } else {
      setCustomers(cs => [{
        id: `c${Date.now()}`, name: form.name!, phone: form.phone!, email: form.email || '',
        address: form.address || '', notes: form.notes || '', balance: 0, totalPurchases: 0,
        joinDate: form.joinDate || new Date().toISOString().split('T')[0],
      }, ...cs]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل تريد حذف هذا العميل؟')) setCustomers(cs => cs.filter(c => c.id !== id));
  };

  const getCustomerSales = (id: string) => SALES.filter(s => s.customerId === id);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">إدارة العملاء</h1>
          <p className="text-gray-500 text-sm mt-0.5">{customers.length} عميل مسجل</p>
        </div>
        <button
          onClick={openAdd}
          className="mr-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-semibold text-sm hover:opacity-90 shadow-lg shadow-purple-500/30"
        >
          <Plus size={16} />
          إضافة عميل
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'إجمالي العملاء', value: customers.length, color: 'text-purple-700' },
          { label: 'إجمالي المبيعات', value: formatCurrency(customers.reduce((s, c) => s + c.totalPurchases, 0)), color: 'text-teal-700' },
          { label: 'أرصدة مستحقة', value: formatCurrency(customers.reduce((s, c) => s + c.balance, 0)), color: 'text-orange-600' },
          { label: 'عملاء هذا الشهر', value: customers.filter(c => c.joinDate.startsWith('2026-06')).length, color: 'text-pink-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`text-xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الهاتف..."
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
                {['العميل', 'الهاتف', 'البريد الإلكتروني', 'إجمالي المشتريات', 'الرصيد', 'تاريخ الانضمام', 'إجراءات'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.address || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-[#7C3AED]">{formatCurrency(c.totalPurchases)}</td>
                  <td className="px-4 py-3">
                    {c.balance > 0 ? (
                      <span className="text-orange-600 font-semibold">{formatCurrency(c.balance)}</span>
                    ) : (
                      <span className="text-green-600 text-xs">لا يوجد</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.joinDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewing(c)} className="text-gray-400 hover:text-teal-500 transition-colors"><Eye size={15} /></button>
                      <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-[#7C3AED] transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">لا توجد نتائج</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-gray-800">{editing ? 'تعديل عميل' : 'إضافة عميل جديد'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">الاسم الكامل *</label>
                <input type="text" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="اسم العميل" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">الهاتف *</label>
                <input type="tel" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="01012345678" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">البريد الإلكتروني</label>
                <input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">العنوان</label>
                <input type="text" value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} placeholder="العنوان الكامل" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">ملاحظات</label>
                <textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={`${inputCls} resize-none h-20`} placeholder="ملاحظات..." />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">إلغاء</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-bold text-sm hover:opacity-90">
                {editing ? 'حفظ' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Customer Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-gray-800">ملف العميل</h3>
              <button onClick={() => setViewing(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5 p-4 bg-gradient-to-l from-[#7C3AED]/5 to-white rounded-xl border border-purple-100">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white font-black text-2xl">
                  {viewing.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-gray-800 text-lg">{viewing.name}</h4>
                  <p className="text-gray-500 text-sm">عميل منذ {viewing.joinDate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-[#7C3AED]" />
                  <span className="text-gray-600">{viewing.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} className="text-[#7C3AED]" />
                  <span className="text-gray-600">{viewing.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm col-span-2">
                  <MapPin size={14} className="text-[#7C3AED]" />
                  <span className="text-gray-600">{viewing.address || '—'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-purple-50 rounded-xl p-3">
                  <div className="text-lg font-black text-[#7C3AED]">{formatCurrency(viewing.totalPurchases)}</div>
                  <div className="text-xs text-gray-500">إجمالي المشتريات</div>
                </div>
                <div className={`rounded-xl p-3 ${viewing.balance > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
                  <div className={`text-lg font-black ${viewing.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {formatCurrency(viewing.balance)}
                  </div>
                  <div className="text-xs text-gray-500">الرصيد المستحق</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-700 mb-3">سجل المشتريات</h4>
              <div className="space-y-2">
                {getCustomerSales(viewing.id).length === 0 ? (
                  <p className="text-gray-400 text-sm">لا توجد مشتريات مسجلة</p>
                ) : (
                  getCustomerSales(viewing.id).map(s => (
                    <div key={s.id} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl text-sm">
                      <div>
                        <span className="font-mono text-gray-600 text-xs">{s.id}</span>
                        <span className="text-gray-400 text-xs mr-2">{s.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#7C3AED]">{formatCurrency(s.total)}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${s.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {s.status === 'paid' ? 'مدفوع' : 'معلق'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
