import { useEffect, useState, useRef } from 'react';
import { NutritionistService, NutritionistStatusValue } from '../services/NutritionistService';
import { useAuth } from './useAuth';

interface NutritionistStatusState {
  status: NutritionistStatusValue | null;
  loading: boolean;
  error: string | null;
}

export function useNutritionistStatus(): NutritionistStatusState {
  const hasFetched = useRef(false);
  const { user } = useAuth();
  const [state, setState] = useState<NutritionistStatusState>({
    status: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.userId) {
      setState({ status: null, loading: false, error: 'Sin usuario' });
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    NutritionistService.getStatus(user.userId)
      .then(res => {
        if (res.status.isSuccessfully) {
          setState({ status: res.data.status, loading: false, error: null });
        } else {
          setState({ status: 'pending', loading: false, error: null });
        }
      })
      .catch(() => {
        // En caso de error de red, tratar como pendiente para no bloquear
        setState({ status: 'pending', loading: false, error: null });
      });
  }, [user?.userId]);

  return state;
}
