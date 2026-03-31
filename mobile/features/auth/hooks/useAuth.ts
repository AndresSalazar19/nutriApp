import { useState } from 'react';
import { AuthService, LoginPayload, RegisterPayload } from '../services/authService';

interface AuthState {
  loading: boolean;
  error: string | null;
}

// ─── useLogin ─────────────────────────────────────────────────────────────────

export function useLogin() {
  const [state, setState] = useState<AuthState>({ loading: false, error: null });

  const login = async (payload: LoginPayload) => {
    setState({ loading: true, error: null });
    try {
      const result = await AuthService.login(payload);
      setState({ loading: false, error: null });
      return result; // { tokens, user }
    } catch (err: any) {
      const message = err?.message ?? 'Error al iniciar sesión';
      setState({ loading: false, error: message });
      return null;
    }
  };

  return { ...state, login };
}

// ─── useRegister ──────────────────────────────────────────────────────────────

export function useRegister() {
  const [state, setState] = useState<AuthState>({ loading: false, error: null });

  const register = async (payload: RegisterPayload) => {
    setState({ loading: true, error: null });
    try {
      const user = await AuthService.register(payload);
      setState({ loading: false, error: null });
      return user;
    } catch (err: any) {
      const message = err?.message ?? 'Error al registrarse';
      setState({ loading: false, error: message });
      return null;
    }
  };

  return { ...state, register };
}
