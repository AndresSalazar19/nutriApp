export interface RegisterPageProps {
  onGoToLogin: () => void;
  /** Llamado tras registro exitoso: hace auto-login y redirige al dashboard */
  onRegistered?: (userData: { userId: string; email: string; role: string }) => void;
}

export interface FormState {
  fullName: string;
  cedula: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  specialties: string;
  yearsExperience: string;
  password: string;
  confirmPassword: string;
}

export type FormErrors = Partial<Record<keyof FormState, string>> & {
  acceptTerms?: string;
  cvFile?: string;
  senescytFile?: string;
};

export interface StepProps {
  form: FormState;
  update: (field: keyof FormState, value: string) => void;
}
