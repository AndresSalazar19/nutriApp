import { useMemo, useState } from 'react';
import { PLANS } from '../constants';
import { Plan } from '../types';

const DEFAULT_PLAN_CODE: NonNullable<Plan['code']> = 'standard';

/**
 * Los planes se muestran desde la lista local de `constants.ts`, NO desde el
 * backend: todavia no existe una tabla/endpoint `plans` (confirmado en BD,
 * solo existe `subscriptions`). Cuando el backend la tenga, este hook vuelve
 * a apuntar a PlanService.getAll() sin tocar PlansScreen ni PlanCard, porque
 * el shape que retorna es el mismo.
 */
export function usePlanSelection(defaultPlanCode: NonNullable<Plan['code']> = DEFAULT_PLAN_CODE) {
  const plans = PLANS;
  const [error] = useState<string | null>(null);
  const [loading] = useState(false);

  const defaultPlan = useMemo(
    () => plans.find((p) => p.code === defaultPlanCode) ?? plans[0] ?? null,
    [plans, defaultPlanCode],
  );

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(defaultPlan?.id ?? null);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  const selectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  return { plans, loading, error, selectedPlanId, selectedPlan, selectPlan };
}