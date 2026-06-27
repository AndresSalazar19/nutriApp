import { tokenStorage } from '@/utils/tokenStorage';

const API = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;

interface ApiEnvelope<T> {
  data?: T;
  listData?: T;
  errors?: unknown;
  detail?: unknown;
  status?: { messages?: string[] };
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  log_date: string;
  notes?: string | null;
}

export interface BloodPressureLog {
  id: string;
  user_id: string;
  systolic: number;
  diastolic: number;
  pulse?: number | null;
  log_date: string;
  notes?: string | null;
  measured_at?: string;
  created_at: string;
}

export interface BloodPressurePayload {
  user_id: string;
  systolic: number;
  diastolic: number;
  pulse?: number | null;
  log_date: string;
  notes?: string;
}

export interface WeightPayload {
  user_id: string;
  weight_kg: number;
  log_date: string;
  notes?: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = (await tokenStorage.get()) ?? '';
  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const text = await response.text();
  let payload: ApiEnvelope<T>;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(text || `Error ${response.status}`);
  }

  if (!response.ok) {
    const errors = payload.errors;
    const message =
      Array.isArray(errors) && errors.length > 0
        ? errors[0]
        : payload.status?.messages?.[0] ?? payload.detail ?? `Error ${response.status}`;
    throw new Error(typeof message === 'string' ? message : 'No se pudo completar la solicitud');
  }

  return (payload.listData ?? payload.data ?? payload) as T;
}

export const ProgressService = {
  getWeightHistory(userId: string, limit = 30): Promise<WeightLog[]> {
    return request<WeightLog[]>(`/weight-log/${userId}?limit=${limit}`);
  },

  createWeightLog(payload: WeightPayload): Promise<WeightLog> {
    return request<WeightLog>('/weight-log', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getBloodPressureHistory(userId: string, limit = 30): Promise<BloodPressureLog[]> {
    return request<BloodPressureLog[]>(`/blood-pressure-log/${userId}?limit=${limit}`);
  },

  createBloodPressureLog(payload: BloodPressurePayload): Promise<BloodPressureLog> {
    return request<BloodPressureLog>('/blood-pressure-log', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
