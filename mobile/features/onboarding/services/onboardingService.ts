import { HealthData, PaymentData } from '../types';
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