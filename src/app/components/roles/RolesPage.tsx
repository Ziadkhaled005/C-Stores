import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Copy, ToggleLeft, ToggleRight, Shield, Check } from 'lucide-react';
import {
  AppRole, DEFAULT_ROLES, ALL_MODULES, ALL_PERMISSIONS,
  MODULE_LABELS, PERMISSION_LABELS, PermissionMap, Permission, Module, buildMatrix
} from '../../rbacData';

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] bg-gray-50';

const ROLE_COLORS = ['#7C3AED', '#06B6D4', '#EC4899', '#F97316', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

export function RolesPage() {
  const [roles, setRoles] = useState<AppRole[]>(DEFAULT_ROLES);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMatrix, setShowMatrix] = useState<AppRole | null>(null);
  const [editingRole, setEditingRole] = useState<AppRole | null>(null);
  const [form, setForm] = useState({ name: '', description: '', color: ROLE_COLORS[0] });
  const [matrixEdit, setMatrixEdit] = useState<PermissionMap | null>(null);

  const filtered = roles.filter(r =>
    !search || r.name.includes(search) || r.description.includes(search)
  );

  const openAdd = () => {
    setEditingRole(null);
    setForm({ name: '', description: '', color: ROLE_COLORS[0] });
    setMatrixEdit(buildMatrix({}));
    setShowModal(true);
  };

  const openEdit = (role: AppRole) => {
    setEditingRole(role);
    setForm({ name: role.name, description: role.description, color: role.color });
    setMatrixEdit(JSON.parse(JSON.stringify(role.permissions)));
    setShowModal(true);
  };

  const openMatrix = (role: AppRole) => {
    setShowMatrix(role);
    setMatrixEdit(JSON.parse(JSON.stringify(role.permissions)));
  };

  const handleClone = (role: AppRole) => {
    const cloned: AppRole = {
      ...role,
      id: `r${Date.now()}`,
      name: `${role.name} (نسخة)`,
      isSystem: false,
      userCount: 0,
      permissions: JSON.parse(JSON.stringify(role.permissions)),
    };
    setRoles(prev => [...prev, cloned]);
  };

  const handleToggle = (id: string) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleDelete = (id: string) => {
    if (confirm('هل تريد حذف هذا الدور؟')) setRoles(prev => prev.filter(r => r.id !== id));
  };

  const handleSaveRole = () => {
    if (!form.name) return;
    if (editingRole) {
      setRoles(prev => prev.map(r =>
        r.id === editingRole.id
          ? { ...r, name: form.name, description: form.description, color: form.color, permissions: matrixEdit ?? r.permissions }
          : r
      ));
    } else {
      const newRole: AppRole = {
        id: `r${Date.now()}`, name: form.name, description: form.description,
        color: form.color, isSystem: false, isActive: true, userCount: 0,
        permissions: matrixEdit ?? buildMatrix({}),
      };
      setRoles(prev => [...prev, newRole]);
    }
    setShowModal(false);
  };

  const handleSaveMatrix = () => {
    if (!showMatrix || !matrixEdit) return;
    setRoles(prev => prev.map(r => r.id === showMatrix.id ? { ...r, permissions: matrixEdit } : r));
    setShowMatrix(null);
  };

  const togglePerm = (mod: Module, perm: Permission) => {
    setMatrixEdit(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [mod]: { ...prev[mod], [perm]: !prev[mod][perm] },
      };
    });
  };

  const toggleAllInModule = (mod: Module, value: boolean) => {
    setMatrixEdit(prev => {
      if (!prev) return prev;
      const updated = {} as Record<Permission, boolean>;
      for (const p of ALL_PERMISSIONS) updated[p] = value;
      return { ...prev, [mod]: updated };
    });
  };

  const toggleAllForPerm = (perm: Permission, value: boolean) => {
    setMatrixEdit(prev => {
      if (!prev) return prev;
      const next = { ...prev } as PermissionMap;
      for (const mod of ALL_MODULES) next[mod] = { ...next[mod], [perm]: value };
      return next;
    });
  };

  const countActive = (role: AppRole) =>
    ALL_MODULES.reduce((sum, m) =>
      sum + ALL_PERMISSIONS.filter(p => role.permissions[m][p]).length, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">إدارة الأدوار والصلاحيات</h1>
          <p className="text-gray-500 text-sm mt-0.5">{roles.length} دور • {roles.filter(r => r.isActive).length} نشط</p>
        </div>
        <button
          onClick={openAdd}
          className="mr-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-semibold text-sm hover:opacity-90 shadow-lg shadow-purple-500/30"
        >
          <Plus size={16} />
          إضافة دور جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'إجمالي الأدوار', value: roles.length, color: 'text-purple-700' },
          { label: 'أدوار نشطة', value: roles.filter(r => r.isActive).length, color: 'text-green-600' },
          { label: 'أدوار النظام', value: roles.filter(r => r.isSystem).length, color: 'text-teal-700' },
          { label: 'أدوار مخصصة', value: roles.filter(r => !r.isSystem).length, color: 'text-pink-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`text-xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث عن دور..."
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
                {['الدور', 'الوصف', 'عدد المستخدمين', 'عدد الصلاحيات', 'الحالة', 'النوع', 'إجراءات'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(role => (
                <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: role.color + '20' }}>
                        <Shield size={16} style={{ color: role.color }} />
                      </div>
                      <span className="font-bold text-gray-700">{role.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-48 truncate">{role.description}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg text-xs font-bold">{role.userCount}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-lg text-xs font-bold">{countActive(role)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${role.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {role.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${role.isSystem ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {role.isSystem ? 'نظام' : 'مخصص'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openMatrix(role)}
                        className="text-xs px-2 py-1 bg-purple-50 text-[#7C3AED] rounded-lg hover:bg-purple-100 transition-all"
                      >
                        الصلاحيات
                      </button>
                      <button onClick={() => openEdit(role)} className="text-gray-400 hover:text-[#7C3AED]"><Edit2 size={14} /></button>
                      <button onClick={() => handleClone(role)} className="text-gray-400 hover:text-teal-500"><Copy size={14} /></button>
                      <button onClick={() => handleToggle(role.id)} className={`text-gray-400 hover:text-orange-500`}>
                        {role.isActive ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} />}
                      </button>
                      {!role.isSystem && (
                        <button onClick={() => handleDelete(role.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h3 className="font-black text-gray-800">{editingRole ? 'تعديل الدور' : 'إضافة دور جديد'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">اسم الدور *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="مثال: مدير المبيعات" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">الوصف</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="وصف مختصر للدور" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">لون الدور</label>
                <div className="flex gap-2 flex-wrap">
                  {ROLE_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Permission Matrix */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">مصفوفة الصلاحيات</label>
                <PermissionMatrixTable matrix={matrixEdit} onToggle={togglePerm} onToggleModule={toggleAllInModule} onTogglePerm={toggleAllForPerm} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">إلغاء</button>
              <button onClick={handleSaveRole} className="flex-1 py-2.5 bg-gradient-to-l from-[#7C3AED] to-[#A855F7] text-white rounded-xl font-bold text-sm">
                {editingRole ? 'حفظ التغييرات' : 'إضافة الدور'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Matrix Modal */}
      {showMatrix && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMatrix(null)}>
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: showMatrix.color + '20' }}>
                  <Shield size={15} style={{ color: showMatrix.color }} />
                </div>
                <div>
                  <h3 className="font-black text-gray-800">صلاحيات: {showMatrix.name}</h3>
                  <p className="text-xs text-gray-400">{countActive(showMatrix)} صلاحية مفعلة</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveMatrix}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] text-white rounded-xl text-sm font-semibold hover:opacity-90"
                >
                  <Check size={14} />
                  حفظ
                </button>
                <button onClick={() => setShowMatrix(null)}><X size={18} className="text-gray-400" /></button>
              </div>
            </div>
            <div className="p-5">
              <PermissionMatrixTable matrix={matrixEdit} onToggle={togglePerm} onToggleModule={toggleAllInModule} onTogglePerm={toggleAllForPerm} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PermissionMatrixTable({
  matrix,
  onToggle,
  onToggleModule,
  onTogglePerm,
}: {
  matrix: PermissionMap | null;
  onToggle: (mod: Module, perm: Permission) => void;
  onToggleModule: (mod: Module, value: boolean) => void;
  onTogglePerm: (perm: Permission, value: boolean) => void;
}) {
  if (!matrix) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-right text-gray-600 font-bold w-36">الوحدة</th>
            {ALL_PERMISSIONS.map(perm => (
              <th key={perm} className="px-3 py-3 text-center text-gray-600 font-semibold">
                <div>{PERMISSION_LABELS[perm]}</div>
                <div className="flex justify-center gap-1 mt-1">
                  <button onClick={() => onTogglePerm(perm, true)} className="text-xs text-green-600 hover:underline">الكل</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => onTogglePerm(perm, false)} className="text-xs text-red-400 hover:underline">لا شيء</button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {ALL_MODULES.map(mod => {
            const allOn = ALL_PERMISSIONS.every(p => matrix[mod][p]);
            const allOff = ALL_PERMISSIONS.every(p => !matrix[mod][p]);
            return (
              <tr key={mod} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-700">{MODULE_LABELS[mod]}</span>
                    <button
                      onClick={() => onToggleModule(mod, !allOn)}
                      className={`text-xs px-1.5 py-0.5 rounded font-semibold transition-all ${allOn ? 'bg-green-100 text-green-600' : allOff ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}
                    >
                      {allOn ? 'كل' : allOff ? 'لا شيء' : 'جزئي'}
                    </button>
                  </div>
                </td>
                {ALL_PERMISSIONS.map(perm => (
                  <td key={perm} className="px-3 py-3 text-center">
                    <button
                      onClick={() => onToggle(mod, perm)}
                      className={`w-6 h-6 rounded-md border-2 mx-auto flex items-center justify-center transition-all ${
                        matrix[mod][perm]
                          ? 'bg-[#7C3AED] border-[#7C3AED]'
                          : 'bg-white border-gray-300 hover:border-[#7C3AED]'
                      }`}
                    >
                      {matrix[mod][perm] && <Check size={12} className="text-white" />}
                    </button>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
