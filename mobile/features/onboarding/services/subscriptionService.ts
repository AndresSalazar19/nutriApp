import { tokenStorage } from '@/utils/tokenStorage';
import { ApiResponse } from '@/models/ApiResponse';
import { API_URL } from './userService';

export type SubscriptionStatus = 'pending' | 'active' | 'canceled' | 'expired' | 'past_due';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  started_at: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = (await tokenStorage.get()) ?? '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export const SubscriptionService = {
  /** Suscripción activa del usuario, o null si no tiene ninguna. */
  async getCurrent(userId: string): Promise<UserSubscription | null> {
    const response = await fetch(`${API_URL}/users/${userId}/subscription`, {
      headers: await authHeaders(),
    });

    if (response.status === 404) return null;

    const data: ApiResponse<UserSubscription> = await response.json();
    if (!response.ok) {
      const msg = (data as any)?.errors?.[0] ?? `Error ${response.status}`;
      throw new Error(msg);
    }

    return ((data as any).data ?? data) as UserSubscription;
  },

  /** Crea una suscripción nueva (queda en 'pending' hasta confirmar el pago). */
  async subscribe(userId: string, planId: string): Promise<UserSubscription> {
    const response = await fetch(`${API_URL}/users/${userId}/subscription`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ plan_id: planId }),
    });
    const data: ApiResponse<UserSubscription> = await response.json();

    if (!response.ok) {
      const msg = (data as any)?.errors?.[0] ?? `Error ${response.status}`;
      throw new Error(msg);
    }

    return ((data as any).data ?? data) as UserSubscription;
  },

  async cancel(subscriptionId: string): Promise<UserSubscription> {
    const response = await fetch(`${API_URL}/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: await authHeaders(),
    });
    const data: ApiResponse<UserSubscription> = await response.json();

    if (!response.ok) {
      const msg = (data as any)?.errors?.[0] ?? `Error ${response.status}`;
      throw new Error(msg);
    }

    return ((data as any).data ?? data) as UserSubscription;
  },
};
