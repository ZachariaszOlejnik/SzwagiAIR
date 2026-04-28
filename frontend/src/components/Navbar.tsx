import { useNavigate } from 'react-router';
import { Plane, ChevronLeft, Shield } from 'lucide-react';

interface NavbarProps {
  showBack?: boolean;
  backLabel?: string;
  backTo?: string;
}

export function Navbar({ showBack, backLabel = 'Wstecz', backTo = '/' }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left */}
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={() => navigate(backTo)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-[#0f2241] transition-colors mr-2"
              >
                <ChevronLeft className="size-4" />
                <span className="text-sm">{backLabel}</span>
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5"
            >
              <div className="bg-[#0f2241] p-1.5 rounded-lg">
                <Plane className="size-5 text-white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f2241', letterSpacing: '-0.02em' }}>
                Szwagi<span className="text-orange-500">AIR</span>
              </span>
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Shield className="size-4 text-slate-500" />
              Panel Administratora
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
