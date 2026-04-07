export interface LoginData {
  id: string;
  email: string;
  role: string;
  token: string;
  is_active: boolean;
  email_verified: boolean;
  person: any | null;
}