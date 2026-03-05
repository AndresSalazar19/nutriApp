export interface HealthData {
  weight: string;
  height: string;
  systolic: string;
  diastolic: string;
  hasHypertension: boolean;
  medications: string;
  selectedAllergies: string[];
  dietaryRestrictions: string;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  badge?: string;
  savingsText?: string;
  accentColor: string;
  titleColor: string;
  features: string[];
}

export interface PaymentData {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  country: string;
  city: string;
  postalCode: string;
  acceptedTerms: boolean;
}

export interface StepConfig {
  id: number;
  label: string;
  icon?: string;
}
