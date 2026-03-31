import { API_URL } from '../config/api';
import { ApiResponse } from '../models/ApiResponse';

export type NutritionistStatusValue = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface NutritionistStatusData {
  status: NutritionistStatusValue;
}

export const NutritionistService = {
  async getStatus(userId: string): Promise<ApiResponse<NutritionistStatusData>> {
    const response = await fetch(`${API_URL}/nutritionists/status/${userId}`);
    return response.json();
  },
};
