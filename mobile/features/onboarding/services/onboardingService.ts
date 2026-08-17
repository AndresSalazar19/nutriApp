import { DietaryHistoryData, HealthData, PathologicalHistoryData, PaymentData } from '../types';
import { AuthService } from '@/features/auth/services/authService';
import { ProgressService } from '@/features/progress/services/progressService';
import { tokenStorage } from '@/utils/tokenStorage';
import { OnboardingProgress } from './onboardingProgress';
import { SubscriptionService, UserSubscription, toSubscriptionPlanCode } from './subscriptionService';
import { Plan as ApiPlan } from './planService';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function csvToList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

/**
 * Submit health profile data to the backend.
 * Replace with real API call when backend is ready.
 */
export async function submitHealthProfile(data: HealthData): Promise<void> {
  const user = await AuthService.getUser();
  if (!user?.id) {
    throw new Error('No hay sesion activa para guardar los datos de salud.');
  }

  const logDate = todayISO();
  const weight = Number(data.weight);
  const systolic = Number(data.systolic);
  const diastolic = Number(data.diastolic);

  const token = await tokenStorage.get();
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/patients/${user.id}/health`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
    body: JSON.stringify({
      height_m: Number(data.height), weight_kg: weight, systolic, diastolic,
      hypertension_diagnosed: data.hasHypertension,
      activity_level: data.activityLevel,
      medications: csvToList(data.medications),
      allergies: data.selectedAllergies,
      dietary_restrictions: csvToList(data.dietaryRestrictions),
    }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const validationMessage = Array.isArray(payload?.detail)
      ? payload.detail[0]?.msg
      : payload?.detail;
    throw new Error(
      payload?.errors?.[0] ?? validationMessage ?? 'No se pudo guardar el perfil medico.'
    );
  }

  await Promise.all([
    Number.isFinite(weight) && weight > 0
      ? ProgressService.createWeightLog({
          user_id: user.id,
          weight_kg: weight,
          log_date: logDate,
          notes: 'Registro inicial de salud',
        })
      : Promise.resolve(),
    Number.isFinite(systolic) && Number.isFinite(diastolic) && systolic > 0 && diastolic > 0
      ? ProgressService.createBloodPressureLog({
          user_id: user.id,
          systolic,
          diastolic,
          log_date: logDate,
          notes: 'Registro inicial de salud',
        })
      : Promise.resolve(),
  ]);
  await OnboardingProgress.set(user.id, 'history');
}

/**
 * Submit antecedentes personales patologicos + familiares (paso 2 del
 * wizard de perfil medico).
 */
export async function submitPathologicalHistory(data: PathologicalHistoryData): Promise<void> {
  const user = await AuthService.getUser();
  if (!user?.id) {
    throw new Error('No hay sesion activa para guardar tus antecedentes.');
  }

  const token = await tokenStorage.get();
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/api/v1/patients/${user.id}/pathological-history`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
      body: JSON.stringify({
        conditions: data.conditions,
        other_condition: data.otherCondition || null,
        hospitalized: data.hospitalized,
        hospitalized_detail: data.hospitalizedDetail || null,
        has_food_allergies: data.hasFoodAllergies,
        food_allergies: data.foodAllergies,
        has_food_intolerances: data.hasFoodIntolerances,
        food_intolerances: data.foodIntolerances,
        has_digestive_issues: data.hasDigestiveIssues,
        digestive_issues: data.digestiveIssues,
        takes_medications: data.takesMedications,
        current_medications: data.currentMedications,
        takes_supplements: data.takesSupplements,
        supplements: data.supplements,
        has_surgeries: data.hasSurgeries,
        surgeries_detail: data.surgeriesDetail || null,
        family_history: {
          diabetes: data.familyHistory.diabetes,
          hypertension: data.familyHistory.hypertension,
          obesity: data.familyHistory.obesity,
          cardiovascular_disease: data.familyHistory.cardiovascularDisease,
          cancer: data.familyHistory.cancer,
          kidney_disease: data.familyHistory.kidneyDisease,
          eating_disorders: data.familyHistory.eatingDisorders,
        },
      }),
    }
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const validationMessage = Array.isArray(payload?.detail)
      ? payload.detail[0]?.msg
      : payload?.detail;
    throw new Error(
      payload?.errors?.[0] ?? validationMessage ?? 'No se pudieron guardar tus antecedentes.'
    );
  }

  await OnboardingProgress.set(user.id, 'dietary');
}

/**
 * Submit historia alimentaria + frecuencia de consumo (paso 3 del wizard de
 * perfil medico).
 */
export async function submitDietaryHistory(data: DietaryHistoryData): Promise<void> {
  const user = await AuthService.getUser();
  if (!user?.id) {
    throw new Error('No hay sesion activa para guardar tu historia alimentaria.');
  }

  const mealsPerDay = Number(data.mealsPerDay);
  const waterGlasses = Number(data.waterGlassesPerDay);

  const token = await tokenStorage.get();
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/api/v1/patients/${user.id}/dietary-history`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
      body: JSON.stringify({
        meals_per_day: Number.isFinite(mealsPerDay) && mealsPerDay > 0 ? mealsPerDay : null,
        skips_meals: data.skipsMeals,
        meal_preparer: data.mealPreparer || null,
        eats_out_frequently: data.eatsOutFrequently,
        appetite: data.appetite || null,
        eats_from_emotions: data.eatsFromEmotions,
        frequent_cravings: data.frequentCravings,
        water_glasses_per_day: Number.isFinite(waterGlasses) && waterGlasses >= 0 ? waterGlasses : null,
        drinks_sugary_beverages: data.drinksSugaryBeverages,
        drinks_alcohol: data.drinksAlcohol,
        smokes: data.smokes,
        food_frequency: {
          fruits: data.foodFrequency.fruits,
          vegetables: data.foodFrequency.vegetables,
          dairy: data.foodFrequency.dairy,
          meat: data.foodFrequency.meat,
          cold_cuts: data.foodFrequency.coldCuts,
          fast_food: data.foodFrequency.fastFood,
          sweets: data.foodFrequency.sweets,
          snacks: data.foodFrequency.snacks,
          coffee: data.foodFrequency.coffee,
          energy_drinks: data.foodFrequency.energyDrinks,
        },
      }),
    }
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const validationMessage = Array.isArray(payload?.detail)
      ? payload.detail[0]?.msg
      : payload?.detail;
    throw new Error(
      payload?.errors?.[0] ?? validationMessage ?? 'No se pudo guardar tu historia alimentaria.'
    );
  }

  await OnboardingProgress.set(user.id, 'plans');
}

/**
 * Submit selected subscription plan.
 * `planCode` es el code del catalogo ('basic' | 'standard' | 'premium', tabla
 * `plans`), NO el id (uuid). Internamente se convierte al code que acepta el
 * enum subscription_plan en BD ('standard' -> 'basic', ver subscriptionService).
 *
 * Devuelve la suscripcion creada y actualiza el paso del onboarding a 'payment'.
 */
export async function submitPlanSelection(planCode: ApiPlan['code']): Promise<UserSubscription> {
  const user = await AuthService.getUser();
  if (!user?.id) {
    throw new Error('No hay sesion activa para guardar el plan.');
  }

  const subscription = await SubscriptionService.subscribe(user.id, toSubscriptionPlanCode(planCode));
  await OnboardingProgress.set(user.id, 'payment');
  return subscription;
}

/**
 * Process payment.
 * Replace with real payment gateway integration (e.g. Stripe) when ready.
 */
export async function processPayment(data: PaymentData): Promise<void> {
  // TODO: POST /api/payments/process
  console.log('[onboardingService] processPayment', {
    ...data,
    cvv: '***',
    cardNumber: data.cardNumber.slice(-4).padStart(data.cardNumber.length, '*'),
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const user = await AuthService.getUser();
  if (!user?.id) throw new Error('No hay sesion activa para completar el registro.');
  await OnboardingProgress.set(user.id, 'completed');
}