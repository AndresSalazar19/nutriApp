import { ApiResponse } from "../../models/ApiResponse";
import { LoginData } from "./LoginData";
import { API_URL } from "../../config/api";

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
      console.error("Error en RegistrerServices.iniciarSesion:", error);
      throw error; 
    }
  }
};