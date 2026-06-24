import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PeriodSelector from './PeriodSelector';
import { COLORS } from '@/constants/colors';

type Period = 'Semana' | 'Mes' | 'Año' | 'Todo';

interface ProgressHeaderProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
}

export default function ProgressHeader({ selectedPeriod, onPeriodChange }: ProgressHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mi Progreso</Text>
      </View>

      {/* Pasamos el estado de la pantalla principal directamente al selector */}
      <PeriodSelector selected={selectedPeriod} onSelect={onPeriodChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
});