import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '../utils/tokenStorage';
import { ROUTES } from '../routes/routes';
import { API_URL } from '../config/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Role = 'nutritionist' | 'admin' | 'patient' | null;

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
  avatar_url?: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  user: AuthUser | null;
}

interface AuthContextValue extends AuthState {
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
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

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    const token = tokenStorage.get();
    if (!token) return null;

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('No se pudo actualizar el usuario.');
    }

    const data = await response.json();
    const updatedUser: AuthUser = {
      userId: String(data.userId ?? data.id ?? state.user?.userId ?? ''),
      email: data.email ?? state.user?.email ?? '',
      role: (data.role as Role) ?? state.user?.role ?? null,
      avatar_url: data.avatar_url ?? data.avatarUrl ?? state.user?.avatar_url ?? null,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    setState({ isAuthenticated: true, role: updatedUser.role, user: updatedUser });

    return updatedUser;
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
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
