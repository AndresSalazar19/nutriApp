import { useState } from 'react';
import { tokenStorage } from '../utils/tokenStorage';

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
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const SESSION_KEY = 'nutria_session';

function readSession(): { isAuthenticated: boolean; role: Role; user: AuthUser | null } {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { isAuthenticated: false, role: null, user: null };

    // Si el token expiró, limpiamos la sesión automáticamente
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

export function useAuth(): AuthState {
  const [state, setState] = useState(readSession);

  const login = (userData: AuthUser, token: string) => {
    tokenStorage.set(token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    setState({ isAuthenticated: true, role: userData.role, user: userData });
  };

  const logout = () => {
    tokenStorage.remove();
    localStorage.removeItem(SESSION_KEY);
    setState({ isAuthenticated: false, role: null, user: null });
  };

  return { ...state, login, logout };
}
