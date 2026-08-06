import { API_URL } from '../../config/api';
import { tokenStorage } from '../../utils/tokenStorage';

export interface ConsentStatus {
  required: boolean;
  accepted: boolean;
  consent_type: string | null;
  version: string | null;
  required_items: string[];
  accepted_at: string | null;
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

  return data?.data as T;
}

export const ConsentService = {
  async getStatus(): Promise<ConsentStatus> {
    const res = await fetch(`${API_URL}/consents/me`, {
      method: 'GET',
      headers: authHeaders(),
    });

    return handleResponse<ConsentStatus>(res);
  },

  async accept(signatureName: string): Promise<{ consent_type: string; version: string; accepted_at: string }> {
    const res = await fetch(`${API_URL}/consents/accept`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ signature_name: signatureName }),
    });

    return handleResponse(res);
  },
};
