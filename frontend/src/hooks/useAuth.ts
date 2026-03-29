import { useState } from 'react';

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
  login: (user: AuthUser) => void;
  logout: () => void;
}

const STORAGE_KEY = 'nutria_session';

function readSession(): { isAuthenticated: boolean; role: Role; user: AuthUser | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isAuthenticated: false, role: null, user: null };
    const user = JSON.parse(raw) as AuthUser;
    return { isAuthenticated: true, role: user.role, user };
  } catch {
    return { isAuthenticated: false, role: null, user: null };
  }
}

export function useAuth(): AuthState {
  const [state, setState] = useState(readSession);

  const login = (userData: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setState({ isAuthenticated: true, role: userData.role, user: userData });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ isAuthenticated: false, role: null, user: null });
  };

  return { ...state, login, logout };
}
