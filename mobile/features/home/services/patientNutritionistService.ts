import { tokenStorage } from '@/utils/tokenStorage';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;

export type PatientNutritionistStatus = 'active' | 'inactive';

export interface PatientNutritionistQueryParams {
  patient_id?: string;
  nutritionist_id?: string;
  status?: PatientNutritionistStatus;
}

export interface PatientNutritionistPatient {
  id: string;
  first_name: string;
  last_name: string;
  fullName: string;
}

export interface PatientNutritionistResponse {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  assigned_at: string;
  ended_at?: string | null;
  is_active: boolean;
  patient: any;
  nutritionist: any;
}

function authHeaders() {
  const token = tokenStorage.get() ?? '';
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const msg = data?.errors?.[0] ?? data?.detail ?? `Error ${response.status}`;
    throw new Error(msg);
  }

  return data;
}


export const PatientNutritionistService = {
  async list(params: PatientNutritionistQueryParams): Promise<PatientNutritionistResponse[]> {
    const query = new URLSearchParams();
    if (params.patient_id) query.append('patient_id', params.patient_id);
    if (params.nutritionist_id) query.append('nutritionist_id', params.nutritionist_id);
    if (params.status) {
      query.append('status', params.status);
    }

    const res = await fetch(`${API_URL}/patient_nutritionists?${query.toString()}`, {
      method: 'GET',
      headers: authHeaders(),
    });

    return handleResponse<PatientNutritionistResponse[]>(res);
  },

};
