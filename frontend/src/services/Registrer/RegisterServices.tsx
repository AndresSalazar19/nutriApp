import { ApiResponse } from "../../models/ApiResponse";
import { Especialidad } from "./Especialidad";
import { API_URL } from "../../config/api";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * @deprecated  Usar NutritionistRegisterData en su lugar.
 * Payload mínimo que solo crea el user base, sin perfil de nutricionista.
 */
export interface RegisterUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  role: 'patient' | 'nutritionist' | 'admin';
}

/**
 * Payload que espera el backend POST /api/v1/nutritionists (JSON).
 * Los archivos CV/Senescyt se subirán en un paso posterior.
 */
export interface NutritionistRegisterData {
  // tabla users + persons
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;        // YYYY-MM-DD
  phone: string;
  gender: string;
  cedula: string;
  // tabla nutritionist_profile
  specialty_id: number;
  years_experience: number;
}
export interface RegisteredNutritionist {
  id: string;          // id del nutritionist_profile
  user_id: string;     // id del user creado
  license_number: string;
  specialty_id: number;
  years_experience: number;
  status: string;      // 'pending' al crear
}

/**
 * @deprecated  Conservado solo para compatibilidad durante migración.
 * Shape de respuesta de POST /users/
 */
export interface RegisteredUser {
  id: string;
  email: string;
  role: string;
  person: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    cedula: string;
    gender: string;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const RegistrerServices = {

  /**
   * Registra un nutricionista completo en una sola llamada atómica.
   * El backend crea internamente: user + person + nutritionist_profile.
   * Envía JSON — el endpoint recibe NutritionistCreateRequest (Pydantic).
   * Los archivos CV/Senescyt se suben en un paso posterior.
   *
   * Endpoint: POST /api/v1/nutritionists
   */
  async crearNutricionista(data: NutritionistRegisterData): Promise<ApiResponse<RegisteredNutritionist>> {
    console.log('Enviando registro de nutricionista al backend');

    const response = await fetch(`${API_URL}/nutritionists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<RegisteredNutritionist> = await response.json();

    console.log('📥 Respuesta del backend:', result);

    if (!response.ok || !result.status.isSuccessfully) {
      const messages = result.status?.messages ?? [];
      throw new Error(messages.length > 0 ? messages.join(', ') : `Error ${response.status}`);
    }

    return result;
  },

  /**
   * @deprecated  Usar crearNutricionista en su lugar.
   * Este endpoint solo crea el user base sin perfil asociado.
   * Si el segundo paso falla, queda un user huérfano en la BD.
   */
  async crearUsuario(userData: RegisterUserData): Promise<ApiResponse<RegisteredUser>> {
    console.warn('[RegisterServices] crearUsuario está deprecado. Usa crearNutricionista.');
    console.log('📤 Enviando al backend:', userData);

    const response = await fetch(`${API_URL}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data: ApiResponse<RegisteredUser> = await response.json();

    console.log('Respuesta del backend:', data);

    if (!response.ok || !data.status.isSuccessfully) {
      const messages = data.status?.messages ?? [];
      throw new Error(messages.length > 0 ? messages.join(', ') : `Error ${response.status}`);
    }

    return data;
  },

  /** Obtiene el listado de especialidades para el formulario de registro */
  async consultarEspecialidades(): Promise<ApiResponse<Especialidad[]>> {
    const response = await fetch(`${API_URL}/catalog/specialists`);
    const data = await response.json();
    return data;
  },

};