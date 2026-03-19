import { useState } from 'react';

export function usePlanSelection(defaultPlanId = 'standard') {
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);

  const selectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  return { selectedPlanId, selectPlan };
}
