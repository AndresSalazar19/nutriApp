import { tokenStorage } from '@/utils/tokenStorage';
import { ApiResponse } from '@/models/ApiResponse';
import { API_URL } from '@/services/userservice';

/**
 * CONFIRMADO via `SELECT enum_range(NULL::subscription_plan);`:
 * el enum en BD solo tiene 'free' | 'basic' | 'premium'.
 *
 * Decision de negocio: en vez de migrar el enum para agregar 'standard', el
 * catalogo visual del frontend ('basic' | 'standard' | 'premium', tabla
 * `plans`/`constants.ts`) se mapea al enum de BD de forma DESPLAZADA, no 1:1:
 *
 *   Frontend 'basic'    -> BD 'free'
 *   Frontend 'standard' -> BD 'basic'
 *   Frontend 'premium'  -> BD 'premium'
 *
 * La UI sigue mostrando "Plan Básico/Estándar/Premium" normal (nombre,
 * precio, features) sin cambios; solo cambia el valor que se persiste en
 * subscriptions.plan. Ver `toSubscriptionPlanCode` mas abajo.
 *
 * `SubscriptionStatus` CONFIRMADO via `SELECT enum_range(NULL::subscription_status);`:
 * 'active' | 'cancelled' | 'expired' | 'pending'.
 * Ojo: es 'cancelled' (doble L), no 'canceled'.
 */
export type SubscriptionPlanCode = 'free' | 'basic' | 'premium';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

/**
 * Convierte el code del catalogo visual del frontend ('basic' | 'standard' |
 * 'premium', tabla `plans`/`constants.ts`) al code que acepta el enum
 * subscription_plan en BD. El mapeo esta DESPLAZADO un nivel -- ver nota
 * arriba en el comentario del modulo.
 */
export function toSubscriptionPlanCode(
  planCode: 'basic' | 'standard' | 'premium',
): SubscriptionPlanCode {
  switch (planCode) {
    case 'basic':
      return 'free';
    case 'standard':
      return 'basic';
    case 'premium':
      return 'premium';
  }
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlanCode;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = (await tokenStorage.get()) ?? '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function handleResponse<T>(response: Response, label: string): Promise<T> {
  const text = await response.text();
  console.log(`[SubscriptionService] ← ${label} status:`, response.status, '| body:', text.slice(0, 300));

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(text || `Error ${response.status}`);
  }

  if (!response.ok) {
    const msg = data?.errors?.[0] ?? data?.detail ?? `Error ${response.status}`;
    throw new Error(msg);
  }

  return (data?.data ?? data) as T;
}

export const SubscriptionService = {
  /** Suscripción activa del usuario, o null si no tiene ninguna. */
  async getCurrent(userId: string): Promise<UserSubscription | null> {
    const url = `${API_URL}/users/${userId}/subscription`;
    console.log('[SubscriptionService] → GET', url);
    const response = await fetch(url, { headers: await authHeaders() });

    if (response.status === 404) {
      console.log('[SubscriptionService] ← GET 404 (sin suscripción, esperado)');
      return null;
    }

    return handleResponse<UserSubscription>(response, 'GET subscription');
  },

  /**
   * Crea/actualiza la suscripción del usuario con el plan elegido.
   *
   * OJO: `plan` es el code del ENUM DE BD ('free' | 'basic' | 'premium'),
   * ya mapeado con `toSubscriptionPlanCode` -- no el code visual del
   * frontend ('basic' | 'standard' | 'premium'). La tabla `subscriptions`
   * no tiene columna plan_id: guarda el plan directo como enum en la
   * columna `plan`. El status queda en el default de la BD ('active') salvo
   * que el backend decida sobreescribirlo.
   */
  async subscribe(userId: string, plan: SubscriptionPlanCode): Promise<UserSubscription> {
    const url = `${API_URL}/users/${userId}/subscription`;
    console.log('[SubscriptionService] → POST', url, '| plan:', plan);
    const response = await fetch(url, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ plan }),
    });

    return handleResponse<UserSubscription>(response, 'POST subscription');
  },

  async cancel(subscriptionId: string): Promise<UserSubscription> {
    const url = `${API_URL}/subscriptions/${subscriptionId}/cancel`;
    console.log('[SubscriptionService] → POST', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: await authHeaders(),
    });

    return handleResponse<UserSubscription>(response, 'POST cancel');
  },
};