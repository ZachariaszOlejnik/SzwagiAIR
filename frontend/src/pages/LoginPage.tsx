import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plane, Mail, Lock, Eye, EyeOff, Shield, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';

const BG_IMAGE = 'https://images.unsplash.com/photo-1761813409487-1043f9908408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwbGFuZSUyMHdpbmRvdyUyMHNreSUyMGNsb3VkcyUyMGNvY2twaXQlMjB2aWV3fGVufDF8fHx8MTc3NjQ0MTUxNXww&ixlib=rb-4.1.0&q=80&w=1080';

const TABS: { role: UserRole; label: string; icon: typeof User }[] = [
  { role: 'passenger', label: 'Pasażer', icon: User },
  { role: 'admin', label: 'Administrator', icon: Shield },
];

const HINTS: Record<UserRole, { email: string; password: string }> = {
  passenger: { email: 'pasazer@szwagiair.pl', password: 'haslo123' },
  admin: { email: 'admin@szwagiair.pl', password: 'admin123' },
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();

  const [role, setRole] = useState<UserRole>('passenger');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    if (!isLoading && user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleRoleSwitch = (r: UserRole) => {
    setRole(r);
    setEmail('');
    setPassword('');
    setError('');
  };

  const fillDemo = () => {
    setEmail(HINTS[role].email);
    setPassword(HINTS[role].password);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Uzupełnij wszystkie pola.');
      return;
    }
    setLoading(true);
    setError('');
    const ok = await login(email, password, role);
    setLoading(false);
    if (ok) {
      navigate(role === 'admin' ? '/admin' : '/');
    } else {
      setError('Nieprawidłowy e-mail lub hasło. Spróbuj danych demonstracyjnych.');
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <img
          src={BG_IMAGE}
          alt="Widok z samolotu"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2241]/90 via-[#0f2241]/75 to-[#1a3a6b]/80" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/15 backdrop-blur-sm p-2 rounded-xl border border-white/25">
            <Plane className="size-7 text-white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.75rem', color: 'white', letterSpacing: '-0.025em' }}>
            Szwagi<span className="text-orange-400">AIR</span>
          </span>
        </div>

        {/* Central copy */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-400/20 border border-sky-400/30">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-sky-300 text-xs" style={{ fontWeight: 600, letterSpacing: '0.06em' }}>BEZPIECZNE LOGOWANIE</span>
          </div>

          <h1 className="text-white" style={{ fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.15, letterSpacing: '-0.025em' }}>
            Witaj ponownie<br />na pokładzie!
          </h1>
          <p className="text-white/60" style={{ fontSize: '1.0625rem', lineHeight: 1.6, maxWidth: '28rem' }}>
            Zaloguj się, aby zarezerwować loty, sprawdzić swoje podróże lub zarządzać operacjami linii lotniczych.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 pt-4">
            {[
              { value: '2.4M+', label: 'Zadowolonych pasażerów' },
              { value: '180+', label: 'Destynacji' },
              { value: '99.2%', label: 'Punktualność' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white" style={{ fontWeight: 800, fontSize: '1.375rem' }}>{s.value}</p>
                <p className="text-white/45 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <blockquote className="text-white/40 text-sm italic">
            "Latamy dalej, bo zależy nam na Tobie."
          </blockquote>
        </div>
      </div>

      {/* Right panel – login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50 min-h-screen">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2.5">
          <div className="bg-[#0f2241] p-2 rounded-xl">
            <Plane className="size-6 text-white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f2241', letterSpacing: '-0.025em' }}>
            Szwagi<span className="text-orange-500">AIR</span>
          </span>
        </div>

        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
            {/* Role switcher */}
            <div className="p-1.5 bg-slate-100 m-5 rounded-xl flex gap-1">
              {TABS.map(({ role: r, label, icon: Icon }) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    role === r
                      ? 'bg-white shadow-sm text-[#0f2241] border border-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  style={{ fontWeight: role === r ? 600 : 400 }}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Form area */}
            <div className="px-7 pb-7">
              {/* Heading */}
              <div className="mb-6">
                <h2 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem', letterSpacing: '-0.02em' }}>
                  {role === 'passenger' ? 'Zaloguj się do konta' : 'Panel Administratora'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {role === 'passenger'
                    ? 'Wejdź na pokład i zarządzaj swoimi rezerwacjami.'
                    : 'Dostęp do zarządzania lotami i załogą.'}
                </p>
              </div>

              {/* Demo hint */}
              <button
                type="button"
                onClick={fillDemo}
                className="w-full mb-5 flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-sky-300 bg-sky-50 hover:bg-sky-100 transition-colors text-left group"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-sky-100 group-hover:bg-sky-200 flex items-center justify-center transition-colors">
                  <ArrowRight className="size-4 text-sky-600" />
                </div>
                <div>
                  <p className="text-sky-700 text-xs" style={{ fontWeight: 600 }}>Dane demonstracyjne</p>
                  <p className="text-sky-500 text-xs mt-0.5 font-mono">{HINTS[role].email}</p>
                </div>
              </button>

              {/* Error */}
              {error && (
                <div
                  key={shakeKey}
                  className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 mb-5"
                  style={{ animation: 'shake 0.4s ease' }}
                >
                  <AlertCircle className="size-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-slate-600 text-sm mb-1.5" style={{ fontWeight: 500 }}>
                    Adres e-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={HINTS[role].email}
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-slate-600 text-sm mb-1.5" style={{ fontWeight: 500 }}>
                    Hasło
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-white text-sm transition-all duration-200 disabled:opacity-70 mt-2"
                  style={{
                    background: loading ? '#374151' : role === 'admin' ? '#0f2241' : 'linear-gradient(135deg, #0284c7, #0f2241)',
                    fontWeight: 600,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Weryfikacja…
                    </>
                  ) : (
                    <>
                      {role === 'admin' ? <Shield className="size-4" /> : <Plane className="size-4" />}
                      {role === 'passenger' ? 'Zaloguj i leć!' : 'Zaloguj do panelu'}
                      <ArrowRight className="size-4 ml-auto" />
                    </>
                  )}
                </button>

                {role === 'passenger' && (
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-500 text-sm hover:text-slate-700 hover:bg-slate-50 transition-all border border-slate-200 mt-1"
                  >
                    Przeglądaj bez logowania
                    <ArrowRight className="size-3.5" />
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-slate-400 text-xs mt-6">
            Projekt akademicki SzwagiAIR &copy; 2026 &nbsp;·&nbsp; Tylko dane demonstracyjne
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}