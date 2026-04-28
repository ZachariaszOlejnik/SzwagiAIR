import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  User, Mail, Phone, Briefcase, Package, Crown, Utensils, Star, Armchair,
  Check, Plus, Minus, ArrowRight, Plane, Clock, ChevronRight,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { bookingServices, Flight } from '../data/mockData';

const iconMap: Record<string, React.ReactNode> = {
  briefcase: <Briefcase className="size-5" />,
  luggage: <Package className="size-5" />,
  package: <Package className="size-5" />,
  crown: <Crown className="size-5" />,
  utensils: <Utensils className="size-5" />,
  star: <Star className="size-5" />,
  armchair: <Armchair className="size-5" />,
};

interface LocationState {
  flight: Flight;
  passengers: number;
  queryEngine: 'orm' | 'sql';
}

export function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const flight = state?.flight || {
    id: 'f1', flightNumber: 'SA 301', from: 'WAW', fromCity: 'Warszawa',
    to: 'JFK', toCity: 'Nowy Jork', via: 'LHR', viaCity: 'Londyn',
    departureTime: '08:15', arrivalTime: '18:45', duration: '13h 30m',
    direct: false, layoverDuration: '4h', price: 1299, seatsLeft: 3, aircraft: 'Boeing 787-9', date: '2026-04-20',
  };
  const passengers = state?.passengers || 1;
  const queryEngine = state?.queryEngine || 'orm';

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set(['carry-on']));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleService = (serviceId: string) => {
    if (serviceId === 'carry-on') return; // cannot deselect included service
    setSelectedServices(prev => {
      const next = new Set(prev);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  };

  const servicesTotal = bookingServices
    .filter(s => selectedServices.has(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const total = (flight.price + servicesTotal) * passengers;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Wymagane';
    if (!form.lastName.trim()) e.lastName = 'Wymagane';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Podaj prawidłowy e-mail';
    if (!form.phone.trim()) e.phone = 'Wymagane';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceed = () => {
    if (!validate()) return;
    navigate('/payment', {
      state: {
        flight,
        passengers,
        selectedServices: Array.from(selectedServices),
        total,
        passengerInfo: form,
        queryEngine,
      },
    });
  };

  const baggageServices = bookingServices.filter(s => s.category === 'baggage');
  const premiumServices = bookingServices.filter(s => s.category === 'premium');

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar showBack backLabel="Wyniki wyszukiwania" backTo="/results" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="size-4 text-white" />
            </div>
            <span className="text-slate-500 text-sm" style={{ fontWeight: 500 }}>Wybór lotu</span>
          </div>
          <ChevronRight className="size-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#0f2241] flex items-center justify-center">
              <span className="text-white text-xs" style={{ fontWeight: 700 }}>2</span>
            </div>
            <span className="text-[#0f2241] text-sm" style={{ fontWeight: 600 }}>Dane & Usługi</span>
          </div>
          <ChevronRight className="size-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-slate-500 text-xs" style={{ fontWeight: 700 }}>3</span>
            </div>
            <span className="text-slate-400 text-sm">Płatność</span>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          {/* Left column */}
          <div className="flex-1 space-y-6">
            {/* Flight summary mini card */}
            <div className="bg-[#0f2241] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Plane className="size-4 text-sky-400" />
                <span className="text-sky-400 text-sm" style={{ fontWeight: 600 }}>{flight.flightNumber}</span>
                <span className="text-white/30">·</span>
                <span className="text-white/60 text-sm">{flight.aircraft}</span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p style={{ fontWeight: 800, fontSize: '1.75rem', lineHeight: 1 }}>{flight.departureTime}</p>
                  <p className="text-sky-300 text-sm" style={{ fontWeight: 600 }}>{flight.from}</p>
                  <p className="text-white/50 text-xs">{flight.fromCity}</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-white/50 text-xs">{flight.duration}</span>
                  <div className="w-full flex items-center gap-2">
                    <div className="flex-1 h-px bg-white/20" />
                    {!flight.direct && (
                      <span className="text-amber-400 text-xs px-2 py-0.5 bg-amber-400/10 rounded-full border border-amber-400/30" style={{ fontWeight: 600 }}>
                        {flight.layoverDuration} · {flight.via}
                      </span>
                    )}
                    <div className="flex-1 h-px bg-white/20" />
                  </div>
                </div>
                <div className="text-right">
                  <p style={{ fontWeight: 800, fontSize: '1.75rem', lineHeight: 1 }}>{flight.arrivalTime}</p>
                  <p className="text-sky-300 text-sm" style={{ fontWeight: 600 }}>{flight.to}</p>
                  <p className="text-white/50 text-xs">{flight.toCity}</p>
                </div>
              </div>
            </div>

            {/* Passenger form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-[#0f2241] mb-5" style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                Dane pasażera
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-600 text-sm mb-1.5 flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                    <User className="size-3.5 text-sky-500" />
                    Imię *
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    placeholder="Jan"
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 text-slate-900 focus:outline-none transition-colors ${errors.firstName ? 'border-red-400' : 'border-slate-200 focus:border-sky-500'}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="text-slate-600 text-sm mb-1.5 flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                    <User className="size-3.5 text-sky-500" />
                    Nazwisko *
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    placeholder="Kowalski"
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 text-slate-900 focus:outline-none transition-colors ${errors.lastName ? 'border-red-400' : 'border-slate-200 focus:border-sky-500'}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="text-slate-600 text-sm mb-1.5 flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                    <Mail className="size-3.5 text-sky-500" />
                    Adres e-mail *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="jan@kowalski.pl"
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 text-slate-900 focus:outline-none transition-colors ${errors.email ? 'border-red-400' : 'border-slate-200 focus:border-sky-500'}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="text-slate-600 text-sm mb-1.5 flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                    <Phone className="size-3.5 text-sky-500" />
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+48 600 000 000"
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 text-slate-900 focus:outline-none transition-colors ${errors.phone ? 'border-red-400' : 'border-slate-200 focus:border-sky-500'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-[#0f2241] mb-5" style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                Usługi dodatkowe
              </h2>

              <p className="text-slate-500 text-sm mb-4" style={{ fontWeight: 500 }}>Bagaż</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {baggageServices.map(service => {
                  const selected = selectedServices.has(service.id);
                  const isIncluded = service.id === 'carry-on';
                  return (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`relative flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all ${
                        selected
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      } ${isIncluded ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {selected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center">
                          <Check className="size-3 text-white" />
                        </div>
                      )}
                      <div className={`${selected ? 'text-sky-600' : 'text-slate-400'}`}>
                        {iconMap[service.icon]}
                      </div>
                      <p className={`text-sm ${selected ? 'text-sky-700' : 'text-slate-700'}`} style={{ fontWeight: 600 }}>
                        {service.name}
                      </p>
                      <p className="text-slate-400 text-xs">{service.description}</p>
                      <p className={`text-sm ${selected ? 'text-sky-600' : 'text-slate-900'}`} style={{ fontWeight: 700 }}>
                        {service.price === 0 ? 'Wliczone' : `+${service.price} PLN`}
                      </p>
                    </button>
                  );
                })}
              </div>

              <p className="text-slate-500 text-sm mb-4" style={{ fontWeight: 500 }}>Premium & Comfort</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {premiumServices.map(service => {
                  const selected = selectedServices.has(service.id);
                  return (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        selected
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {iconMap[service.icon]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${selected ? 'text-orange-700' : 'text-slate-700'}`} style={{ fontWeight: 600 }}>
                          {service.name}
                        </p>
                        <p className="text-slate-400 text-xs truncate">{service.description}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-sm ${selected ? 'text-orange-600' : 'text-slate-700'}`} style={{ fontWeight: 700 }}>
                          +{service.price} PLN
                        </p>
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ml-auto transition-colors ${
                          selected ? 'border-orange-400 bg-orange-400' : 'border-slate-300'
                        }`}>
                          {selected && <Check className="size-3 text-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column — sticky price summary */}
          <div className="w-80 shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-[#0f2241] px-5 py-4">
                  <p className="text-white/60 text-xs" style={{ fontWeight: 500 }}>Podsumowanie kosztów</p>
                  <p className="text-white mt-0.5" style={{ fontWeight: 700, fontSize: '1.125rem' }}>Twoja rezerwacja</p>
                </div>

                <div className="p-5 space-y-3">
                  {/* Base price */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Bilet × {passengers}</span>
                    <span className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>
                      {(flight.price * passengers).toLocaleString('pl-PL')} PLN
                    </span>
                  </div>

                  {/* Selected services */}
                  {bookingServices.filter(s => selectedServices.has(s.id) && s.price > 0).map(s => (
                    <div key={s.id} className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm">{s.name}</span>
                      <span className="text-slate-700 text-sm" style={{ fontWeight: 500 }}>+{(s.price * passengers).toLocaleString('pl-PL')} PLN</span>
                    </div>
                  ))}

                  {selectedServices.size > 1 && (
                    <div className="pt-1 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-slate-500 text-sm">Usługi dodatkowe</span>
                      <span className="text-slate-700 text-sm" style={{ fontWeight: 500 }}>
                        +{(servicesTotal * passengers).toLocaleString('pl-PL')} PLN
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t-2 border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700" style={{ fontWeight: 600 }}>Razem</span>
                      <div className="text-right">
                        <p className="text-[#0f2241]" style={{ fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.1 }}>
                          {total.toLocaleString('pl-PL')} PLN
                        </p>
                        <p className="text-slate-400 text-xs">+ VAT 23%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    onClick={handleProceed}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-all active:scale-[0.99]"
                    style={{ fontWeight: 700 }}
                  >
                    Przejdź do płatności
                    <ArrowRight className="size-5" />
                  </button>
                  <p className="text-center text-slate-400 text-xs mt-3">
                    Bezpieczna płatność SSL · Gwarancja zwrotu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
