import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'passenger' | 'admin';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS = {
  passenger: { email: 'pasazer@szwagiair.pl', password: 'haslo123', name: 'Jan Kowalski' },
  admin: { email: 'admin@szwagiair.pl', password: 'admin123', name: 'Administrator' },
};

const STORAGE_KEY = 'szwagiair_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 900));
    const mock = MOCK_USERS[role];
    if (email.trim() === mock.email && password === mock.password) {
      const authUser: AuthUser = { name: mock.name, email: mock.email, role };
      setUser(authUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
