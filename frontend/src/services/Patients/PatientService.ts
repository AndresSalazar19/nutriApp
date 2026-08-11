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

export interface AnthropometricMeasurementPayload {
  log_date: string; // "YYYY-MM-DD"
  fat_percent?: number;
  muscle_mass_kg?: number;
  skinfold_triceps?: number;
  skinfold_subscapular?: number;
  skinfold_suprailiac?: number;
  skinfold_abdominal?: number;
  skinfold_thigh?: number;
  circumference_waist?: number;
  circumference_hip?: number;
  circumference_arm?: number;
  circumference_thigh?: number;
  circumference_calf?: number;
  circumference_neck?: number;
  notes?: string;
  bioimpedanceFile?: File | null;
}

export interface AnthropometricMeasurement {
  id: string;
  user_id: string;
  log_date: string;
  fat_percent: number | null;
  muscle_mass_kg: number | null;
  bioimpedance_file_path: string | null;
  skinfold_triceps_mm: number | null;
  skinfold_subscapular_mm: number | null;
  skinfold_suprailiac_mm: number | null;
  skinfold_abdominal_mm: number | null;
  skinfold_thigh_mm: number | null;
  circumference_waist_cm: number | null;
  circumference_hip_cm: number | null;
  circumference_arm_cm: number | null;
  circumference_thigh_cm: number | null;
  circumference_calf_cm: number | null;
  circumference_neck_cm: number | null;
  notes: string | null;
  created_at: string;
}

function authHeaders(): Record<string, string> {
  const token = tokenStorage.get() ?? '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function authHeadersMultipart(): Record<string, string> {
  const token = tokenStorage.get() ?? '';
  return { Authorization: `Bearer ${token}` };
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

  async saveAnthropometricMeasurement(
    patientId: string,
    payload: AnthropometricMeasurementPayload,
  ): Promise<AnthropometricMeasurement> {
    const formData = new FormData();
    formData.append('log_date', payload.log_date);
    const appendIfSet = (key: string, value: number | string | undefined) => {
      if (value !== undefined && value !== '') formData.append(key, String(value));
    };
    appendIfSet('fat_percent', payload.fat_percent);
    appendIfSet('muscle_mass_kg', payload.muscle_mass_kg);
    appendIfSet('skinfold_triceps', payload.skinfold_triceps);
    appendIfSet('skinfold_subscapular', payload.skinfold_subscapular);
    appendIfSet('skinfold_suprailiac', payload.skinfold_suprailiac);
    appendIfSet('skinfold_abdominal', payload.skinfold_abdominal);
    appendIfSet('skinfold_thigh', payload.skinfold_thigh);
    appendIfSet('circumference_waist', payload.circumference_waist);
    appendIfSet('circumference_hip', payload.circumference_hip);
    appendIfSet('circumference_arm', payload.circumference_arm);
    appendIfSet('circumference_thigh', payload.circumference_thigh);
    appendIfSet('circumference_calf', payload.circumference_calf);
    appendIfSet('circumference_neck', payload.circumference_neck);
    appendIfSet('notes', payload.notes);
    if (payload.bioimpedanceFile) formData.append('bioimpedance_file', payload.bioimpedanceFile);

    const res = await fetch(`${API_URL}/patients/${patientId}/anthropometrics/measurement`, {
      method: 'POST',
      headers: authHeadersMultipart(),
      body: formData,
    });
    return handleResponse<AnthropometricMeasurement>(res);
  },

  async getLatestMeasurement(patientId: string): Promise<AnthropometricMeasurement | null> {
    const res = await fetch(`${API_URL}/patients/${patientId}/anthropometrics/measurement/latest`, {
      method: 'GET',
      headers: authHeaders(),
    });
    return handleResponse<AnthropometricMeasurement | null>(res);
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
