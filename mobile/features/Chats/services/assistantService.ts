import { tokenStorage } from '@/utils/tokenStorage';

const API = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;

export interface AssistantMessageRequest {
    content: string;
}

export interface AssistantMessageResponse {
    id: string;
    conversation_id: string;
    sender_id: string;
    sender_role: 'patient' | 'assistant';
    content: string;
    media_url?: string | null;
    sent_at: string;
    read_at?: string | null;
}

async function authHeaders() {
    const token = (await tokenStorage.get()) ?? '';

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

    return data;
}

export const AssistantService = {
    async getMessages(): Promise<AssistantMessageResponse[]> {
        const res = await fetch(`${API}/assistant/messages`, {
            method: 'GET',
            headers: await authHeaders(),
        });

        const response = await handleResponse<any>(res);
        return response.data ?? [];
    },

    async sendMessage(content: string): Promise<AssistantMessageResponse> {
        const res = await fetch(`${API}/assistant/messages`, {
            method: 'POST',
            headers: await authHeaders(),
            body: JSON.stringify({ content }),
        });

        const response = await handleResponse<any>(res);
        return response.data;
    },
};