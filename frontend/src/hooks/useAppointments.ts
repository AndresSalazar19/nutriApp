import { useEffect, useState, useCallback } from 'react';
import {
  AppointmentService,
  AppointmentResponse,
} from '../services/Appointments/AppointmentService';
import { useAuth } from './useAuth';

export function useAppointments() {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);

      const data = await AppointmentService.list({
        user_id: user.userId,
        role: 'nutritionist',
      });

      setAppointments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    setAppointments,
    loading,
    error,
    refetch: fetchAppointments,
  };
}
