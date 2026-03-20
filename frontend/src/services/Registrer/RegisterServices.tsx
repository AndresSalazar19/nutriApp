 
import { ApiResponse } from "../../models/ApiResponse";
import { Especialidad } from "./Especialidad";
 
const API_URL = "http://147.93.176.210:8083/api/v1";

export const RegistrerServices = {

  async consultarEspecialidades(): Promise<ApiResponse<Especialidad[]>> {

    const response = await fetch(`${API_URL}/catalog/specialists`);

    const data = await response.json();

    return data;
  }

};