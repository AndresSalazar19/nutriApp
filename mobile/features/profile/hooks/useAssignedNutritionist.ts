import { useEffect, useState } from 'react';
import {
  PatientNutritionistService,
  AssignedNutritionist,
} from '@/services/patientNutritionistService';

export function useAssignedNutritionist(patientId: string | undefined) {
  const [nutritionist, setNutritionist] = useState<AssignedNutritionist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    PatientNutritionistService.getAssigned(patientId)
      .then((result) => {
        if (!cancelled) setNutritionist(result);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message ?? 'No se pudo cargar el nutricionista.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  return { nutritionist, loading, error };
}