import { ApiResponse } from '../../models/ApiResponse';
import { LoginData } from './LoginData';
import { API_URL } from '../../config/api';

export const RegistrerServices = {
  async iniciarSesion(email: string, password: string): Promise<ApiResponse<LoginData>> {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data: ApiResponse<LoginData> = await response.json();
      return data;
    } catch (error) {
      console.error('Error en RegistrerServices.iniciarSesion:', error);
      throw error;
    }
  },

  async cambiarContrasena(email: string, newPassword: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${API_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          new_password: newPassword,
        }),
      });

      const data: ApiResponse<unknown> = await response.json();

      if (!response.ok || !data.status.isSuccessfully) {
        const messages = data.status?.messages ?? [];
        throw new Error(messages.length > 0 ? messages.join(', ') : `Error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error en RegistrerServices.cambiarContrasena:', error);
      throw error;
    }
  },
};
