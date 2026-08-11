import { API_URL } from '../../config/api';
import { WeightEntry } from '../../components/mock/patientsMock';
import { tokenStorage } from '../../utils/tokenStorage';

interface WeightLogResponse {
  id: string;
  user_id: string;
  weight_kg: number;
  log_date: string;
  notes: string | null;
  created_at: string;
}

function authHeaders(): Record<string, string> {
  const token = tokenStorage.get() ?? '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const raw =
      data?.status?.messages?.[0] ?? data?.detail ?? data?.errors?.[0] ?? `Error ${response.status}`;
    throw new Error(String(raw).replace(/^\d+:\s*/, ''));
  }
  return (data?.listData ?? data?.data ?? data) as T;
}

export const WeightLogService = {
  async getHistory(userId: string): Promise<WeightEntry[]> {
    const res = await fetch(`${API_URL}/weight-log/${userId}?limit=100`, {
      method: 'GET',
      headers: authHeaders(),
    });
    const logs = await handleResponse<WeightLogResponse[]>(res);
    return logs
      .slice()
      .sort((a, b) => a.log_date.localeCompare(b.log_date))
      .map((log) => ({ date: log.log_date, value: log.weight_kg }));
  },
};
