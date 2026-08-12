export type ActivityLevel = 'sedentario' | 'moderado' | 'pesado';

export interface HealthData {
  weight: string;
  height: string;
  systolic: string;
  diastolic: string;
  hasHypertension: boolean | null;
  activityLevel: ActivityLevel | null;
  medications: string;
  selectedAllergies: string[];
  dietaryRestrictions: string;
}

/** Preguntas si/no que solo pueden quedar en `true`/`false` una vez
 *  respondidas explícitamente; `null` significa "aún no contestada" y
 *  bloquea el avance del paso (ver useHistoryForm / useDietaryForm). */
export type YesNo = boolean | null;

export interface DigestiveIssues {
  constipation: boolean;
  diarrhea: boolean;
  reflux: boolean;
  bloating: boolean;
  nausea: boolean;
}

export interface FamilyHistoryData {
  diabetes: boolean;
  hypertension: boolean;
  obesity: boolean;
  cardiovascularDisease: boolean;
  cancer: boolean;
  kidneyDisease: boolean;
  eatingDisorders: boolean;
}

export interface PathologicalHistoryData {
  conditions: string[];
  otherCondition: string;
  hospitalized: YesNo;
  hospitalizedDetail: string;
  hasFoodAllergies: YesNo;
  foodAllergies: string[];
  hasFoodIntolerances: YesNo;
  foodIntolerances: string[];
  hasDigestiveIssues: YesNo;
  digestiveIssues: DigestiveIssues;
  takesMedications: YesNo;
  currentMedications: string[];
  takesSupplements: YesNo;
  supplements: string[];
  hasSurgeries: YesNo;
  surgeriesDetail: string;
  familyHistory: FamilyHistoryData;
}

export type FoodFrequencyValue = 'daily' | '3_5_week' | '1_2_week' | 'rare' | 'never';

export const FOOD_ITEMS = [
  'fruits',
  'vegetables',
  'dairy',
  'meat',
  'coldCuts',
  'fastFood',
  'sweets',
  'snacks',
  'coffee',
  'energyDrinks',
] as const;

export type FoodItem = (typeof FOOD_ITEMS)[number];

export type FoodFrequencyData = Record<FoodItem, FoodFrequencyValue | null>;

export interface DietaryHistoryData {
  mealsPerDay: string;
  skipsMeals: YesNo;
  mealPreparer: string;
  eatsOutFrequently: YesNo;
  appetite: string;
  eatsFromEmotions: YesNo;
  frequentCravings: YesNo;
  waterGlassesPerDay: string;
  drinksSugaryBeverages: YesNo;
  drinksAlcohol: YesNo;
  smokes: YesNo;
  foodFrequency: FoodFrequencyData;
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