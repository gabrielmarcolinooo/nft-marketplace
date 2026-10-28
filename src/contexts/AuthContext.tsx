/* eslint-disable react-refresh/only-export-components */
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createSession, deleteSession, getSession } from '../services/authService';
import type { User } from '../types';

export type AuthTab = 'login' | 'register';

interface AuthContextValue {
  user: User | null;
  authOpen: boolean;
  authTab: AuthTab;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  openAuth: (tab?: AuthTab) => void;
  closeAuth: () => void;
}

const USER_STORAGE_KEY = 'kurio_user';
const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const sessionRevision = useRef(0);

  useEffect(() => {
    let active = true;
    const revision = sessionRevision.current;

    void getSession()
      .then((session) => {
        if (!active || revision !== sessionRevision.current) return;
        if (session) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
          setUser(session.user);
        } else {
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
        }
      })
      .catch(() => {
        if (!active || revision !== sessionRevision.current) return;
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      });

    return () => { active = false; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    sessionRevision.current += 1;
    const session = await createSession(email, password);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
    setUser(session.user);
    setAuthOpen(false);
  }, []);

  const logout = useCallback(async () => {
    sessionRevision.current += 1;
    try {
      await deleteSession();
    } finally {
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    }
  }, []);

  const openAuth = useCallback((tab: AuthTab = 'login') => {
    setAuthTab(tab);
    setAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const value = useMemo(() => ({ user, authOpen, authTab, login, logout, openAuth, closeAuth }), [authOpen, authTab, closeAuth, login, logout, openAuth, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
