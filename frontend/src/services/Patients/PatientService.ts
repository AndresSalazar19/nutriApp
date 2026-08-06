import { API_URL } from '../../config/api';
import { tokenStorage } from '../../utils/tokenStorage';

export interface PatientPerson {
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  phone: string | null;
  cedula: string | null;
  gender: string | null;
}

export interface PatientDetail {
  user_id: string;
  email: string;
  person: PatientPerson | null;
  status: string;
  priority_flag: boolean;
  clinical_notes: string | null;
  height_m: number | null;
  weight_kg: number | null;
  bmi: number | null;
  systolic: number | null;
  diastolic: number | null;
  hypertension_diagnosed: boolean;
  medications: string[];
  allergies: string[];
  dietary_restrictions: string[];
}

export interface AnthropometricUpdatePayload {
  log_date: string; // "YYYY-MM-DD"
  weight_kg?: number;
  height_m?: number;
  notes?: string;
}

function authHeaders(): Record<string, string> {
  const token = tokenStorage.get() ?? '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const raw =
      data?.status?.messages?.[0] ??
      data?.detail ??
      data?.errors?.[0] ??
      `Error ${response.status}`;

    const msg = raw.replace(/^\d+:\s*/, '');
    throw new Error(msg);
  }

  return data?.data as T;
}

export const PatientService = {
  async getDetail(patientId: string): Promise<PatientDetail> {
    const res = await fetch(`${API_URL}/patients/${patientId}`, {
      method: 'GET',
      headers: authHeaders(),
    });
    return handleResponse<PatientDetail>(res);
  },

  async updateAnthropometrics(
    patientId: string,
    payload: AnthropometricUpdatePayload,
  ): Promise<PatientDetail> {
    const res = await fetch(`${API_URL}/patients/${patientId}/anthropometrics`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<PatientDetail>(res);
  },

  async updateNotes(patientId: string, clinicalNotes: string): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/patients/${patientId}/notes`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ clinical_notes: clinicalNotes }),
    });
    return handleResponse(res);
  },

  async updateFlag(patientId: string, priorityFlag: boolean): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/patients/${patientId}/flag`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ priority_flag: priorityFlag }),
    });
    return handleResponse(res);
  },

  async updateStatus(
    patientId: string,
    status: 'active' | 'inactive' | 'at_risk',
  ): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/patients/${patientId}/status`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
};
