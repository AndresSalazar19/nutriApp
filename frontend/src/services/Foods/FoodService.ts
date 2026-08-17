import { API_URL } from '../../config/api';
import { tokenStorage } from '../../utils/tokenStorage';

export interface FoodPickerItem {
  id: string;
  name: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  sodium_mg: number | null;
}

function authHeaders(): Record<string, string> {
  const token = tokenStorage.get() ?? '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const raw =
      data?.status?.messages?.[0] ??
      data?.detail ??
      data?.errors?.[0] ??
      `Error ${response.status}`;
    throw new Error(String(raw).replace(/^\d+:\s*/, ''));
  }
  return (data?.listData ?? data?.data ?? data) as T;
}

export const FoodService = {
  async search(query: string): Promise<FoodPickerItem[]> {
    const params = new URLSearchParams({ limit: '20' });
    if (query.trim()) params.set('search', query.trim());
    const res = await fetch(`${API_URL}/foods?${params.toString()}`, {
      method: 'GET',
      headers: authHeaders(),
    });
    return handleResponse<FoodPickerItem[]>(res);
  },
};
