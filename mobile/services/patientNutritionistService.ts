import { tokenStorage } from '@/utils/tokenStorage';
import { API_URL } from '@/services/userservice';

export type PatientNutritionistStatus = 'active' | 'inactive';

export interface PatientNutritionistQueryParams {
  patient_id?: string;
  nutritionist_id?: string;
  status?: PatientNutritionistStatus;
}

export interface ApiPerson {
  first_name: string;
  last_name: string;
}

export interface ApiSpecialty {
  id: number;
  name: string;
}

export interface ApiNutritionistProfile {
  specialty: ApiSpecialty | null;
  years_experience: number | null;
}

export interface ApiUser {
  id: string;
  email: string;
  avatar_url: string | null;
  person: ApiPerson | null;
  nutritionist_profile: ApiNutritionistProfile | null;
}

export interface PatientNutritionistResponse {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  assigned_at: string;
  ended_at?: string | null;
  is_active: boolean;
  patient: ApiUser | null;
  nutritionist: ApiUser | null;
}

/** Forma ya aplanada, lista para pintar en pantalla (nombre + especialidad). */
export interface AssignedNutritionist {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  specialty: string | null;
  email: string;
  avatar_url: string | null;
}

async function authHeaders(): Promise<Record<string, string>> {
  // OJO: tokenStorage.get() es async -- si falta el await, el header
  // Authorization se manda como "Bearer [object Promise]" en vez del token real.
  const token = (await tokenStorage.get()) ?? '';
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
  /** Lista cruda, usar cuando se necesitan varios registros o filtros custom. */
  async list(params: PatientNutritionistQueryParams): Promise<PatientNutritionistResponse[]> {
    const query = new URLSearchParams();
    if (params.patient_id) query.append('patient_id', params.patient_id);
    if (params.nutritionist_id) query.append('nutritionist_id', params.nutritionist_id);
    if (params.status) {
      query.append('status', params.status);
    }

    const res = await fetch(`${API_URL}/patient_nutritionists?${query.toString()}`, {
      method: 'GET',
      headers: await authHeaders(),
    });

    // OJO: este endpoint devuelve la lista directa (response_model=list[...]),
    // no envuelta en {data: [...]} como el resto de la API.
    return handleResponse<PatientNutritionistResponse[]>(res);
  },

  /**
   * Wrapper sobre list() que devuelve directo el nutricionista activo del
   * paciente, ya aplanado y listo para pintar. Usar esto desde pantallas
   * (Home, Profile, etc.) en vez de list() cuando solo se necesita
   * "el nutricionista asignado".
   */
  async getAssigned(patientId: string): Promise<AssignedNutritionist | null> {
    const entries = await PatientNutritionistService.list({
      patient_id: patientId,
      status: 'active',
    });

    const entry = entries[0];
    if (!entry?.nutritionist) return null;

    const person = entry.nutritionist.person;
    const name = person ? `${person.first_name} ${person.last_name}`.trim() : entry.nutritionist.email;

    return {
      id: entry.nutritionist.id,
      name,
      first_name: person?.first_name ?? '',
      last_name: person?.last_name ?? '',
      specialty: entry.nutritionist.nutritionist_profile?.specialty?.name ?? null,
      email: entry.nutritionist.email,
      avatar_url: entry.nutritionist.avatar_url,
    };
  },
};