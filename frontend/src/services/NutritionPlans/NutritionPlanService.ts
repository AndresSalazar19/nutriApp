import { API_URL } from '../../config/api';
import { tokenStorage } from '../../utils/tokenStorage';

export const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

export type NutritionPlanStatus = 'pending' | 'approved' | 'rejected';
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface MealMacros {
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  calcium_mg: number | null;
  iron_mg: number | null;
  vitamin_c_mg: number | null;
  potassium_mg: number | null;
  zinc_mg: number | null;
  vitamin_a_ug: number | null;
  folate_ug: number | null;
}

export interface NutritionPlanMeal {
  id: string;
  day_of_week: number; // 1-7, Monday-Sunday
  meal_type: MealType;
  food_id: string | null;
  food_name: string | null;
  custom_food: string | null;
  quantity_g: number | null;
  instructions: string | null;
  /** Scaled from the food's per-100g composition by quantity_g; null when the meal has no catalog food. */
  macros: MealMacros | null;
}

export interface NutritionSummary {
  daily_average: MealMacros;
  by_day: Record<string, MealMacros>;
  meals_missing_macro_data: number;
}

export interface NutritionPlanPatient {
  id: string;
  name: string;
  email: string;
}

export interface NutritionPlanResponse {
  id: string;
  patient_id: string;
  nutritionist_id: string | null;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_ai_generated: boolean;
  is_active: boolean;
  status: NutritionPlanStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  patient_notes: string | null;
  source_image_path: string | null;
  created_at: string;
  meals: NutritionPlanMeal[];
  patient: NutritionPlanPatient | null;
  nutrition_summary: NutritionSummary;
}

function authHeaders() {
  const token = tokenStorage.get() ?? '';
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const raw =
      data?.status?.messages?.[0] ??
      data?.detail ??
      data?.errors?.[0] ??
      `Error ${response.status}`;

    const msg = raw.replace(/^\d+:\s*/, '');
    throw new Error(msg);
  }

  return (data?.listData ?? data?.data ?? data) as T;
}

export const NutritionPlanService = {
  async listPending(): Promise<NutritionPlanResponse[]> {
    const res = await fetch(`${API_URL}/nutrition-plans/pending`, {
      method: 'GET',
      headers: authHeaders(),
    });

    return handleResponse<NutritionPlanResponse[]>(res);
  },

  async getById(planId: string): Promise<NutritionPlanResponse> {
    const res = await fetch(`${API_URL}/nutrition-plans/${planId}`, {
      method: 'GET',
      headers: authHeaders(),
    });

    return handleResponse<NutritionPlanResponse>(res);
  },

  async approve(planId: string): Promise<NutritionPlanResponse> {
    const res = await fetch(`${API_URL}/nutrition-plans/${planId}/approve`, {
      method: 'PATCH',
      headers: authHeaders(),
    });

    return handleResponse<NutritionPlanResponse>(res);
  },

  async reject(planId: string, reason: string): Promise<NutritionPlanResponse> {
    const res = await fetch(`${API_URL}/nutrition-plans/${planId}/reject`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ reason }),
    });

    return handleResponse<NutritionPlanResponse>(res);
  },

  /** Builds a loadable URL for a plan's `source_image_path` (relative, e.g. "uploads/meal_plans/<uuid>.png"). */
  imageUrl(sourceImagePath: string | null | undefined): string | null {
    if (!sourceImagePath) return null;
    return `${API_ORIGIN}/${sourceImagePath.replace(/^\/+/, '')}`;
  },
};
