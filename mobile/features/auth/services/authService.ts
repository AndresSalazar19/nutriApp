import AsyncStorage from '@react-native-async-storage/async-storage';

// ── La BASE_URL debe ser solo el origen, sin trailing slash
// ── Ejemplo en .env:  EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
// ── El prefijo /api/v1 se añade aquí una sola vez
//const BASE_URL = (
//  process.env.EXPO_PUBLIC_API_URL ?? process.env.REACT_APP_API_URL ?? ''
//).replace(/\/$/, ''); // elimina slash final si existe

const BASE_URL = 'http://147.93.176.210:8083';

const API = `${BASE_URL}/api/v1`;

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string; // "YYYY-MM-DD"
  password: string;
  role?: string;
  cedula: string;
  gender: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const USER_KEY = 'auth_user';

// ─── Helper fetch ─────────────────────────────────────────────────────────────

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API}${endpoint}`;
  console.log('[AuthService] →', options.method ?? 'GET', url); // útil para debug

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error('No se pudo conectar al servidor. Verifica tu conexión o la URL en .env');
  }

  const text = await response.text();
  console.log('[AuthService] ← status:', response.status, '| body:', text.slice(0, 200));

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(text || `Error HTTP ${response.status}`);
  }

  if (!response.ok) {
    // Tu backend: { success: false, errors: ["mensaje"] }
    if (Array.isArray(data?.errors) && data.errors.length > 0) throw new Error(data.errors[0]);
    // FastAPI estándar: { detail: "..." }
    const detail = data?.detail;
    if (typeof detail === 'string') throw new Error(detail);
    if (Array.isArray(detail)) throw new Error(detail[0]?.msg ?? 'Error desconocido');
    throw new Error(`Error ${response.status}`);
  }

  // Tu backend: { success: true, data: { ... } }
  return (data?.data ?? data) as T;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const AuthService = {
  async register(payload: RegisterPayload): Promise<AuthUser> {
    return request<AuthUser>('/users/', {
      method: 'POST',
      body: JSON.stringify({ ...payload, role: payload.role ?? 'patient' }),
    });
  },

  async login(payload: LoginPayload): Promise<{ user: AuthUser }> {
    const user = await request<AuthUser>('/users/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return { user };
  },

  async getUser(): Promise<AuthUser | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  },

  async isAuthenticated(): Promise<boolean> {
    return !!(await AsyncStorage.getItem(USER_KEY));
  },
};
