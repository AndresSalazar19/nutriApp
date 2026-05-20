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
  avatar_url: string | null;
  cedula: string | null;
  gender: string | null;
}

export interface NutritionistUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  person: NutritionistPerson;
}

export interface NutritionistSpecialty {
  id: number;
  name: string;
}

export interface NutritionistProfile {
  id: string;               // profile_id — usado para aprobar/rechazar
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

function authHeaders(): Record<string, string> {
  const token = tokenStorage.get() ?? '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
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
    // El endpoint devuelve un array directo: [{...}, {...}]
    return Array.isArray(data) ? data : (data.data ?? []);
  },

  async review(
    profileId: string,
    status: 'verified' | 'rejected',
    verifiedBy: string,
  ): Promise<NutritionistProfile> {
    const response = await fetch(`${API_URL}/nutritionists/${profileId}/review`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status, verified_by: verifiedBy }),
    });
    const data = await response.json();
    if (!response.ok) {
      const msg = data?.detail ?? data?.errors?.[0] ?? `Error ${response.status}`;
      throw new Error(msg);
    }
    return data.data ?? data;
  },
};
