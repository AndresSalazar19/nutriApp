import { useState } from 'react';

type Role = 'nutritionist' | 'admin' | null;

interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  login: (role: Role) => void;
  logout: () => void;
}

// ── MODO DESARROLLO ────────────────────────────────────────
// Valores para probar diferentes flujos sin backend:
//
//   isAuthenticated: false  → siempre va al login
//   isAuthenticated: true, role: 'nutritionist' → va al dashboard de nutricionista
//   isAuthenticated: true, role: 'admin'        → va al panel admin
//
const DEV_AUTH = {
  isAuthenticated: true,
  role: "admin" as const,
};

export function useAuth(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState(DEV_AUTH.isAuthenticated);
  const [role, setRole] = useState<Role>(DEV_AUTH.role);

  const login = (userRole: Role) => {
    setIsAuthenticated(true);
    setRole(userRole);
    // TODO: guardar token en localStorage cuando tengas backend
    // localStorage.setItem('token', token);
    // localStorage.setItem('role', userRole);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    // TODO: limpiar token cuando tengas backend
    // localStorage.removeItem('token');
    // localStorage.removeItem('role');
  };

  return { isAuthenticated, role, login, logout };
}