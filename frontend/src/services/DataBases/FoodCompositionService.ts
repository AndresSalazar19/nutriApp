import { API_URL } from "../../config/api";
import { tokenStorage } from "../../utils/tokenStorage";

// 1. Interfaz basada en tu JSON de respuesta
export interface FoodComposition {
  id: string;
  name: string;
  category: string;
  calories_kcal: number | null;
  carbs_g: number | null;
  protein_g: number | null;
  fat_g: number | null;
  calcium_mg: number | null;
  potassium_mg: number | null;
  sodium_mg: number | null;
  zinc_mg: number | null;
  vitamin_c_mg: number | null;
  vitamin_a_ug: number | null;
  folate_ug: number | null;
  serving_per_cup_g: number | null;
  serving_per_tbsp_g: number | null;
  serving_per_unit_g: number | null;
  is_active: boolean;
}

// 2. Payload para Crear/Actualizar
export type FoodCompositionPayload = Omit<FoodComposition, 'id' | 'is_active'>;

function authHeaders() {
  const token = tokenStorage.get() ?? '';
  return { 
    'Authorization': `Bearer ${token}`, 
    'Content-Type': 'application/json' 
  };
}

// 3. El Servicio usando /food-items
export const FoodCompositionService = {
  
  // GET /food-items - Obtener todos (con soporte para filtrar por categoría)
  async getAll(params?: { category?: string; skip?: number; limit?: number }): Promise<FoodComposition[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.skip != null) query.append('skip', String(params.skip));
    if (params?.limit != null) query.append('limit', String(params.limit));

    const response = await fetch(`${API_URL}/food-items?${query.toString()}`, {
      headers: authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.detail ?? `Error ${response.status}`);
    
    return Array.isArray(data) ? data : (data.data ?? []);
  },

  // GET /food-items/{id}
  async getById(id: string): Promise<FoodComposition> {
    const response = await fetch(`${API_URL}/food-items/${id}`, {
      headers: authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.detail ?? `Error ${response.status}`);
    return data;
  },

  // POST /food-items
  async create(payload: FoodCompositionPayload): Promise<FoodComposition> {
    const response = await fetch(`${API_URL}/food-items`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.detail ?? `Error ${response.status}`);
    return data;
  },

  // POST /food-items/bulk
  async createBulk(payload: FoodCompositionPayload[]): Promise<FoodComposition[]> {
    const response = await fetch(`${API_URL}/food-items/bulk`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.detail ?? `Error ${response.status}`);
    return Array.isArray(data) ? data : (data.data ?? []);
  },

  // PUT /food-items/{id}
  async update(id: string, payload: Partial<FoodCompositionPayload>): Promise<FoodComposition> {
    const response = await fetch(`${API_URL}/food-items/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.detail ?? `Error ${response.status}`);
    return data;
  },

  // DELETE /food-items/{id}
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/food-items/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.detail ?? `Error ${response.status}`);
    }
  }
};