export interface RegisterPageProps {
  onGoToLogin: () => void;
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

export interface StepProps {
  form: FormState;
  update: (field: keyof FormState, value: string) => void;
}