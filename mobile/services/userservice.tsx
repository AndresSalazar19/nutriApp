import { tokenStorage } from '@/utils/tokenStorage';
import { ApiResponse } from '@/models/ApiResponse';

export const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;
 
export interface UserPerson {
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  phone: string | null;
  avatar_url: string | null;
  cedula: string | null;
  gender: string | null;
}
 
export interface UserAccount {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  person: UserPerson | null;
}
 
async function authHeaders(): Promise<Record<string, string>> {
  const token = (await tokenStorage.get()) ?? '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}
 
export const UserService = {
  async getById(userId: string): Promise<UserAccount> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: await authHeaders(),
    });
    const data: ApiResponse<UserAccount> = await response.json();
 
    if (!response.ok) {
      const msg = (data as any)?.errors?.[0] ?? `Error ${response.status}`;
      throw new Error(msg);
    }
    
    return ((data as any).data ?? data) as UserAccount;
  },
};