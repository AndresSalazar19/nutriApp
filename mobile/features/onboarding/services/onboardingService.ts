import { HealthData, PaymentData } from '../types';

/**
 * Submit health profile data to the backend.
 * Replace with real API call when backend is ready.
 */
export async function submitHealthProfile(data: HealthData): Promise<void> {
  // TODO: POST /api/onboarding/health
  console.log('[onboardingService] submitHealthProfile', data);
  await new Promise((resolve) => setTimeout(resolve, 300));
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
