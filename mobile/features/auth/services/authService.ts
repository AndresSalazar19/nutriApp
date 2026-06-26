import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStorage } from '@/utils/tokenStorage';
import type { UserAccount } from '@/services/userservice';

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

interface LoginUserResponse {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  avatar_url: string | null;
  person: {
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    phone: string | null;
    avatar_url: string | null;
    cedula: string | null;
    gender: string | null;
  } | null;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: LoginUserResponse;
}

const USER_KEY = 'auth_user';
const USER_ACCOUNT_KEY = 'auth_user_account';

function sanitizeErrorMessage(status: number, backendMsg?: string): string {
  if (status === 401) {
    return 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.';
  }

  if (
    backendMsg &&
    backendMsg.length < 200 &&
    !/[{}[\]<>]|Error:|Exception|Traceback|stack|Method Not Allowed|Not Found|Internal Server|Unauthorized|Forbidden/.test(backendMsg)
  ) {
    return backendMsg;
  }

  if (status === 405) {
    return 'No se pudo conectar con el servidor. Intenta más tarde.';
  }
  if (status === 422) {
    return 'Los datos ingresados no son válidos. Verifica e intenta de nuevo.';
  }
  if (status >= 500) {
    const lower = (backendMsg ?? '').toLowerCase();
    if (lower.includes('unique') || lower.includes('duplicate') || lower.includes('ya existe') || lower.includes('already')) {
      if (lower.includes('cedula') || lower.includes('cédula')) {
        return 'Ya existe una cuenta registrada con esa cédula.';
      }
      if (lower.includes('email') || lower.includes('correo')) {
        return 'Ya existe una cuenta con ese correo electrónico.';
      }
      return 'Algunos de tus datos ya están registrados. Verifica e intenta de nuevo.';
    }
    return 'Ocurrió un error al procesar tu solicitud. Verifica tus datos e intenta de nuevo.';
  }
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet.');
  }

  const text = await response.text();

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(sanitizeErrorMessage(response.status));
  }

  if (!response.ok) {
    let backendMsg: string | undefined;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      backendMsg = data.errors[0];
    } else if (Array.isArray(data?.status?.messages) && data.status.messages.length > 0) {
      backendMsg = data.status.messages[0];
    } else if (typeof data?.detail === 'string') {
      backendMsg = data.detail;
    } else {
      backendMsg = text;
    }
    throw new Error(sanitizeErrorMessage(response.status, backendMsg));
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

    const apiUser = body.user;

    const user: AuthUser = {
      id: String(apiUser.id),
      email: apiUser.email,
      role: apiUser.role,
      first_name: apiUser.person?.first_name ?? '',
      last_name: apiUser.person?.last_name ?? '',
    };

    const account: UserAccount = {
      id: String(apiUser.id),
      email: apiUser.email,
      role: apiUser.role,
      is_active: apiUser.is_active,
      email_verified: apiUser.email_verified,
      person: apiUser.person ?? null,
    };

    await AsyncStorage.multiSet([
      [USER_KEY, JSON.stringify(user)],
      [USER_ACCOUNT_KEY, JSON.stringify(account)],
    ]);

    return { user };
  },

  async getUser(): Promise<AuthUser | null> {
    const expired = await tokenStorage.isExpired();
    if (expired) {
      await this.logout();
      return null;
    }
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  async getUserAccount(): Promise<UserAccount | null> {
    const raw = await AsyncStorage.getItem(USER_ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as UserAccount) : null;
  },

  async setUserAccount(account: UserAccount): Promise<void> {
    await AsyncStorage.setItem(USER_ACCOUNT_KEY, JSON.stringify(account));
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([USER_KEY, USER_ACCOUNT_KEY]);
    await tokenStorage.clear();
  },

  async isAuthenticated(): Promise<boolean> {
    const expired = await tokenStorage.isExpired();
    if (expired) return false;
    return !!(await AsyncStorage.getItem(USER_KEY));
  },
};
