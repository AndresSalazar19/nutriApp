import { ApiResponse } from "../../models/ApiResponse";
import { Especialidad } from "./Especialidad";

const API_URL = "http://localhost:8000/api/v1";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Payload exacto que espera el backend POST /api/v1/users/ */
export interface RegisterUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string; // formato ISO: YYYY-MM-DD
}

/** Shape del campo data en la respuesta de creación de usuario */
export interface RegisteredUser {
  id: string;
  email: string;
  person: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const RegistrerServices = {

  /**
   * Crea un nuevo usuario en el backend.
   * Endpoint: POST /api/v1/users/
   */
  async crearUsuario(userData: RegisterUserData): Promise<ApiResponse<RegisteredUser>> {
    console.log('📤 Enviando al backend:', userData);

    const response = await fetch(`${API_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data: ApiResponse<RegisteredUser> = await response.json();

    console.log('📥 Respuesta del backend:', data);

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
