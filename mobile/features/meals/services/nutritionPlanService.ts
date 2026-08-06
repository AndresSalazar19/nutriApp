import { tokenStorage } from '@/utils/tokenStorage';

const API_ORIGIN = process.env.EXPO_PUBLIC_API_URL ?? '';
const API = `${API_ORIGIN}/api/v1`;

export type NutritionPlanStatus = 'pending' | 'approved' | 'rejected';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionPlanMeal {
  id: string;
  day_of_week: number; // 1-7, Monday-Sunday
  meal_type: MealType;
  food_id: string | null;
  food_name: string | null;
  custom_food: string | null;
  quantity_g: number | null;
  instructions: string | null;
}

export interface NutritionPlan {
  id: string;
  patient_id: string;
  nutritionist_id: string | null;
  title: string;
  description: string | null;
  start_date: string | null; // "YYYY-MM-DD"
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
}

export interface GeneratePlanPayload {
  text: string;
  imageUri: string;
  mimeType?: string | null;
  fileName?: string | null;
}

interface ApiEnvelope<T> {
  data?: T | null;
  listData?: T | null;
  status?: { isSuccessfully?: boolean; messages?: string[] };
  detail?: unknown;
}

class NutritionPlanApiError extends Error {
  status: number;
  retryable: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    // 502 = AI provider unreachable, per the integration guide — safe to retry.
    this.retryable = status === 502;
  }
}

function extractErrorMessage(payload: ApiEnvelope<unknown> | null, status: number): string {
  const fromStatus = payload?.status?.messages?.[0];
  if (typeof fromStatus === 'string' && fromStatus.trim()) return fromStatus;

  const detail = payload?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (typeof first === 'string') return first;
    if (first && typeof first.msg === 'string') return first.msg;
  }

  return `No se pudo completar la solicitud (error ${status})`;
}

async function handle<T>(response: Response): Promise<T> {
  const text = await response.text();
  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON body (rare) — fall through to the generic error below.
  }

  if (!response.ok) {
    throw new NutritionPlanApiError(extractErrorMessage(payload, response.status), response.status);
  }

  return (payload?.listData ?? payload?.data ?? (payload as unknown as T)) as T;
}

async function authHeader(): Promise<Record<string, string>> {
  const token = (await tokenStorage.get()) ?? '';
  return { Authorization: `Bearer ${token}` };
}

function guessFileName(uri: string, mimeType?: string | null): string {
  const fromUri = uri.split('/').pop();
  if (fromUri && fromUri.includes('.')) return fromUri;
  const ext = mimeType?.split('/')[1] ?? 'jpg';
  return `pantry.${ext}`;
}

export const NutritionPlanService = {
  /**
   * Submits a pantry/food photo + a short note describing what the patient has
   * at home. The backend runs this through the AI synchronously (several
   * seconds) and returns a draft plan with status "pending" — it still needs
   * nutritionist approval before it becomes the active plan.
   */
  async generate({ text, imageUri, mimeType, fileName }: GeneratePlanPayload): Promise<NutritionPlan> {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('image', {
      uri: imageUri,
      name: fileName || guessFileName(imageUri, mimeType),
      type: mimeType || 'image/jpeg',
    } as unknown as Blob);

    const response = await fetch(`${API}/nutrition-plans`, {
      method: 'POST',
      headers: {
        ...(await authHeader()),
        // No Content-Type here — fetch sets the multipart boundary itself.
      },
      body: formData,
    });

    return handle<NutritionPlan>(response);
  },

  async listMine(): Promise<NutritionPlan[]> {
    const response = await fetch(`${API}/nutrition-plans/mine`, {
      headers: await authHeader(),
    });
    return handle<NutritionPlan[]>(response);
  },

  async getById(planId: string): Promise<NutritionPlan> {
    const response = await fetch(`${API}/nutrition-plans/${planId}`, {
      headers: await authHeader(),
    });
    return handle<NutritionPlan>(response);
  },

  /** Builds a loadable URL for a plan's `source_image_path` (relative, e.g. "uploads/meal_plans/<uuid>.png"). */
  imageUrl(sourceImagePath: string | null | undefined): string | null {
    if (!sourceImagePath) return null;
    return `${API_ORIGIN}/${sourceImagePath.replace(/^\/+/, '')}`;
  },
};

export { NutritionPlanApiError };
