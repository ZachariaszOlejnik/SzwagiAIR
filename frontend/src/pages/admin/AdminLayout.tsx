import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  Plane, LayoutDashboard, Users, Tag, LogOut, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Zarządzanie załogą', icon: Users, path: '/admin/crew/af1' },
  { label: 'Katalog usług', icon: Tag, path: '/admin/services' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: '#0f2241' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5"
          >
            <div className="bg-white/15 p-1.5 rounded-lg border border-white/20">
              <Plane className="size-5 text-white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'white', letterSpacing: '-0.02em' }}>
              Szwagi<span className="text-orange-400">AIR</span>
            </span>
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/50 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        {/* Admin badge */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs" style={{ fontWeight: 700 }}>
              {user?.name.charAt(0) ?? 'A'}
            </div>
            <div>
              <p className="text-white text-xs" style={{ fontWeight: 600 }}>{user?.name ?? 'Administrator'}</p>
              <p className="text-white/40 text-xs">{user?.email ?? 'admin@szwagiair.pl'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="text-white/30 text-xs px-3 py-2" style={{ fontWeight: 600, letterSpacing: '0.08em' }}>
            ZARZĄDZANIE
          </p>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                  active
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className={`size-5 ${active ? 'text-sky-400' : ''}`} />
                <span className="text-sm" style={{ fontWeight: active ? 600 : 400 }}>{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="size-4" />
            <span className="text-sm">Wyloguj się</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-700"
          >
            <Menu className="size-5" />
          </button>
          <div>
            <p className="text-slate-400 text-xs">SzwagiAIR</p>
            <p className="text-slate-700" style={{ fontWeight: 600 }}>Panel Administracyjny</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-slate-500 text-xs">System online</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}