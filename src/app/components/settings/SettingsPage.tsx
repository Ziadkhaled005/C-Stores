import { useState } from 'react';
import { Building2, Receipt, Users, Shield, Save, Plus, Trash2, X, Edit2, ExternalLink, MapPin, Phone } from 'lucide-react';
import { USERS, ROLE_LABELS, User, Role } from '../../data';
import { BRANCHES, Branch } from '../../branchData';
import { useNavigate } from 'react-router';

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50';

export function SettingsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('company');
  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState<User[]>(USERS);
  const [branches, setBranches] = useState<Branch[]>(BRANCHES);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Partial<User>>({});

  const [company, setCompany] = useState({
    name: 'سي تكنولوجي ستور',
    nameEn: 'C Technology Store',
    address: 'القاهرة، مصر',
    phone: '01012345678',
    phone2: '0222345678',
    email: 'info@ctech.com',
    taxNumber: '٣٠٠١٢٣٤٥٦',
    website: 'www.ctechnologystore.com',
  });

  const [taxSettings, setTaxSettings] = useState({
    taxRate: 14,
    taxEnabled: true,
    taxIncluded: false,
    taxName: 'ضريبة القيمة المضافة',
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: 'INV',
    nextNumber: 19,
    showLogo: true,
    showTax: true,
    showQR: true,
    footer: 'شكراً لتعاملكم معنا - سي تكنولوجي ستور',
    notes: 'يُرجى الاحتفاظ بالفاتورة لضمان حق الاسترجاع',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({ role: 'cashier' });
    setShowUserModal(true);
  };

  const openEditUser = (u: User) => {
    setEditingUser(u);
    setUserForm({ ...u });
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email) return;
    if (editingUser) {
      setUsers(us => us.map(u => u.id === editingUser.id ? { ...u, ...userForm } as User : u));
    } else {
      setUsers(us => [...us, {
        id: `u${Date.now()}`, name: userForm.name!, email: userForm.email!, role: userForm.role as Role || 'cashier',
        password: userForm.password || '123456', phone: userForm.phone || '',
      }]);
    }
    setShowUserModal(false);
  };

  const deleteUser = (id: string) => {
    if (confirm('هل تريد حذف هذا المستخدم؟')) setUsers(us => us.filter(u => u.id !== id));
  };

  const TABS = [
    { key: 'company', label: 'معلومات الشركة', icon: Building2 },
    { key: 'branches', label: 'إدارة الفروع', icon: MapPin },
    { key: 'tax', label: 'إعدادات الضريبة', icon: Shield },
    { key: 'invoice', label: 'إعدادات الفواتير', icon: Receipt },
    { key: 'users', label: 'المستخدمون', icon: Users },
  ];

  const ROLE_COLOR: Record<Role, string> = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-purple-100 text-purple-700',
    cashier: 'bg-blue-100 text-blue-700',
    sales: 'bg-green-100 text-green-700',
    inventory: 'bg-orange-100 text-orange-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">الإعدادات</h1>
          <p className="text-gray-500 text-sm mt-0.5">إدارة إعدادات النظام</p>
        </div>
        {tab !== 'users' && (
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              saved ? 'bg-green-500 text-white' : 'bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white shadow-lg shadow-purple-500/30 hover:opacity-90'
            }`}
          >
            <Save size={16} />
            {saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
          </button>
        )}
        {tab === 'users' && (
          <button
            onClick={openAddUser}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-semibold text-sm hover:opacity-90 shadow-lg shadow-purple-500/30"
          >
            <Plus size={16} />
            إضافة مستخدم
          </button>
        )}
        <button
          onClick={() => navigate('/roles')}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#7C3AED] text-[#7C3AED] rounded-xl font-semibold text-sm hover:bg-purple-50 transition-all"
        >
          <Shield size={15} />
          إدارة الأدوار والصلاحيات
          <ExternalLink size={13} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  tab === key ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-200' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {tab === 'company' && (
            <div>
              <h2 className="font-black text-gray-800 mb-5">معلومات الشركة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'اسم الشركة (عربي)', key: 'name', placeholder: 'سي تكنولوجي ستور' },
                  { label: 'اسم الشركة (إنجليزي)', key: 'nameEn', placeholder: 'C Technology Store' },
                  { label: 'العنوان', key: 'address', placeholder: 'القاهرة، مصر' },
                  { label: 'الهاتف الرئيسي', key: 'phone', placeholder: '01012345678' },
                  { label: 'هاتف إضافي', key: 'phone2', placeholder: '0222345678' },
                  { label: 'البريد الإلكتروني', key: 'email', placeholder: 'info@company.com' },
                  { label: 'الرقم الضريبي', key: 'taxNumber', placeholder: '٣٠٠xxxxxxx' },
                  { label: 'الموقع الإلكتروني', key: 'website', placeholder: 'www.company.com' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">{f.label}</label>
                    <input
                      type="text"
                      value={(company as any)[f.key]}
                      onChange={e => setCompany(c => ({ ...c, [f.key]: e.target.value }))}
                      className={inputCls}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-l from-[#7C3AED]/5 to-white rounded-xl border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#EC4899] to-[#F97316] flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-3xl">C</span>
                  </div>
                  <div>
                    <div className="font-black text-gray-800 text-lg">{company.name}</div>
                    <div className="text-gray-500 text-sm">{company.nameEn}</div>
                    <div className="text-gray-400 text-xs">{company.address}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'branches' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-800">إدارة الفروع</h2>
                <button
                  onClick={() => {
                    const name = prompt('اسم الفرع الجديد:');
                    if (name) setBranches(prev => [...prev, {
                      id: `b${Date.now()}`, name, code: name.slice(0, 3).toUpperCase(),
                      address: '', phone: '', manager: '', isActive: true, isMain: false,
                    }]);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl text-sm font-semibold"
                >
                  <Plus size={14} />
                  إضافة فرع
                </button>
              </div>
              <div className="space-y-3">
                {branches.map(b => (
                  <div key={b.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {b.code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{b.name}</span>
                        {b.isMain && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg font-semibold">رئيسي</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                          {b.isActive ? 'نشط' : 'معطل'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-0.5 text-xs text-gray-400">
                        {b.address && <span className="flex items-center gap-1"><MapPin size={10} />{b.address}</span>}
                        {b.phone && <span className="flex items-center gap-1"><Phone size={10} />{b.phone}</span>}
                        {b.manager && <span>المدير: {b.manager}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBranches(prev => prev.map(br => br.id === b.id ? { ...br, isActive: !br.isActive } : br))}
                        className={`text-xs px-2 py-1 rounded-lg font-semibold transition-all ${b.isActive ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                      >
                        {b.isActive ? 'تعطيل' : 'تفعيل'}
                      </button>
                      {!b.isMain && (
                        <button
                          onClick={() => { if (confirm('حذف الفرع؟')) setBranches(prev => prev.filter(br => br.id !== b.id)); }}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'tax' && (
            <div>
              <h2 className="font-black text-gray-800 mb-5">إعدادات الضريبة</h2>
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-700">تفعيل الضريبة</div>
                    <div className="text-xs text-gray-400 mt-0.5">إضافة ضريبة القيمة المضافة على الفواتير</div>
                  </div>
                  <button
                    onClick={() => setTaxSettings(t => ({ ...t, taxEnabled: !t.taxEnabled }))}
                    className={`w-12 h-6 rounded-full transition-all ${taxSettings.taxEnabled ? 'bg-[#7C3AED]' : 'bg-gray-300'}`}
                  >
                    <span className={`block w-5 h-5 rounded-full bg-white shadow mx-0.5 transition-transform ${taxSettings.taxEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-700">الضريبة مشمولة في السعر</div>
                    <div className="text-xs text-gray-400 mt-0.5">عرض الأسعار شاملة الضريبة</div>
                  </div>
                  <button
                    onClick={() => setTaxSettings(t => ({ ...t, taxIncluded: !t.taxIncluded }))}
                    className={`w-12 h-6 rounded-full transition-all ${taxSettings.taxIncluded ? 'bg-[#7C3AED]' : 'bg-gray-300'}`}
                  >
                    <span className={`block w-5 h-5 rounded-full bg-white shadow mx-0.5 transition-transform ${taxSettings.taxIncluded ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">نسبة الضريبة %</label>
                    <input
                      type="number"
                      value={taxSettings.taxRate}
                      onChange={e => setTaxSettings(t => ({ ...t, taxRate: Number(e.target.value) }))}
                      className={inputCls}
                      min={0} max={100}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">اسم الضريبة</label>
                    <input
                      type="text"
                      value={taxSettings.taxName}
                      onChange={e => setTaxSettings(t => ({ ...t, taxName: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                  <strong>ملاحظة:</strong> نسبة ضريبة القيمة المضافة المطبقة في مصر هي ١٤٪ وفقاً للقانون المصري.
                </div>
              </div>
            </div>
          )}

          {tab === 'invoice' && (
            <div>
              <h2 className="font-black text-gray-800 mb-5">إعدادات الفواتير</h2>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">بادئة الفاتورة</label>
                  <input value={invoiceSettings.prefix} onChange={e => setInvoiceSettings(s => ({ ...s, prefix: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">رقم الفاتورة التالية</label>
                  <input type="number" value={invoiceSettings.nextNumber} onChange={e => setInvoiceSettings(s => ({ ...s, nextNumber: Number(e.target.value) }))} className={inputCls} />
                </div>
              </div>

              {[
                { key: 'showLogo', label: 'إظهار الشعار في الفاتورة' },
                { key: 'showTax', label: 'إظهار تفاصيل الضريبة' },
                { key: 'showQR', label: 'إظهار رمز QR' },
              ].map(s => (
                <div key={s.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-3">
                  <span className="font-semibold text-gray-700 text-sm">{s.label}</span>
                  <button
                    onClick={() => setInvoiceSettings(prev => ({ ...prev, [s.key]: !(prev as any)[s.key] }))}
                    className={`w-12 h-6 rounded-full transition-all ${(invoiceSettings as any)[s.key] ? 'bg-[#7C3AED]' : 'bg-gray-300'}`}
                  >
                    <span className={`block w-5 h-5 rounded-full bg-white shadow mx-0.5 transition-transform ${(invoiceSettings as any)[s.key] ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">تذييل الفاتورة</label>
                  <input value={invoiceSettings.footer} onChange={e => setInvoiceSettings(s => ({ ...s, footer: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">ملاحظات الفاتورة</label>
                  <textarea value={invoiceSettings.notes} onChange={e => setInvoiceSettings(s => ({ ...s, notes: e.target.value }))} className={`${inputCls} resize-none h-20`} />
                </div>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div>
              <h2 className="font-black text-gray-800 mb-5">إدارة المستخدمين</h2>
              <div className="space-y-3">
                {users.map(u => (
                  <div key={u.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 transition-all">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800">{u.name}</div>
                      <div className="text-xs text-gray-400">{u.email} • {u.phone}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${ROLE_COLOR[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditUser(u)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-[#7C3AED] transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-500 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUserModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-gray-800">{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h3>
              <button onClick={() => setShowUserModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">الاسم الكامل *</label>
                <input type="text" value={userForm.name || ''} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="اسم الموظف" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">البريد الإلكتروني *</label>
                <input type="email" value={userForm.email || ''} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="employee@ctech.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">رقم الهاتف</label>
                <input type="tel" value={userForm.phone || ''} onChange={e => setUserForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="01xxxxxxxxx" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">الدور الوظيفي</label>
                <select value={userForm.role || 'cashier'} onChange={e => setUserForm(f => ({ ...f, role: e.target.value as Role }))} className={inputCls}>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">{editingUser ? 'كلمة مرور جديدة (اتركه فارغاً للإبقاء)' : 'كلمة المرور *'}</label>
                <input type="password" value={userForm.password || ''} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} className={inputCls} placeholder="••••••••" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowUserModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">إلغاء</button>
              <button onClick={handleSaveUser} className="flex-1 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-bold text-sm hover:opacity-90">
                {editingUser ? 'حفظ' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
