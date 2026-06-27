import { HealthData, PaymentData } from '../types';
import { AuthService } from '@/features/auth/services/authService';
import { ProgressService } from '@/features/progress/services/progressService';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
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
}

/**
 * Submit selected subscription plan.
 * Replace with real API call when backend is ready.
 */
export async function submitPlanSelection(planId: string): Promise<void> {
  // TODO: POST /api/onboarding/plan
  console.log('[onboardingService] submitPlanSelection', planId);
  await new Promise((resolve) => setTimeout(resolve, 200));
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
}
