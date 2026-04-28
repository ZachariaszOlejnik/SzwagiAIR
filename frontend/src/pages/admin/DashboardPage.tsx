import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, Plane, Users, TrendingUp, Calendar, Search, MoreVertical,
  X, ChevronRight, AlertTriangle, CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import { adminFlights, AIRPORTS, AIRCRAFT_TYPES, AdminFlight } from '../../data/mockData';

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  scheduled: { label: 'Zaplanowany', icon: <Clock className="size-3.5" />, className: 'bg-blue-100 text-blue-700' },
  boarding: { label: 'Boarding', icon: <CheckCircle2 className="size-3.5" />, className: 'bg-green-100 text-green-700' },
  departed: { label: 'Wyleciał', icon: <Plane className="size-3.5" />, className: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Anulowany', icon: <XCircle className="size-3.5" />, className: 'bg-red-100 text-red-700' },
  delayed: { label: 'Opóźniony', icon: <AlertTriangle className="size-3.5" />, className: 'bg-amber-100 text-amber-700' },
};

function AddFlightModal({ onClose, onAdd }: { onClose: () => void; onAdd: (f: Partial<AdminFlight>) => void }) {
  const [form, setForm] = useState({
    number: '',
    from: 'WAW',
    to: 'JFK',
    date: '2026-04-22',
    time: '10:00',
    aircraft: 'B787',
    basePrice: 1299,
    capacity: 296,
  });

  const selectedAircraft = AIRCRAFT_TYPES.find(a => a.code === form.aircraft);

  const handleSubmit = () => {
    const fromAirport = AIRPORTS.find(a => a.code === form.from);
    const toAirport = AIRPORTS.find(a => a.code === form.to);
    onAdd({
      number: form.number || `SA ${Math.floor(Math.random() * 900) + 100}`,
      from: form.from,
      fromCity: fromAirport?.city || '',
      to: form.to,
      toCity: toAirport?.city || '',
      date: form.date,
      time: form.time,
      aircraft: selectedAircraft?.name || '',
      capacity: selectedAircraft?.capacity || form.capacity,
      basePrice: form.basePrice,
      seatsBooked: 0,
      status: 'scheduled',
      crew: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f2241] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 p-2 rounded-lg">
              <Plus className="size-5 text-white" />
            </div>
            <div>
              <p className="text-white" style={{ fontWeight: 700 }}>Dodaj nowy lot</p>
              <p className="text-white/50 text-xs">Wypełnij dane rejsu</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Numer lotu</label>
              <input
                type="text"
                value={form.number}
                onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                placeholder="SA 999"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Samolot</label>
              <select
                value={form.aircraft}
                onChange={e => setForm(f => ({ ...f, aircraft: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors text-sm"
              >
                {AIRCRAFT_TYPES.map(a => (
                  <option key={a.code} value={a.code}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Lotnisko startowe</label>
              <select
                value={form.from}
                onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors text-sm"
              >
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>{a.code} — {a.city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Lotnisko docelowe</label>
              <select
                value={form.to}
                onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors text-sm"
              >
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>{a.code} — {a.city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Data wylotu</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Godzina wylotu</label>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Cena bazowa (PLN)</label>
              <input
                type="number"
                value={form.basePrice}
                onChange={e => setForm(f => ({ ...f, basePrice: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Pojemność</label>
              <input
                type="number"
                value={selectedAircraft?.capacity || form.capacity}
                readOnly
                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-100 text-slate-500 text-sm"
              />
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
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm shadow-md shadow-orange-500/20 transition-all"
              style={{ fontWeight: 600 }}
            >
              Dodaj lot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState(adminFlights);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = flights.filter(f =>
    f.number.toLowerCase().includes(search.toLowerCase()) ||
    f.from.toLowerCase().includes(search.toLowerCase()) ||
    f.to.toLowerCase().includes(search.toLowerCase()) ||
    f.fromCity.toLowerCase().includes(search.toLowerCase()) ||
    f.toCity.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: flights.length,
    todayDepartures: flights.filter(f => f.date === '2026-04-20').length,
    totalPassengers: flights.reduce((s, f) => s + f.seatsBooked, 0),
    revenue: flights.reduce((s, f) => s + f.basePrice * f.seatsBooked, 0),
  };

  const handleAdd = (f: Partial<AdminFlight>) => {
    setFlights(prev => [
      ...prev,
      { ...f, id: `af${Date.now()}` } as AdminFlight,
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 800, fontSize: '1.5rem' }}>Siatka Lotów</h1>
          <p className="text-slate-500 text-sm mt-0.5">Zarządzaj zaplanowanymi rejsami</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm shadow-md shadow-orange-500/20 transition-all"
          style={{ fontWeight: 600 }}
        >
          <Plus className="size-4" />
          Dodaj nowy lot
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Wszystkich lotów', value: stats.total, icon: Plane, color: 'bg-sky-500', bg: 'bg-sky-50', text: 'text-sky-600' },
          { label: 'Dzisiejsze odloty', value: stats.todayDepartures, icon: Calendar, color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-600' },
          { label: 'Pasażerowie (dziś)', value: stats.totalPassengers.toLocaleString(), icon: Users, color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-600' },
          { label: 'Przychód', value: `${(stats.revenue / 1000000).toFixed(1)}M PLN`, icon: TrendingUp, color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-1" style={{ fontWeight: 500 }}>{stat.label}</p>
                <p className="text-slate-900" style={{ fontWeight: 800, fontSize: '1.5rem' }}>{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-2.5 rounded-xl`}>
                <stat.icon className={`size-5 ${stat.text}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Szukaj lotu, trasy…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:border-sky-400 focus:outline-none transition-colors"
            />
          </div>
          <span className="text-slate-400 text-sm">{filtered.length} lotów</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Numer lotu', 'Trasa', 'Data / Godzina', 'Samolot', 'Zajętość', 'Cena bazowa', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-400 text-xs" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((flight, idx) => {
                const st = statusConfig[flight.status];
                const occupancy = Math.round((flight.seatsBooked / flight.capacity) * 100);
                return (
                  <tr
                    key={flight.id}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#0f2241] flex items-center justify-center shrink-0">
                          <Plane className="size-4 text-white" />
                        </div>
                        <span className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>{flight.number}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-700 text-sm" style={{ fontWeight: 600 }}>
                        {flight.from}
                      </span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="text-slate-700 text-sm" style={{ fontWeight: 600 }}>
                        {flight.to}
                      </span>
                      <p className="text-slate-400 text-xs">{flight.fromCity} → {flight.toCity}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-700 text-sm" style={{ fontWeight: 500 }}>
                        {new Date(flight.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-slate-400 text-xs">{flight.time}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-700 text-sm truncate max-w-[140px]">{flight.aircraft}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${occupancy > 95 ? 'bg-red-500' : occupancy > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                        <span className="text-slate-500 text-xs shrink-0">{occupancy}%</span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">{flight.seatsBooked}/{flight.capacity}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>
                        {flight.basePrice.toLocaleString('pl-PL')} PLN
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${st.className}`} style={{ fontWeight: 600 }}>
                        {st.icon}
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(`/admin/crew/${flight.id}`)}
                        className="flex items-center gap-1 text-sky-600 hover:text-sky-700 text-xs transition-colors"
                        style={{ fontWeight: 600 }}
                      >
                        Załoga
                        <ChevronRight className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Plane className="size-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">Brak lotów spełniających kryteria</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddFlightModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
