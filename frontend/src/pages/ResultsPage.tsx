import { useLocation, useNavigate } from 'react-router';
import { Plane, Clock, MapPin, Users, AlertTriangle, ChevronRight, ArrowRight, Filter, Zap, Database } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { searchResults } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const statusColors: Record<string, string> = {
  'scheduled': 'bg-blue-100 text-blue-700',
  'boarding': 'bg-green-100 text-green-700',
  'departed': 'bg-slate-100 text-slate-600',
  'cancelled': 'bg-red-100 text-red-700',
  'delayed': 'bg-amber-100 text-amber-700',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

interface LocationState {
  from: string;
  to: string;
  date: string;
  passengers: number;
  queryEngine: 'orm' | 'sql';
}

export function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = (location.state as LocationState) || {
    from: 'WAW', to: 'JFK', date: '2026-04-20', passengers: 1, queryEngine: 'orm',
  };

  const handleSelect = (flightId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const flight = searchResults.find(f => f.id === flightId);
    navigate('/booking', { state: { flight, passengers: state.passengers, queryEngine: state.queryEngine } });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar showBack backLabel="Nowe wyszukiwanie" backTo="/" />

      {/* Results header */}
      <div className="bg-[#0f2241] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{state.from}</span>
              <ArrowRight className="size-5 text-sky-400" />
              <span className="text-2xl" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{state.to}</span>
            </div>
            <div className="h-5 w-px bg-white/20" />
            <span className="text-white/70 text-sm">{formatDate(state.date)}</span>
            <div className="h-5 w-px bg-white/20" />
            <span className="text-white/70 text-sm flex items-center gap-1">
              <Users className="size-3.5" />
              {state.passengers} {state.passengers === 1 ? 'pasażer' : 'pasażerów'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-xs">Znaleziono {searchResults.length} lotów</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs">
              {state.queryEngine === 'orm' ? (
                <><Zap className="size-3" /> ORM (Hibernate)</>
              ) : (
                <><Database className="size-3" /> Raw SQL (JDBC)</>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Filter className="size-4 text-slate-400" />
          <span className="text-slate-500 text-sm">Filtruj:</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-full bg-[#0f2241] text-white text-xs" style={{ fontWeight: 500 }}>
              Wszystkie
            </button>
            <button className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-xs hover:border-slate-300 transition-colors" style={{ fontWeight: 500 }}>
              Bezpośrednie
            </button>
            <button className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-xs hover:border-slate-300 transition-colors" style={{ fontWeight: 500 }}>
              Z przesiadką
            </button>
            <button className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-xs hover:border-slate-300 transition-colors" style={{ fontWeight: 500 }}>
              Najtańsze
            </button>
          </div>
        </div>
      </div>

      {/* Flight Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {searchResults.map((flight) => (
          <div
            key={flight.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-200 transition-all overflow-hidden group"
          >
            {/* Card top accent */}
            {flight.seatsLeft <= 3 && (
              <div className="bg-red-500 text-white text-xs px-4 py-1.5 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                <AlertTriangle className="size-3.5" />
                Ostatnie {flight.seatsLeft} {flight.seatsLeft === 1 ? 'miejsce' : 'miejsca'}! Zarezerwuj teraz.
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Airline logo/badge */}
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-[#0f2241] flex items-center justify-center">
                    <Plane className="size-6 text-white" />
                  </div>
                </div>

                {/* Flight details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-slate-500 text-sm" style={{ fontWeight: 500 }}>{flight.flightNumber}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 text-sm">{flight.aircraft}</span>
                    {!flight.direct && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs" style={{ fontWeight: 600 }}>
                        1 przesiadka: {flight.via}
                      </span>
                    )}
                    {flight.direct && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs" style={{ fontWeight: 600 }}>
                        Bezpośredni
                      </span>
                    )}
                  </div>

                  {/* Route timeline */}
                  <div className="flex items-center gap-3">
                    {/* Departure */}
                    <div className="text-center">
                      <p className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.2 }}>{flight.departureTime}</p>
                      <p className="text-slate-500 text-sm" style={{ fontWeight: 600 }}>{flight.from}</p>
                      <p className="text-slate-400 text-xs">{flight.fromCity}</p>
                    </div>

                    {/* Duration */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-slate-400 text-xs">{flight.duration}</span>
                      <div className="w-full flex items-center gap-1">
                        <div className="flex-1 h-px bg-slate-200" />
                        {!flight.direct && flight.via ? (
                          <>
                            <div className="relative flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full border-2 border-amber-400 bg-amber-100" />
                              <div className="absolute top-4 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap" style={{ fontWeight: 600 }}>
                                {flight.layoverDuration} — {flight.via}
                              </div>
                            </div>
                            <div className="flex-1 h-px bg-slate-200" />
                          </>
                        ) : (
                          <Plane className="size-4 text-sky-500 rotate-90" />
                        )}
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>
                      <div className="mt-1" />
                    </div>

                    {/* Arrival */}
                    <div className="text-center">
                      <p className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.2 }}>{flight.arrivalTime}</p>
                      <p className="text-slate-500 text-sm" style={{ fontWeight: 600 }}>{flight.to}</p>
                      <p className="text-slate-400 text-xs">{flight.toCity}</p>
                    </div>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="shrink-0 text-right flex flex-col items-end gap-3 pl-4 border-l border-slate-100">
                  <div>
                    <p className="text-slate-400 text-xs">cena od</p>
                    <p className="text-[#0f2241]" style={{ fontWeight: 800, fontSize: '1.625rem', lineHeight: 1.1 }}>
                      {flight.price.toLocaleString('pl-PL')} <span className="text-base text-slate-500" style={{ fontWeight: 500 }}>PLN</span>
                    </p>
                    <p className="text-slate-400 text-xs">/ pasażer</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <MapPin className="size-3" />
                    {flight.seatsLeft > 5
                      ? `${flight.seatsLeft} miejsc wolnych`
                      : <span className="text-red-500" style={{ fontWeight: 600 }}>Tylko {flight.seatsLeft} {flight.seatsLeft === 1 ? 'miejsce' : 'miejsca'}!</span>
                    }
                  </div>

                  <button
                    onClick={() => handleSelect(flight.id)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all group-hover:scale-105 active:scale-100"
                    style={{ fontWeight: 700 }}
                  >
                    Wybierz
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}