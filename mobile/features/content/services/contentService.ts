import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? process.env.REACT_APP_API_URL ?? ''
).replace(/\/$/, '');

const API = `${BASE_URL}/api/v1`;
const AUTH_KEY = 'auth_user';

export interface ContentItem {
  id: string;
  title: string;
  category: string;
  content_type: string;
  tags: string[] | null;
  media_url: string | null;
  is_premium: boolean;
  published_at: string | null;
  view_count: number;
}

export interface ContentDetail extends ContentItem {
  body: string;
  media: { id: string; media_type: string | null; media_url: string; thumbnail_url: string | null }[];
}

export const CATEGORY_EMOJI: Record<string, string> = {
  nutrition:    '🥗',
  hypertension: '❤️',
  recipes:      '🍳',
  exercise:     '🏃',
  lifestyle:    '🌿',
  tips:         '💡',
};

export const CATEGORY_LABEL: Record<string, string> = {
  nutrition:    'Nutrición',
  hypertension: 'Hipertensión',
  recipes:      'Recetas',
  exercise:     'Ejercicio',
  lifestyle:    'Estilo de vida',
  tips:         'Consejos',
};

async function getToken(): Promise<string> {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    return parsed?.access_token ?? '';
  } catch {
    return '';
  }
}

async function request<T>(endpoint: string): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${API}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await response.text();
  let data: any;
  try { data = JSON.parse(text); } catch { throw new Error(text); }
  if (!response.ok) {
    const msg = Array.isArray(data?.errors) ? data.errors[0] : data?.detail ?? `Error ${response.status}`;
    throw new Error(typeof msg === 'string' ? msg : 'Error desconocido');
  }
  return (data?.data ?? data) as T;
}

export const ContentService = {
  async getApproved(params: { q?: string; skip?: number; limit?: number } = {}): Promise<ContentItem[]> {
    const query = new URLSearchParams();
    if (params.q)     query.append('q',     params.q);
    if (params.skip  != null) query.append('skip',  String(params.skip));
    if (params.limit != null) query.append('limit', String(params.limit));
    const qs = query.toString();
    return request<ContentItem[]>(`/content${qs ? `?${qs}` : ''}`);
  },

  async getById(id: string): Promise<ContentDetail> {
    return request<ContentDetail>(`/content/${id}`);
  },
};
