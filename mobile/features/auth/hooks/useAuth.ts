import { useEffect, useState } from 'react';
import { AuthService, LoginPayload, RegisterPayload, AuthUser } from '../services/authService';

interface AuthState {
  loading: boolean;
  error: string | null;
}

export function useLogin() {
  const [state, setState] = useState<AuthState>({ loading: false, error: null });

  const login = async (payload: LoginPayload) => {
    setState({ loading: true, error: null });
    try {
      const result = await AuthService.login(payload);
      setState({ loading: false, error: null });
      return result;
    } catch (err: any) {
      const message = err?.message ?? 'Error al iniciar sesión';
      setState({ loading: false, error: message });
      return null;
    }
  };

  return { ...state, login };
}

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

export function useSession() {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    AuthService.isAuthenticated()
      .then(setAuthenticated)
      .finally(() => setReady(true));
  }, []);

  return { ready, authenticated };
}

export function useRole() {
  const { user, loading } = useCurrentUser();

  return {
    role: user?.role ?? null,
    isPatient: user?.role === 'patient',
    loading,
    user,
  };
}
