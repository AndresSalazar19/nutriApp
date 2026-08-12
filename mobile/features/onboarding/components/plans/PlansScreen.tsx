import React, { useState } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingHeader } from '../OnboardingHeader';
import { PlanCard } from './PlanCard';
import { usePlanSelection } from '../../hooks/usePlanSelection';
import { submitPlanSelection } from '../../services/onboardingService';
import { COLORS } from '@/constants/colors';

export default function PlansScreen() {
  const router = useRouter();
  const { plans, loading, error, selectedPlanId, selectedPlan, selectPlan } =
    usePlanSelection('standard');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleContinue = async () => {
    setSubmitError(null);

    // Antes esto retornaba en silencio si no había `selectedPlan.code`,
    // por lo que un plan mal formado (sin `code`) hacía que el botón no
    // hiciera absolutamente nada, sin ningún rastro en consola. Ahora se
    // avisa explícitamente para poder diagnosticarlo.
    if (!selectedPlan) {
      console.warn('[PlansScreen] handleContinue: no hay selectedPlan (selectedPlanId=', selectedPlanId, ')');
      setSubmitError('No se ha seleccionado ningún plan. Selecciona una tarjeta e intenta de nuevo.');
      return;
    }
    if (!selectedPlan.code) {
      console.warn('[PlansScreen] handleContinue: selectedPlan sin `code`:', selectedPlan);
      setSubmitError('El plan seleccionado no tiene un código válido. Revisa constants.ts (falta `code`).');
      return;
    }

    console.log('[PlansScreen] handleContinue: enviando plan', selectedPlan.code);

    try {
      setSubmitting(true);
      // Se envia el CODE ('basic' | 'standard' | 'premium'), no el uuid del plan.
      const subscription = await submitPlanSelection(selectedPlan.code);
      console.log('[PlansScreen] suscripción creada:', subscription);
      router.push({
        pathname: '/(onboarding)/payment',
        params: {
          planId: selectedPlan.id,
          // Guardamos el id de la suscripcion creada: lo va a necesitar el
          // paso de pago para insertar el registro en `payments` (subscription_id).
          subscriptionId: subscription.id,
        },
      });
    } catch (err: any) {
      console.error('[PlansScreen] error al enviar plan:', err);
      setSubmitError(err?.message ?? 'No se pudo guardar el plan. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <OnboardingHeader currentStep={2} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlanId === plan.id}
              onSelect={selectPlan}
            />
          ))}

          {submitError && <Text style={styles.errorText}>{submitError}</Text>}

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!selectedPlan || submitting) && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={!selectedPlan || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>Continuar con este plan</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 13, color: '#B00020', textAlign: 'center', marginBottom: 8 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 14 },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonDisabled: { opacity: 0.6 },
  continueButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});