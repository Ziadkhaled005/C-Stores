import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Phone, Mail, MapPin } from 'lucide-react';
import { SUPPLIERS, Supplier } from '../../data';
import { createSupplier, deleteSupplier, getSuppliers, updateSupplier } from '../../api';

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50';

const normalizeSupplier = (value: any): Supplier => ({
  id: value?.id ?? value?.supplierId ?? '',
  name: value?.name ?? value?.companyName ?? '',
  phone: value?.phone ?? '',
  email: value?.email ?? '',
  address: value?.address ?? '',
  notes: value?.notes ?? '',
  totalOrders: Number(value?.totalOrders ?? value?.ordersCount ?? 0),
});

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Partial<Supplier>>({});
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const apiSuppliers = await getSuppliers();
        if (!cancelled) {
          setSuppliers(apiSuppliers.map(normalizeSupplier));
          setStatusMessage('');
        }
      } catch {
        if (!cancelled) {
          setSuppliers(SUPPLIERS);
          setStatusMessage('تم استخدام البيانات المحلية بسبب عدم توفر الخادم حالياً.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = suppliers.filter(s =>
    !search || s.name.includes(search) || (s.phone || '').includes(search) || (s.email || '').includes(search)
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ totalOrders: 0 });
    setShowModal(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ ...s });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) return;
    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email || '',
      address: form.address || '',
      notes: form.notes || '',
      totalOrders: form.totalOrders ?? 0,
    };
    try {
      if (editing) {
        const updated = await updateSupplier(editing.id, payload);
        const normalized = normalizeSupplier(updated ?? { ...editing, ...payload });
        setSuppliers(ss => ss.map(s => s.id === editing.id ? normalized : s));
      } else {
        const created = await createSupplier(payload);
        const normalized = normalizeSupplier(created ?? { ...payload, id: `s${Date.now()}` });
        setSuppliers(ss => [normalized, ...ss]);
      }
      setShowModal(false);
      setStatusMessage('تم حفظ المورد بنجاح.');
    } catch {
      if (editing) {
        setSuppliers(ss => ss.map(s => s.id === editing.id ? { ...s, ...payload } as Supplier : s));
      } else {
        setSuppliers(ss => [{
          id: `s${Date.now()}`, name: form.name!, phone: form.phone!, email: form.email || '',
          address: form.address || '', notes: form.notes || '', totalOrders: 0,
        }, ...ss]);
      }
      setShowModal(false);
      setStatusMessage('تم حفظ المورد محلياً لأن الخادم غير متاح حالياً.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المورد؟')) return;
    try {
      await deleteSupplier(id);
      setSuppliers(ss => ss.filter(s => s.id !== id));
      setStatusMessage('تم حذف المورد بنجاح.');
    } catch {
      setSuppliers(ss => ss.filter(s => s.id !== id));
      setStatusMessage('تم حذف المورد محلياً لأن الخادم غير متاح حالياً.');
    }
  };

  return (
    <div>
      {statusMessage && (
        <div className="mb-4 rounded-xl border border-purple-100 bg-purple-50 px-4 py-2 text-sm text-purple-700">{statusMessage}</div>
      )}
      {loading && (
        <div className="mb-4 text-sm text-gray-500">جارٍ تحميل الموردين...</div>
      )}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">إدارة الموردين</h1>
          <p className="text-gray-500 text-sm mt-0.5">{suppliers.length} موردين مسجلين</p>
        </div>
        <button
          onClick={openAdd}
          className="mr-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-semibold text-sm hover:opacity-90 shadow-lg shadow-purple-500/30"
        >
          <Plus size={16} />
          إضافة مورد
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {[
          { label: 'إجمالي الموردين', value: suppliers.length, color: 'text-purple-700' },
          { label: 'إجمالي الطلبات', value: suppliers.reduce((s, sup) => s + sup.totalOrders, 0), color: 'text-teal-700' },
          { label: 'موردون نشطون', value: suppliers.length, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                  {['المورد', 'الهاتف', 'البريد الإلكتروني', 'العنوان', 'عدد الطلبات', 'ملاحظات', 'إجراءات'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#06B6D4]/20 to-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-bold flex-shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-700">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.phone}</td>
                    <td className="px-4 py-3 text-gray-500">{s.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-48 truncate">{s.address || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-lg text-xs font-bold">{s.totalOrders}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-32 truncate">{s.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-[#7C3AED]"><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
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
      </div>

      {/* Supplier Cards */}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {filtered.map(s => (
          <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white font-black text-xl">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{s.name}</h4>
                  <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-lg font-semibold">{s.totalOrders} طلب</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(s)} className="p-2 hover:bg-purple-50 rounded-lg text-[#7C3AED]"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(s.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={13} className="text-gray-400" />
                {s.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={13} className="text-gray-400" />
                {s.email || '—'}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={13} className="text-gray-400" />
                {s.address || '—'}
              </div>
            </div>
            {s.notes && (
              <p className="mt-3 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">{s.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-gray-800">{editing ? 'تعديل مورد' : 'إضافة مورد جديد'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'اسم الشركة *', key: 'name', type: 'text', placeholder: 'شركة ...' },
                { label: 'الهاتف *', key: 'phone', type: 'tel', placeholder: '022xxxxxxx' },
                { label: 'البريد الإلكتروني', key: 'email', type: 'email', placeholder: 'info@supplier.com' },
                { label: 'العنوان', key: 'address', type: 'text', placeholder: 'العنوان الكامل' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key] || ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className={inputCls}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">ملاحظات</label>
                <textarea
                  value={form.notes || ''}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className={`${inputCls} resize-none h-20`}
                  placeholder="ملاحظات..."
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">إلغاء</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-bold text-sm">
                {editing ? 'حفظ' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
