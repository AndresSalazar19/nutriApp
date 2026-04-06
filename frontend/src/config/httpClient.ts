import { API_URL } from './api';
import { tokenStorage } from '../utils/tokenStorage';

// ── Error tipado para respuestas 401 ──────────────────────────────────────────

export class UnauthorizedError extends Error {
  constructor() {
    super('Sesión expirada. Por favor inicia sesión nuevamente.');
    this.name = 'UnauthorizedError';
  }
}

// ── Tipos internos ────────────────────────────────────────────────────────────

type ExtraHeaders = Record<string, string>;

interface RequestOptions {
  headers?: ExtraHeaders;
  signal?: AbortSignal;
}

// ── Función base ──────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const token = tokenStorage.get();

  const headers: ExtraHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options.signal,
  });

  if (response.status === 401) {
    // Token inválido o expirado: limpiamos la sesión localmente.
    // El componente que llame al servicio debe capturar UnauthorizedError
    // y ejecutar logout() para que React actualice el estado.
    tokenStorage.remove();
    throw new UnauthorizedError();
  }

  const data: T = await response.json();
  return data;
}

// ── Cliente HTTP público ──────────────────────────────────────────────────────

export const httpClient = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>('GET', endpoint, undefined, options);
  },

  post<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('POST', endpoint, body, options);
  },

  put<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('PUT', endpoint, body, options);
  },

  patch<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('PATCH', endpoint, body, options);
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>('DELETE', endpoint, undefined, options);
  },
};
