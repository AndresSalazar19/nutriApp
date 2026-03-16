export interface LoginData {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  person: any | null;
}