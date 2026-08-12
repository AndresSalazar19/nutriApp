import { useCallback, useEffect, useState } from 'react';
import { ConsentService, ConsentStatus } from '../services/Consent/ConsentService';
import { useAuth } from './useAuth';

interface ConsentStatusState {
  status: ConsentStatus | null;
  loading: boolean;
  error: string | null;
}

export function useConsentStatus() {
  const { user } = useAuth();
  const [state, setState] = useState<ConsentStatusState>({
    status: null,
    loading: true,
    error: null,
  });

  const fetchStatus = useCallback(() => {
    if (!user?.userId) {
      setState({ status: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));
    ConsentService.getStatus()
      .then((status) => setState({ status, loading: false, error: null }))
      .catch((err) => setState({ status: null, loading: false, error: err.message }));
  }, [user?.userId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { ...state, refetch: fetchStatus };
}
