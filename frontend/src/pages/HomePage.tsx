import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plane, MapPin, Calendar, Users, ArrowRight, Search, LogOut, LogIn, ArrowLeftRight } from 'lucide-react';
import { AIRPORTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1768553496861-8588cb6c7122?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwbGFuZSUyMHdpbmclMjBjbG91ZHMlMjBhZXJpYWwlMjB2aWV3fGVufDF8fHx8MTc3NjM3MDI4M3ww&ixlib=rb-4.1.0&q=80&w=1080';

export function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [from, setFrom] = useState('WAW');
  const [to, setTo] = useState('JFK');
  const [date, setDate] = useState('2026-04-20');
  const [passengers, setPassengers] = useState(1);
  const [queryEngine, setQueryEngine] = useState<'orm' | 'sql'>('orm');
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [returnDate, setReturnDate] = useState('2026-04-27');

  const handleSearch = () => {
    navigate('/results', {
      state: { from, to, date, passengers, queryEngine, tripType, returnDate: tripType === 'round-trip' ? returnDate : null },
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Widok z samolotu"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2241]/80 via-[#0f2241]/60 to-[#0f2241]/90" />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/30">
            <Plane className="size-6 text-white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.375rem', color: 'white', letterSpacing: '-0.02em' }}>
            Szwagi<span className="text-orange-400">AIR</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20">
                <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs" style={{ fontWeight: 700 }}>
                  {user.name.charAt(0)}
                </div>
                <span className="text-white text-sm">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm hover:bg-white/20 transition-all"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Wyloguj</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm hover:bg-white/30 transition-all"
              style={{ fontWeight: 600 }}
            >
              <LogIn className="size-4" />
              Zaloguj się
            </button>
          )}
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-300 text-sm mb-4">
            <Plane className="size-3.5" />
            Szybko, wygodnie, niezawodnie
          </div>
          <h1 className="text-white mb-3" style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
            Twój lot, Twoje zasady.
          </h1>
          <p className="text-white/70" style={{ fontSize: '1.125rem' }}>
            Poszukaj najlepszych połączeń lotniczych w całej Europie i na świecie.
          </p>
        </div>

        {/* Search Card */}
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-[#0f2241] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-sky-400" />
              <span className="text-white" style={{ fontWeight: 600 }}>Wyszukaj lot</span>
            </div>
            {/* ORM / Raw SQL Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-xs">Silnik zapytań:</span>
              <div className="flex rounded-lg border border-white/20 overflow-hidden bg-white/10">
                <button
                  onClick={() => setQueryEngine('orm')}
                  className={`px-3 py-1.5 text-xs transition-all ${
                    queryEngine === 'orm'
                      ? 'bg-sky-500 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  ORM
                </button>
                <button
                  onClick={() => setQueryEngine('sql')}
                  className={`px-3 py-1.5 text-xs transition-all ${
                    queryEngine === 'sql'
                      ? 'bg-sky-500 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  Raw SQL
                </button>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6">

            {/* Trip type toggle */}
            <div className="flex items-center gap-2 mb-5">
              <button
                onClick={() => setTripType('one-way')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm transition-all ${
                  tripType === 'one-way'
                    ? 'bg-[#0f2241] border-[#0f2241] text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
                style={{ fontWeight: tripType === 'one-way' ? 600 : 400 }}
              >
                <ArrowRight className="size-3.5" />
                W jedną stronę
              </button>
              <button
                onClick={() => setTripType('round-trip')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm transition-all ${
                  tripType === 'round-trip'
                    ? 'bg-[#0f2241] border-[#0f2241] text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
                style={{ fontWeight: tripType === 'round-trip' ? 600 : 400 }}
              >
                <ArrowLeftRight className="size-3.5" />
                W obie strony
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* From */}
              <div>
                <label className="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  <MapPin className="size-3.5 text-sky-500" />
                  Skąd (kod IATA)
                </label>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors"
                  style={{ fontWeight: 600, fontSize: '1rem' }}
                >
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.code} — {a.city}, {a.country}
                    </option>
                  ))}
                </select>
              </div>

              {/* To */}
              <div>
                <label className="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  <MapPin className="size-3.5 text-orange-500" />
                  Dokąd (kod IATA)
                </label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-orange-500 focus:outline-none transition-colors"
                  style={{ fontWeight: 600, fontSize: '1rem' }}
                >
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.code} — {a.city}, {a.country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  <Calendar className="size-3.5 text-sky-500" />
                  Data wylotu
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors"
                  style={{ fontWeight: 500 }}
                />
              </div>

              {/* Return Date (only round-trip) */}
              {tripType === 'round-trip' ? (
                <div>
                  <label className="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    <Calendar className="size-3.5 text-orange-500" />
                    Data powrotu
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    min={date}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 bg-orange-50 text-slate-900 focus:border-orange-400 focus:outline-none transition-colors"
                    style={{ fontWeight: 500 }}
                  />
                </div>
              ) : (
                /* Passengers (in row with date when one-way) */
                <div>
                  <label className="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    <Users className="size-3.5 text-sky-500" />
                    Liczba pasażerów
                  </label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'pasażer' : 'pasażerów'}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Passengers full-width when round-trip */}
              {tripType === 'round-trip' && (
                <div className="md:col-span-2">
                  <label className="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    <Users className="size-3.5 text-sky-500" />
                    Liczba pasażerów
                  </label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'pasażer' : 'pasażerów'}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={handleSearch}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-[0.99]"
              style={{ fontWeight: 700, fontSize: '1rem' }}
            >
              <Search className="size-5" />
              Szukaj lotu
              <ArrowRight className="size-5" />
            </button>

            <p className="text-center text-slate-400 text-xs mt-3">
              Używasz silnika: <span className="text-sky-600" style={{ fontWeight: 600 }}>{queryEngine === 'orm' ? 'ORM (Hibernate)' : 'Raw SQL (JDBC)'}</span>
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center gap-8 mt-10 text-white/50 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500/30 border border-green-400/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            Certyfikat IATA
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-sky-500/30 border border-sky-400/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-sky-400" />
            </div>
            Płatności SSL
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-500/30 border border-orange-400/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
            </div>
            24/7 Wsparcie
          </div>
        </div>
      </main>
    </div>
  );
}