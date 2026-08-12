import { useEffect, useState, useCallback } from 'react';
import {
  NutritionPlanService,
  NutritionPlanResponse,
} from '../services/NutritionPlans/NutritionPlanService';

export function usePendingNutritionPlans() {
  const [plans, setPlans] = useState<NutritionPlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await NutritionPlanService.listPending();
      setPlans(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    setPlans,
    loading,
    error,
    refetch: fetchPlans,
  };
}
