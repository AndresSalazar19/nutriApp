export interface LoginUserData {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  person: any | null;
}

export interface LoginData {
  access_token: string;
  token_type: string;
  user: LoginUserData;
}
