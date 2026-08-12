import { tokenStorage } from '@/utils/tokenStorage';
import { ApiResponse } from '@/models/ApiResponse';
import { API_URL } from '@/services/userservice';

export interface Plan {
  id: string;
  code: 'basic' | 'standard' | 'premium';
  name: string;
  price: string;
  currency: string;
  billing_period: string;
  badge: string | null;
  savings_text: string | null;
  color_token: string | null;
  features: string[];
  sort_order: number;
  is_active: boolean;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = (await tokenStorage.get()) ?? '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export const PlanService = {
  async getAll(): Promise<Plan[]> {
    const response = await fetch(`${API_URL}/plans`, {
      headers: await authHeaders(),
    });
    const data: ApiResponse<Plan[]> = await response.json();

    if (!response.ok) {
      const msg = (data as any)?.errors?.[0] ?? `Error ${response.status}`;
      throw new Error(msg);
    }

    return ((data as any).data ?? data) as Plan[];
  },

  async getByCode(code: Plan['code']): Promise<Plan> {
    const response = await fetch(`${API_URL}/plans/${code}`, {
      headers: await authHeaders(),
    });
    const data: ApiResponse<Plan> = await response.json();

    if (!response.ok) {
      const msg = (data as any)?.errors?.[0] ?? `Error ${response.status}`;
      throw new Error(msg);
    }

    return ((data as any).data ?? data) as Plan;
  },
};
