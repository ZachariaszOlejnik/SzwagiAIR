import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  CreditCard, Smartphone, Lock, CheckCircle2, Plane, ArrowRight,
  ChevronRight, Copy, Download, Home,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { bookingServices } from '../data/mockData';
import confetti from 'canvas-confetti';

function generateBookingNumber() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const nums = '0123456789';
  let code = 'SA-';
  for (let i = 0; i < 3; i++) code += letters[Math.floor(Math.random() * letters.length)];
  code += '-';
  for (let i = 0; i < 5; i++) code += nums[Math.floor(Math.random() * nums.length)];
  return code;
}

interface LocationState {
  flight: any;
  passengers: number;
  selectedServices: string[];
  total: number;
  passengerInfo: { firstName: string; lastName: string; email: string; phone: string };
  queryEngine: 'orm' | 'sql';
}

export function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const flight = state?.flight;
  const passengers = state?.passengers || 1;
  const total = state?.total || 1299;
  const passengerInfo = state?.passengerInfo;
  const selectedServiceIds = state?.selectedServices || [];
  const selectedServicesList = bookingServices.filter(s => selectedServiceIds.includes(s.id) && s.price > 0);

  const [method, setMethod] = useState<'card' | 'blik'>('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', holder: '' });
  const [blikCode, setBlikCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingNumber] = useState(generateBookingNumber);
  const [copied, setCopied] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    await new Promise(res => setTimeout(res, 2000));
    setProcessing(false);
    setSuccess(true);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#f97316', '#0ea5e9', '#0f2241', '#ffffff'],
    });
  };

  const formatCardNumber = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2);
    return clean;
  };

  const copyBookingNumber = () => {
    navigator.clipboard.writeText(bookingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Success card */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Top strip */}
              <div className="bg-gradient-to-r from-[#0f2241] to-sky-700 px-8 py-10 text-center">
                <div className="w-20 h-20 rounded-full bg-green-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-400/30">
                  <CheckCircle2 className="size-10 text-white" />
                </div>
                <h1 className="text-white mb-1" style={{ fontWeight: 800, fontSize: '1.625rem' }}>
                  Rezerwacja potwierdzona!
                </h1>
                <p className="text-white/70 text-sm">
                  Twój bilet został zarezerwowany i opłacony.
                </p>
              </div>

              <div className="p-8">
                {/* Booking number */}
                <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center mb-6">
                  <p className="text-slate-400 text-xs mb-2" style={{ fontWeight: 600, letterSpacing: '0.1em' }}>
                    NUMER REZERWACJI
                  </p>
                  <p className="text-[#0f2241]" style={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '0.05em' }}>
                    {bookingNumber}
                  </p>
                  <button
                    onClick={copyBookingNumber}
                    className="mt-3 flex items-center gap-2 text-sky-600 text-sm mx-auto hover:text-sky-700 transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    {copied ? <><CheckCircle2 className="size-4 text-green-500" /> Skopiowano!</> : <><Copy className="size-4" /> Kopiuj numer</>}
                  </button>
                </div>

                {/* Flight detail */}
                {flight && (
                  <div className="flex items-center justify-between py-4 border-b border-slate-100 mb-4">
                    <div className="text-center">
                      <p className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.25rem' }}>{flight.departureTime}</p>
                      <p className="text-slate-500 text-sm" style={{ fontWeight: 600 }}>{flight.from}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Plane className="size-5 text-sky-500" />
                      <p className="text-slate-400 text-xs">{flight.flightNumber}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.25rem' }}>{flight.arrivalTime}</p>
                      <p className="text-slate-500 text-sm" style={{ fontWeight: 600 }}>{flight.to}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Pasażer</span>
                    <span className="text-slate-700" style={{ fontWeight: 500 }}>
                      {passengerInfo ? `${passengerInfo.firstName} ${passengerInfo.lastName}` : 'Jan Kowalski'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs" style={{ fontWeight: 700 }}>
                      ✓ OPŁACONA
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Zapłacono</span>
                    <span className="text-slate-900" style={{ fontWeight: 700 }}>{total.toLocaleString('pl-PL')} PLN</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 text-slate-700 text-sm hover:border-slate-300 hover:bg-slate-50 transition-all"
                    style={{ fontWeight: 600 }}
                  >
                    <Home className="size-4" />
                    Strona główna
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm shadow-md shadow-orange-500/20 transition-all"
                    style={{ fontWeight: 600 }}
                  >
                    <Download className="size-4" />
                    Pobierz bilet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar showBack backLabel="Konfiguracja rezerwacji" backTo="/booking" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle2 className="size-4 text-white" />
            </div>
            <span className="text-slate-500 text-sm" style={{ fontWeight: 500 }}>Wybór lotu</span>
          </div>
          <ChevronRight className="size-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle2 className="size-4 text-white" />
            </div>
            <span className="text-slate-500 text-sm" style={{ fontWeight: 500 }}>Dane & Usługi</span>
          </div>
          <ChevronRight className="size-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#0f2241] flex items-center justify-center">
              <span className="text-white text-xs" style={{ fontWeight: 700 }}>3</span>
            </div>
            <span className="text-[#0f2241] text-sm" style={{ fontWeight: 600 }}>Płatność</span>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          {/* Payment form */}
          <div className="flex-1 space-y-5">
            {/* Method selector */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-[#0f2241] mb-4" style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                Metoda płatności
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod('card')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    method === 'card' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${method === 'card' ? 'bg-sky-500' : 'bg-slate-100'}`}>
                    <CreditCard className={`size-5 ${method === 'card' ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm ${method === 'card' ? 'text-sky-700' : 'text-slate-700'}`} style={{ fontWeight: 600 }}>
                      Karta kredytowa
                    </p>
                    <p className="text-slate-400 text-xs">Visa, MC, Amex</p>
                  </div>
                </button>
                <button
                  onClick={() => setMethod('blik')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    method === 'blik' ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${method === 'blik' ? 'bg-orange-500' : 'bg-slate-100'}`}>
                    <Smartphone className={`size-5 ${method === 'blik' ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm ${method === 'blik' ? 'text-orange-700' : 'text-slate-700'}`} style={{ fontWeight: 600 }}>
                      BLIK
                    </p>
                    <p className="text-slate-400 text-xs">Kod z aplikacji</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Card form */}
            {method === 'card' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-slate-700 mb-2" style={{ fontWeight: 600 }}>Dane karty</h3>

                {/* Card preview */}
                <div className="bg-gradient-to-br from-[#0f2241] to-sky-700 rounded-2xl p-5 text-white mb-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-12 translate-x-12" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-1">
                      <div className="w-8 h-5 rounded bg-yellow-400/80" />
                      <div className="w-8 h-5 rounded bg-orange-400/60 -ml-3" />
                    </div>
                    <CreditCard className="size-6 text-white/40" />
                  </div>
                  <p className="text-white/60 text-xs mb-1 tracking-widest">NUMER KARTY</p>
                  <p style={{ fontWeight: 600, fontSize: '1.125rem', letterSpacing: '0.15em' }}>
                    {card.number || '•••• •••• •••• ••••'}
                  </p>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-white/50 text-xs">Posiadacz</p>
                      <p className="text-sm" style={{ fontWeight: 500 }}>{card.holder || 'IMIĘ NAZWISKO'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs">Ważna do</p>
                      <p className="text-sm" style={{ fontWeight: 500 }}>{card.expiry || 'MM/RR'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Numer karty</label>
                  <input
                    type="text"
                    value={card.number}
                    onChange={e => setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors"
                    style={{ letterSpacing: '0.1em' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Data ważności</label>
                    <input
                      type="text"
                      value={card.expiry}
                      onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/RR"
                      maxLength={5}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>CVV</label>
                    <input
                      type="text"
                      value={card.cvv}
                      onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                      placeholder="123"
                      maxLength={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-600 text-sm mb-1.5 block" style={{ fontWeight: 500 }}>Imię i nazwisko</label>
                  <input
                    type="text"
                    value={card.holder}
                    onChange={e => setCard(c => ({ ...c, holder: e.target.value.toUpperCase() }))}
                    placeholder="JAN KOWALSKI"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-500 focus:outline-none transition-colors"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>
            )}

            {/* BLIK */}
            {method === 'blik' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-slate-700 mb-4" style={{ fontWeight: 600 }}>Kod BLIK</h3>
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="size-8 text-white" />
                  </div>
                  <p className="text-slate-500 text-sm mb-5">
                    Otwórz aplikację swojego banku i wygeneruj 6-cyfrowy kod BLIK.
                  </p>
                  <div className="flex justify-center gap-2 mb-2">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className="w-12 h-14 rounded-xl border-2 border-slate-200 flex items-center justify-center bg-slate-50"
                      >
                        <span className="text-[#0f2241]" style={{ fontWeight: 700, fontSize: '1.5rem' }}>
                          {blikCode[i] || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={blikCode}
                    onChange={e => setBlikCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Wprowadź 6 cyfr"
                    maxLength={6}
                    className="w-40 px-4 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-center text-slate-900 focus:border-orange-400 focus:outline-none transition-colors mx-auto block mt-3"
                    style={{ letterSpacing: '0.3em', fontWeight: 700 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="w-80 shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-[#0f2241] px-5 py-4">
                  <p className="text-white/60 text-xs" style={{ fontWeight: 500 }}>Podsumowanie</p>
                  <p className="text-white" style={{ fontWeight: 700, fontSize: '1.125rem' }}>Twoja rezerwacja</p>
                </div>

                <div className="p-5 space-y-3">
                  {flight && (
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-[#0f2241] flex items-center justify-center shrink-0">
                        <Plane className="size-4 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-700 text-sm" style={{ fontWeight: 600 }}>
                          {flight.from} → {flight.via ? `${flight.via} → ` : ''}{flight.to}
                        </p>
                        <p className="text-slate-400 text-xs">{flight.flightNumber} · {flight.departureTime}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Bilet × {passengers}</span>
                    <span className="text-slate-700" style={{ fontWeight: 500 }}>
                      {flight ? (flight.price * passengers).toLocaleString('pl-PL') : '—'} PLN
                    </span>
                  </div>

                  {selectedServicesList.map(s => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span className="text-slate-500">{s.name}</span>
                      <span className="text-slate-700" style={{ fontWeight: 500 }}>+{s.price * passengers} PLN</span>
                    </div>
                  ))}

                  <div className="pt-3 border-t-2 border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-700" style={{ fontWeight: 600 }}>Do zapłaty</span>
                      <p className="text-[#0f2241]" style={{ fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.1 }}>
                        {total.toLocaleString('pl-PL')} PLN
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    onClick={handlePay}
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white shadow-md shadow-orange-500/20 transition-all active:scale-[0.99]"
                    style={{ fontWeight: 700 }}
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Przetwarzanie…
                      </>
                    ) : (
                      <>
                        <Lock className="size-4" />
                        Zapłać i Rezerwuj
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-3 text-slate-400 text-xs">
                    <Lock className="size-3" />
                    Płatność szyfrowana SSL/TLS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
