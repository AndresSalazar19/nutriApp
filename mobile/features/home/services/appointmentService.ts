import { tokenStorage } from '@/utils/tokenStorage';

const API = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;

export type AppointmentModality = 'virtual' | 'in_person';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

interface AppointmentUser {
  id: string;
  email: string;
  person?: { first_name: string; last_name: string } | null;
}

export interface Appointment {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  scheduled_at: string;
  duration_min: number;
  status: AppointmentStatus;
  modality: AppointmentModality;
  notes?: string | null;
  cancelled_at?: string | null;
  nutritionist: AppointmentUser;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = (await tokenStorage.get()) ?? '';
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const raw = payload?.errors?.[0] ?? payload?.detail ?? `Error ${response.status}`;
    throw new Error(typeof raw === 'string' ? raw.replace(/^\d+:\s*/, '') : 'No se pudo completar la solicitud');
  }
  return payload as T;
}

export const AppointmentService = {
  list(patientId: string): Promise<Appointment[]> {
    const query = new URLSearchParams({ user_id: patientId, role: 'patient' });
    return request(`/appointment?${query.toString()}`);
  },

  getAvailableSlots(nutritionistId: string, date: string): Promise<string[]> {
    const query = new URLSearchParams({ date, duration_min: '45' });
    return request(`/appointment/slots/${nutritionistId}?${query.toString()}`);
  },

  create(data: {
    patient_id: string;
    nutritionist_id: string;
    scheduled_at: string;
    modality: AppointmentModality;
    notes: string;
  }): Promise<Appointment> {
    return request('/appointment', {
      method: 'POST',
      body: JSON.stringify({ ...data, duration_min: 45 }),
    });
  },

  cancel(appointmentId: string, userId: string): Promise<unknown> {
    const query = new URLSearchParams({ user_id: userId });
    return request(`/appointment/${appointmentId}?${query.toString()}`, { method: 'DELETE' });
  },
};
