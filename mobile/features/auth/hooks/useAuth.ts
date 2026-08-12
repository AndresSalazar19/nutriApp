import { useEffect, useState } from 'react';
import { AuthService, ApiError, LoginPayload, RegisterPayload, AuthUser } from '../services/authService';

interface AuthState {
  loading: boolean;
  error: string | null;
  errorField: string | null;
}

const INITIAL_STATE: AuthState = { loading: false, error: null, errorField: null };

export function useLogin() {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);

  const login = async (payload: LoginPayload) => {
    setState({ loading: true, error: null, errorField: null });
    try {
      const result = await AuthService.login(payload);
      setState({ loading: false, error: null, errorField: null });
      return result;
    } catch (err: any) {
      const message = err?.message ?? 'Error al iniciar sesión';
      const errorField = err instanceof ApiError ? err.field ?? null : null;
      setState({ loading: false, error: message, errorField });
      return null;
    }
  };

  return { ...state, login };
}

export function useRegister() {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);

  const register = async (payload: RegisterPayload) => {
    setState({ loading: true, error: null, errorField: null });
    try {
      const user = await AuthService.register(payload);
      setState({ loading: false, error: null, errorField: null });
      return user;
    } catch (err: any) {
      const message = err?.message ?? 'Error al registrarse';
      const errorField = err instanceof ApiError ? err.field ?? null : null;
      setState({ loading: false, error: message, errorField });
      return null;
    }
  };

  return { ...state, register };
}

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthService.getUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}