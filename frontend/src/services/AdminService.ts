import { API_URL } from '../config/api';
import { tokenStorage } from '../utils/tokenStorage';

export interface AdminDashboardStats {
  nutritionists_total: number;
  nutritionists_new_this_month: number;
  patients_total: number;
  patients_new_this_month: number;
  subscriptions_active: number;
  subscription_rate: number;
  content_published_total: number;
  content_published_this_week: number;
}

export interface AdminActivityItem {
  text: string;
  time: string;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  activity: AdminActivityItem[];
}

function authHeaders(): Record<string, string> {
  const token = tokenStorage.get() ?? '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export const AdminService = {
  async getDashboard(): Promise<AdminDashboardData> {
    const response = await fetch(`${API_URL}/admin/dashboard`, {
      headers: authHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      const msg = data?.status?.messages?.[0] ?? data?.detail ?? `Error ${response.status}`;
      throw new Error(msg);
    }

    return data.data ?? data;
  },
};
