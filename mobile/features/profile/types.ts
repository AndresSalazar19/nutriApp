export interface PersonalInfo {
  cedula: string;
  phone: string;
  birthDate: string;
  height: string;
  gender: string;
}

export interface HealthInfo {
  weight: string;
  bmi: string;
  bloodPressure: string;
  activityLevel: string;
  medicalCondition: string;
  allergies: string;
  dietaryRestrictions: string;
}

export interface Nutritionist {
  id?: string;
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