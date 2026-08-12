import { COLORS } from '@/constants/colors';
import { Plan as ApiPlan } from './planService';
import { Plan } from '../types';

const FALLBACK_COLOR = COLORS.primary;

function resolveColor(colorToken: string | null): string {
  if (!colorToken) return FALLBACK_COLOR;
  const palette = COLORS as Record<string, string>;
  return palette[colorToken] ?? FALLBACK_COLOR;
}

/**
 * Convierte el Plan que devuelve el backend (tabla `plans`, ver services/planService.ts)
 * al modelo que consumen las pantallas de onboarding (types.ts: PlanCard, PlansScreen).
 *
 * Importante: se conserva el `id` real (uuid) del backend como `id` del Plan de UI,
 * porque ese es el valor que luego se envía a SubscriptionService.subscribe().
 */
export function mapApiPlanToPlan(apiPlan: ApiPlan): Plan {
  const color = resolveColor(apiPlan.color_token);

  return {
    id: apiPlan.id,
    code: apiPlan.code,
    name: apiPlan.name,
    price: apiPlan.price,
    period: apiPlan.billing_period ? `/${apiPlan.billing_period}` : '',
    badge: apiPlan.badge ?? undefined,
    savingsText: apiPlan.savings_text ?? undefined,
    accentColor: color,
    titleColor: color,
    features: apiPlan.features,
  };
}
