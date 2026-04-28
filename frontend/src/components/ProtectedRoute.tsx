import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth, UserRole } from '../context/AuthContext';
import { Loader2, Plane } from 'lucide-react';

interface Props {
  children: ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0f2241' }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="bg-white/15 p-2 rounded-xl border border-white/25">
            <Plane className="size-7 text-white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.75rem', color: 'white', letterSpacing: '-0.025em' }}>
            Szwagi<span className="text-orange-400">AIR</span>
          </span>
        </div>
        <Loader2 className="size-8 text-sky-400 animate-spin" />
        <p className="text-white/50 text-sm">Ładowanie sesji…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  return <>{children}</>;
}
