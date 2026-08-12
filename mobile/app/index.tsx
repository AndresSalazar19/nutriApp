import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useRouter } from 'expo-router';

import WelcomeScreen from '@/features/auth/components/WelcomeScreen';
import { AuthService } from '@/features/auth/services/authService';
import { OnboardingProgress } from '@/features/onboarding/services/onboardingProgress';
import { COLORS } from '@/constants/colors';

export default function IndexRoute() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    void Promise.all([AuthService.isAuthenticated(), AuthService.getUser()]).then(
      async ([isAuthenticated, user]) => {
        if (!mounted) return;

        if (isAuthenticated && user?.id) {
          // Guard de rol: si por algún motivo quedó guardada una sesión que
          // no es de paciente (p. ej. login previo a este guard), se limpia
          // en vez de dejar pasar directo a la app.
          if (!AuthService.isPatient(user)) {
            await AuthService.logout();
            if (!mounted) return;
            setCheckingSession(false);
            return;
          }

          const step = await OnboardingProgress.get(user.id);
          if (!mounted) return;

          if (step === 'health') router.replace('/(onboarding)/health');
          else if (step === 'plans') router.replace('/(onboarding)/plans');
          else if (step === 'payment') router.replace('/(onboarding)/payment');
          else {
            // Solo con sesión válida y onboarding completo. scheduleHealthReminders
            // es idempotente: cancela las anteriores antes de reprogramar.
            if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
              void import('@/services/notification-service').then(({ scheduleHealthReminders }) =>
                scheduleHealthReminders(),
              );
            }
            router.replace('/(tabs)');
          }
          return;
        }

        setCheckingSession(false);
      }
    );

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return <WelcomeScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
