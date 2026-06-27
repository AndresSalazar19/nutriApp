import { API_URL } from '../../config/api';
import { tokenStorage } from '../../utils/tokenStorage';

export interface PatientResponse {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  status: string;
  priority_flag: boolean;
  nutritionist_name?: string | null;
  nutritionist_initials?: string | null;
  registered_at?: string;
}

export interface PatientNutritionistRequest {
  patient_id: string;
  nutritionist_id: string;
}

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

export const PatientService = {
  async getAll(): Promise<PatientResponse[]> {
    const res = await fetch(`${API_URL}/patients`, {
      method: 'GET',
      headers: authHeaders(),
    });

    const data = await handleResponse<{ listData?: PatientResponse[] }>(res);
    return data.listData || [];
  },
};

export const PatientNutritionistService = {
  async create(payload: PatientNutritionistRequest): Promise<PatientNutritionistResponse> {
    const res = await fetch(`${API_URL}/patient_nutritionists`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    return handleResponse<PatientNutritionistResponse>(res);
  },

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

  async listPatientsByNutritionist(nutritionist_id: string): Promise<PatientNutritionistPatient[]> {
    const records = await this.list({ nutritionist_id, status: 'active' });

    return records
      .map((record) => {
        const patient = record.patient;
        const firstName = patient?.person?.first_name ?? patient?.first_name ?? 'Paciente';
        const lastName = patient?.person?.last_name ?? patient?.last_name ?? '';

        return {
          id: String(record.patient_id),
          first_name: firstName,
          last_name: lastName,
          fullName: `${firstName} ${lastName}`.trim(),
        };
      })
      .filter((patient) => !!patient.id);
  },
};
