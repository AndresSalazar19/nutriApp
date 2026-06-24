import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStorage } from '@/utils/tokenStorage';

const API = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;

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

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

const USER_KEY = 'auth_user';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API}${endpoint}`;
  console.log('[AuthService] →', options.method ?? 'GET', url);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error('No se pudo conectar al servidor. Verifica tu conexión.');
  }

  const text = await response.text();
  console.log('[AuthService] ← status:', response.status, '| body:', text.slice(0, 300));

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(text || `Error HTTP ${response.status}`);
  }

  if (!response.ok) {
    if (Array.isArray(data?.errors) && data.errors.length > 0) throw new Error(data.errors[0]);
    const detail = data?.detail;
    if (typeof detail === 'string') throw new Error(detail);
    if (Array.isArray(detail)) throw new Error(detail[0]?.msg ?? 'Error desconocido');
    throw new Error(`Error ${response.status}`);
  }

  return (data?.data ?? data) as T;
}

export const AuthService = {

  async register(payload: RegisterPayload): Promise<AuthUser> {
    return request<AuthUser>('/users/', {
      method: 'POST',
      body: JSON.stringify({ ...payload, role: payload.role ?? 'patient' }),
    });
  },

  async login(payload: LoginPayload): Promise<{ user: AuthUser }> {
    const body = await request<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (body.access_token) {
      await tokenStorage.set(body.access_token);
    }
  
    const user: AuthUser = body.user ?? (body as any);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

    return { user };
  },

  async getUser(): Promise<AuthUser | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
    await tokenStorage.clear();
  },

  async isAuthenticated(): Promise<boolean> {
    return !!(await AsyncStorage.getItem(USER_KEY));
  },
};