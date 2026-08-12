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
  /** Code del plan en backend ('basic' | 'standard' | 'premium'). Es lo que
   *  espera SubscriptionService.subscribe(), a diferencia de `id` (uuid) que
   *  solo se usa para renderizar/seleccionar en la UI. */
  code?: 'basic' | 'standard' | 'premium';
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