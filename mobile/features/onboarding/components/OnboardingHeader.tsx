import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StepIndicator } from './StepIndicator';
import { AuthService } from '@/features/auth/services/authService';
import { COLORS } from '@/constants/colors';

interface OnboardingHeaderProps {
  currentStep: number;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ currentStep }) => {
  const router = useRouter();

  // El wizard de onboarding no tenía ninguna salida: si el usuario se quedó
  // a mitad de camino (o simplemente quiere entrar con otra cuenta), quedaba
  // atrapado porque index.tsx siempre lo re-redirige al paso pendiente. Este
  // botón cierra sesión desde cualquier paso y manda a login/registro.
  const handleLogout = () => {
    const doLogout = async () => {
      await AuthService.logout();
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Cerrar sesión? Tu progreso ya guardado no se pierde.')) {
        void doLogout();
      }
      return;
    }

    Alert.alert(
      'Cerrar sesión',
      'Tu progreso ya guardado no se pierde, podrás continuar la próxima vez que inicies sesión.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => void doLogout() },
      ]
    );
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
        <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>¡Bienvenido a NutriA!</Text>
      <Text style={styles.headerSubtitle}>Completa tu perfil para comenzar</Text>
      <StepIndicator currentStep={currentStep} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  logoutBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    zIndex: 1,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  headerSubtitle: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.9,
  },
});
