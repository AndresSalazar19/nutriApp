import { tokenStorage } from '@/utils/tokenStorage';
import { API_URL } from '@/services/userservice';

export type ActivityLevel = 'sedentario' | 'moderado' | 'pesado';

export interface PatientDetail {
  user_id: string;
  email: string;
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
  activity_level: ActivityLevel | null;
  clinical_history: Record<string, unknown>;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = (await tokenStorage.get()) ?? '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export const PatientService = {
  /** Trae el perfil de salud del paciente (peso, altura, IMC, presion,
   *  alergias, restricciones, actividad, antecedentes...) tal como se
   *  guardo en el onboarding, para mostrarlo en Mi Perfil. */
  async getDetail(patientId: string): Promise<PatientDetail> {
    const response = await fetch(`${API_URL}/patients/${patientId}`, {
      headers: await authHeaders(),
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const msg = data?.errors?.[0] ?? `Error ${response.status}`;
      throw new Error(msg);
    }

    return (data?.data ?? data) as PatientDetail;
  },
};
