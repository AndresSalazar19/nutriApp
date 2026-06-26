import { API_URL } from '../config/api';
import { tokenStorage } from '../utils/tokenStorage';
import { ApiResponse } from '../models/ApiResponse';

export type NutritionistStatusValue = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface NutritionistStatusData {
  status: NutritionistStatusValue;
}

export interface NutritionistPerson {
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  phone: string | null;
  cedula: string | null;
  gender: string | null;
}

export interface NutritionistUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  avatar_url: string | null;
  person: NutritionistPerson;
}

export interface NutritionistSpecialty {
  id: number;
  name: string;
}

export interface NutritionistProfile {
  id: string; // profile_id — usado para aprobar/rechazar
  license_number: string;
  bio: string | null;
  specialty_id: number;
  years_experience: number | null;
  education: string | null;
  consultation_fee: number | null;
  max_patients: number | null;
  status: NutritionistStatusValue;
  user: NutritionistUser;
  specialty: NutritionistSpecialty | null;
}

export interface NutritionistDocuments {
  cv_url: string | null;
  senescyt_url: string | null;
}

export interface NutritionistDocumentResponse {
  id: string;
  document_type: 'cv' | 'senescyt' | string;
  file_path: string;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  is_verified: boolean;
}

export interface AvailabilityRule {
  id: string;
  nutritionist_id: string;
  rule_type: 'recurring' | 'exception' | string;
  day_of_week?: number | null;
  specific_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  is_available?: boolean | null;
}

export interface AvailabilityCalendar {
  week_start: string;
  days: Record<string, AvailabilityRule[]>;
  exceptions: AvailabilityRule[];
}

export interface NutritionistProfileDetail extends NutritionistProfile {
  documents: NutritionistDocumentResponse[];
  availabilities: AvailabilityRule[];
}

function authHeaders(): Record<string, string> {
  const token = tokenStorage.get() ?? '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const msg = data?.detail ?? data?.errors?.[0] ?? `Error ${response.status}`;
    throw new Error(msg);
  }

  return data.data ?? data;
}

export const NutritionistService = {
  async getStatus(userId: string): Promise<ApiResponse<NutritionistStatusData>> {
    const response = await fetch(`${API_URL}/nutritionists/status/${userId}`, {
      headers: authHeaders(),
    });
    return response.json();
  },

  async getAll(status?: NutritionistStatusValue): Promise<NutritionistProfile[]> {
    const query = status ? `?status=${status}` : '';
    const response = await fetch(`${API_URL}/nutritionists${query}`, {
      headers: authHeaders(),
    });
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data ?? []);
  },

  async review(
    profileId: string,
    status: 'verified' | 'rejected',
    verifiedBy: string,
    rejectionReason?: string,
  ): Promise<NutritionistProfile> {
    const payload = {
      status,
      verified_by: verifiedBy,
      rejection_reason: status === 'rejected' ? rejectionReason : null,
    };

    const response = await fetch(`${API_URL}/nutritionists/${profileId}/review`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      const msg = data?.detail ?? data?.errors?.[0] ?? `Error ${response.status}`;
      throw new Error(msg);
    }
    return data.data ?? data;
  },

  async getDocuments(profileId: string): Promise<NutritionistDocuments> {
    const response = await fetch(`${API_URL}/nutritionists/${profileId}/documents`, {
      headers: authHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      const msg = data?.detail ?? `Error al cargar documentos (${response.status})`;
      throw new Error(msg);
    }

    return data;
  },

  async getNutritionistProfile(userId: string): Promise<NutritionistProfileDetail> {
    const response = await fetch(`${API_URL}/nutritionists/profile/${userId}`, {
      headers: authHeaders(),
    });

    return handleResponse<NutritionistProfileDetail>(response);
  },

  async getAvailabilityCalendar(userId: string): Promise<AvailabilityCalendar> {
    const response = await fetch(`${API_URL}/appointment/availability/calendar/${userId}`, {
      headers: authHeaders(),
    });

    return handleResponse<AvailabilityCalendar>(response);
  },

  async createAvailability(
    nutritionistId: string,
    payload: Omit<AvailabilityRule, 'id' | 'nutritionist_id' | 'nutritionist'>,
  ): Promise<AvailabilityRule> {
    const response = await fetch(`${API_URL}/appointment/availability/${nutritionistId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    return handleResponse<AvailabilityRule>(response);
  },

  async updateAvailability(
    availabilityId: string,
    payload: Omit<AvailabilityRule, 'id' | 'nutritionist_id' | 'nutritionist'>,
  ): Promise<AvailabilityRule> {
    const response = await fetch(`${API_URL}/appointment/availability/${availabilityId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    return handleResponse<AvailabilityRule>(response);
  },

  async deleteAvailability(availabilityId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/appointment/availability/${availabilityId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    return handleResponse<{ message: string }>(response);
  },
};
