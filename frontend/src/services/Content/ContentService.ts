import { API_URL } from '../../config/api';
import { tokenStorage } from '../../utils/tokenStorage';

export interface ContentItem {
  id: string;
  title: string;
  body: string;
  category: string;
  content_type: string;
  tags: string[] | null;
  media_url: string | null;
  is_premium: boolean;
  is_approved: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string | null;
  view_count: number;
  author_id: string;
}

export interface ContentCreatePayload {
  title: string;
  body: string;
  category: string;
  content_type: string;
  tags?: string[];
  media_url?: string;
  is_premium?: boolean;
}

export const CONTENT_TYPES = [
  { value: 'article', label: 'Artículo' },
  { value: 'video', label: 'Video' },
  { value: 'infographic', label: 'Infografía' },
  { value: 'recipe', label: 'Receta' },
  { value: 'tip', label: 'Consejo' },
];

export const CONTENT_CATEGORIES = [
  { value: 'nutrition', label: 'Nutrición' },
  { value: 'hypertension', label: 'Hipertensión' },
  { value: 'recipes', label: 'Recetas' },
  { value: 'exercise', label: 'Ejercicio' },
  { value: 'lifestyle', label: 'Estilo de vida' },
  { value: 'tips', label: 'Consejos' },
];

function authHeaders() {
  const token = tokenStorage.get() ?? '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export const ContentService = {
  async getAll(params: {
    content_type?: string;
    category?: string;
    q?: string;
    skip?: number;
    limit?: number;
  }): Promise<ContentItem[]> {
    const query = new URLSearchParams();
    if (params.content_type) query.append('content_type', params.content_type);
    if (params.category) query.append('category', params.category);
    if (params.q) query.append('q', params.q);
    if (params.skip != null) query.append('skip', String(params.skip));
    if (params.limit != null) query.append('limit', String(params.limit));

    const response = await fetch(`${API_URL}/content?${query.toString()}`, {
      headers: authHeaders(),
    });
    const data = await response.json();
    return data.data ?? [];
  },

  async getAllForAdmin(
    params: { q?: string; skip?: number; limit?: number } = {},
  ): Promise<ContentItem[]> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.skip != null) query.append('skip', String(params.skip));
    if (params.limit != null) query.append('limit', String(params.limit));

    const response = await fetch(`${API_URL}/content/admin/all?${query.toString()}`, {
      headers: authHeaders(),
    });
    const data = await response.json();
    return data.data ?? [];
  },

  async getMy(): Promise<ContentItem[]> {
    const response = await fetch(`${API_URL}/content/my`, {
      headers: authHeaders(),
    });
    const data = await response.json();
    return data.data ?? [];
  },

  async create(payload: ContentCreatePayload): Promise<ContentItem> {
    const response = await fetch(`${API_URL}/content`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      const msg = data?.errors?.[0] ?? data?.detail ?? `Error ${response.status}`;
      throw new Error(msg);
    }
    return data.data;
  },

  async approve(id: string): Promise<ContentItem> {
    const response = await fetch(`${API_URL}/content/${id}/publish`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.errors?.[0] ?? `Error ${response.status}`);
    return data.data;
  },

  async reject(id: string): Promise<ContentItem> {
    const response = await fetch(`${API_URL}/content/${id}/reject`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.errors?.[0] ?? `Error ${response.status}`);
    return data.data;
  },

  async archive(id: string): Promise<ContentItem> {
    const response = await fetch(`${API_URL}/content/${id}/archive`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.errors?.[0] ?? `Error ${response.status}`);
    return data.data;
  },
};
