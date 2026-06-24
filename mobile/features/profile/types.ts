export interface PersonalInfo {
  cedula: string;
  phone: string;
  birthDate: string;
  height: string;
  gender: string;
}

export interface HealthInfo {
  medicalCondition: string;
  allergies: string;
}

export interface Nutritionist {
  name: string;
  specialty: string;
}

export interface UserProfile {
  name: string;
  email: string;
  plan: string;
  personalInfo: PersonalInfo;
  healthInfo: HealthInfo;
  nutritionist: Nutritionist;
}
