import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { scheduleHealthReminders } from '@/services/notification-service';
import { useSession } from '@/features/auth/hooks/useAuth';
import { COLORS } from '@/constants/colors';
import WelcomeScreen from '@/features/auth/components/WelcomeScreen';

export default function IndexRoute() {
  const { ready, authenticated } = useSession();

  useEffect(() => {
    scheduleHealthReminders();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (authenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <WelcomeScreen />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
});
