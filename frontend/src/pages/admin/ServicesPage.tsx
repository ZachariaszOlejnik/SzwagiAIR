import { useState } from 'react';
import {
  Plus, Tag, Pencil, Trash2, X, Check, Package, Crown, Armchair,
  Search,
} from 'lucide-react';
import { adminServices as initialServices, AdminService } from '../../data/mockData';

const categoryConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  baggage: { label: 'Bagaż', color: 'text-sky-700', bg: 'bg-sky-100', icon: <Package className="size-3.5" /> },
  premium: { label: 'Premium', color: 'text-amber-700', bg: 'bg-amber-100', icon: <Crown className="size-3.5" /> },
  comfort: { label: 'Komfort', color: 'text-purple-700', bg: 'bg-purple-100', icon: <Armchair className="size-3.5" /> },
};

function ServiceModal({
  service,
  onClose,
  onSave,
}: {
  service: Partial<AdminService> | null;
  onClose: () => void;
  onSave: (s: Partial<AdminService>) => void;
}) {
  const [form, setForm] = useState<Partial<AdminService>>(
    service || { name: '', category: 'baggage', description: '', price: 0 }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-[#0f2241] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 p-2 rounded-lg">
              <Tag className="size-5 text-white" />
            </div>
            <div>
              <p className="text-white" style={{ fontWeight: 700 }}>
                {service?.id ? 'Edytuj usługę' : 'Dodaj usługę'}
              </p>
              <p className="text-white/50 text-xs">Cennik usług dodatkowych</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Nazwa usługi *</label>
            <input
              type="text"
              value={form.name || ''}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="np. Bagaż rejestrowany 20 kg"
              className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors text-sm"
            />
          </div>

          <div>
            <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Kategoria</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(categoryConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setForm(f => ({ ...f, category: key as AdminService['category'] }))}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    form.category === key
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`${form.category === key ? 'text-sky-600' : 'text-slate-400'}`}>
                    {cfg.icon}
                  </div>
                  <span className={`text-xs ${form.category === key ? 'text-sky-700' : 'text-slate-500'}`} style={{ fontWeight: 500 }}>
                    {cfg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Opis</label>
            <textarea
              value={form.description || ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Krótki opis usługi..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Cena standardowa (PLN)</label>
            <div className="relative">
              <input
                type="number"
                value={form.price ?? 0}
                onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                min={0}
                className="w-full px-3 py-2.5 pr-14 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">PLN</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
              style={{ fontWeight: 500 }}
            >
              Anuluj
            </button>
            <button
              onClick={() => { onSave(form); onClose(); }}
              disabled={!form.name}
              className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm shadow-md shadow-orange-500/20 transition-all"
              style={{ fontWeight: 600 }}
            >
              {service?.id ? 'Zapisz zmiany' : 'Dodaj usługę'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ service, onClose, onConfirm }: {
  service: AdminService;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="size-7 text-red-500" />
        </div>
        <h3 className="text-slate-900 mb-2" style={{ fontWeight: 700 }}>Usuń usługę</h3>
        <p className="text-slate-500 text-sm mb-6">
          Czy na pewno chcesz usunąć <span style={{ fontWeight: 600 }}>„{service.name}"</span>? Tej operacji nie można cofnąć.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
            style={{ fontWeight: 500 }}
          >
            Anuluj
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm transition-all"
            style={{ fontWeight: 600 }}
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
}

export function ServicesPage() {
  const [services, setServices] = useState(initialServices);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [addModal, setAddModal] = useState(false);
  const [editService, setEditService] = useState<AdminService | null>(null);
  const [deleteService, setDeleteService] = useState<AdminService | null>(null);

  const filtered = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || s.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleAdd = (form: Partial<AdminService>) => {
    setServices(prev => [...prev, { ...form, id: `s${Date.now()}` } as AdminService]);
  };

  const handleEdit = (form: Partial<AdminService>) => {
    setServices(prev => prev.map(s => s.id === editService?.id ? { ...s, ...form } : s));
  };

  const handleDelete = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 800, fontSize: '1.5rem' }}>Katalog Usług</h1>
          <p className="text-slate-500 text-sm mt-0.5">Zarządzaj cennikiem usług dodatkowych</p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm shadow-md shadow-orange-500/20 transition-all"
          style={{ fontWeight: 600 }}
        >
          <Plus className="size-4" />
          Dodaj usługę
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(categoryConfig).map(([key, cfg]) => {
          const count = services.filter(s => s.category === key).length;
          return (
            <div key={key} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
              <div className={`${cfg.bg} p-2.5 rounded-xl`}>
                <span className={cfg.color}>{cfg.icon}</span>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{cfg.label}</p>
                <p className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.25rem' }}>{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Szukaj usługi…"
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:border-sky-400 focus:outline-none transition-colors w-56"
            />
          </div>

          <div className="flex gap-2">
            {[['all', 'Wszystkie'], ...Object.entries(categoryConfig).map(([k, v]) => [k, v.label])].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterCat(key)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  filterCat === key
                    ? 'bg-[#0f2241] text-white'
                    : 'border border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
                style={{ fontWeight: 500 }}
              >
                {label}
              </button>
            ))}
          </div>

          <span className="ml-auto text-slate-400 text-sm">{filtered.length} usług</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Nazwa usługi', 'Kategoria', 'Opis', 'Cena standardowa', 'Akcje'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-400 text-xs" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((service, idx) => {
                const cat = categoryConfig[service.category];
                return (
                  <tr
                    key={service.id}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>{service.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${cat.bg} ${cat.color}`} style={{ fontWeight: 600 }}>
                        {cat.icon}
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-500 text-sm truncate max-w-[220px]">{service.description}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm ${service.price === 0 ? 'text-green-600' : 'text-slate-900'}`} style={{ fontWeight: 700 }}>
                        {service.price === 0 ? 'Wliczone' : `${service.price.toLocaleString('pl-PL')} PLN`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditService(service)}
                          className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
                          title="Edytuj"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteService(service)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Usuń"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Tag className="size-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">Brak usług spełniających kryteria</p>
            </div>
          )}
        </div>
      </div>

      {addModal && (
        <ServiceModal service={null} onClose={() => setAddModal(false)} onSave={handleAdd} />
      )}
      {editService && (
        <ServiceModal service={editService} onClose={() => setEditService(null)} onSave={handleEdit} />
      )}
      {deleteService && (
        <DeleteConfirmModal
          service={deleteService}
          onClose={() => setDeleteService(null)}
          onConfirm={() => handleDelete(deleteService.id)}
        />
      )}
    </div>
  );
}
