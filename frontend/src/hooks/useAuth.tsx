import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '../utils/tokenStorage';
import { ROUTES } from '../routes/routes';
 
// ─── Tipos ────────────────────────────────────────────────────────────────────
 
export type Role = 'nutritionist' | 'admin' | 'patient' | null;
 
export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}
 
interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  user: AuthUser | null;
}
 
interface AuthContextValue extends AuthState {
  login:  (user: AuthUser, token: string) => void;
  logout: () => void;
}
 
// ─── Storage key ─────────────────────────────────────────────────────────────
 
const SESSION_KEY = 'nutria_session';
 
// ─── Leer sesión inicial desde localStorage ───────────────────────────────────
 
function readSession(): AuthState {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { isAuthenticated: false, role: null, user: null };
 
    if (tokenStorage.isExpired()) {
      localStorage.removeItem(SESSION_KEY);
      tokenStorage.remove();
      return { isAuthenticated: false, role: null, user: null };
    }
 
    const user = JSON.parse(raw) as AuthUser;
    return { isAuthenticated: true, role: user.role, user };
  } catch {
    return { isAuthenticated: false, role: null, user: null };
  }
}
 
// ─── Context ──────────────────────────────────────────────────────────────────
 
const AuthContext = createContext<AuthContextValue | null>(null);
 
// ─── Provider ────────────────────────────────────────────────────────────────
 
interface AuthProviderProps {
  children: React.ReactNode;
}
 
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(readSession);
  const navigate = useNavigate();
 
  const login = useCallback((userData: AuthUser, token: string) => {
    tokenStorage.set(token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    setState({ isAuthenticated: true, role: userData.role, user: userData });
  }, []);
 
  const logout = useCallback(() => {
    tokenStorage.remove();
    localStorage.removeItem(SESSION_KEY);
    setState({ isAuthenticated: false, role: null, user: null });
    navigate(ROUTES.LOGIN, { replace: true });
  }, [navigate]);
 
  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
 
// ─── Hook ─────────────────────────────────────────────────────────────────────
 
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}