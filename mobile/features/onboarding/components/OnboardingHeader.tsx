import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StepIndicator } from './StepIndicator';
import { COLORS } from '@/constants/colors';

interface OnboardingHeaderProps {
  currentStep: number;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ currentStep }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>¡Bienvenido a NutriA! 👋</Text>
    <Text style={styles.headerSubtitle}>Completa tu perfil para comenzar</Text>
    <StepIndicator currentStep={currentStep} />
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
