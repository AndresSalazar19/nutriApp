import { httpClient } from '../config/httpClient';
import { ApiResponse } from '../models/ApiResponse';

export type NutritionistStatusValue = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface NutritionistStatusData {
  status: NutritionistStatusValue;
}

export const NutritionistService = {
  async getStatus(userId: string): Promise<ApiResponse<NutritionistStatusData>> {
    return httpClient.get<ApiResponse<NutritionistStatusData>>(
      `/nutritionists/status/${userId}`,
    );
  },
};
