import React from 'react';
import {
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingHeader } from '../OnboardingHeader';
import { PlanCard } from './PlanCard';
import { usePlanSelection } from '../../hooks/usePlanSelection';
import { submitPlanSelection } from '../../services/onboardingService';
import { PLANS } from '../../constants';
import { COLORS } from '@/constants/colors';

export default function PlansScreen() {
  const router = useRouter();
  const { selectedPlanId, selectPlan } = usePlanSelection('standard');

  const handleContinue = async () => {
    await submitPlanSelection(selectedPlanId);
    router.push({
      pathname: '/(onboarding)/payment',
      params: { planId: selectedPlanId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <OnboardingHeader currentStep={2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={selectedPlanId === plan.id}
            onSelect={selectPlan}
          />
        ))}

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Continuar con este plan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
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
  continueButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
