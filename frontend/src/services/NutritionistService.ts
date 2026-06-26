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

// NUEVO: Interfaz para los documentos del nutricionista
export interface NutritionistDocuments {
  cv_url: string | null;
  senescyt_url: string | null;
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
    return Array.isArray(data) ? data : (data.data ?? []);
  },

  // ACTUALIZADO: Se añade el parámetro opcional rejectionReason
  async review(
    profileId: string,
    status: 'verified' | 'rejected',
    verifiedBy: string,
    rejectionReason?: string,
  ): Promise<NutritionistProfile> {
    // Armamos el payload dinámicamente. Si es verified, manda null, si es rejected, manda la razón.
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

  // NUEVO: Método para obtener las rutas de los PDFs
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
};
