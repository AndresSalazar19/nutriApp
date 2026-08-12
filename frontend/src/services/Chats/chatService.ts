import { API_URL } from '../../config/api';
import { tokenStorage } from '../../utils/tokenStorage';

export interface ConversationCreateRequest {
  /** The id of the other side of the conversation — a patient_id when called
   * as a nutritionist, or a nutritionist_id when called as a patient. */
  participant_id: string;
}

export interface ConversationResponse {
  id: string;
  conversation_type: 'ai' | 'human';
  patient_id: string;
  nutritionist_id?: string | null;
  participant_id: string;
  participant_name: string;
  participant_avatar_url?: string | null;
  last_message?: string | null;
  last_message_time?: string | null;
  unread_count: number;
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: 'patient' | 'nutritionist' | 'assistant';
  content: string;
  media_url?: string | null;
  sent_at: string;
  read_at?: string | null;
}

export interface ConversationMessagesResponse {
  conversation_id: string;
  messages: MessageResponse[];
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

  return data;
}

export const ChatService = {
  async createConversation(payload: ConversationCreateRequest): Promise<ConversationResponse> {
    const res = await fetch(`${API_URL}/chats/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    return handleResponse<ConversationResponse>(res);
  },

  async getConversations(): Promise<ConversationResponse[]> {
    const res = await fetch(`${API_URL}/chats/`, {
      method: 'GET',
      headers: authHeaders(),
    });

    const response = await handleResponse<any>(res);
    return response.data ?? [];
  },

  async getMessages(conversation_id: string): Promise<ConversationMessagesResponse> {
    const res = await fetch(`${API_URL}/chats/${conversation_id}/messages`, {
      method: 'GET',
      headers: authHeaders(),
    });

    const response = await handleResponse<any>(res);
    return response.data ?? [];
  },
};
