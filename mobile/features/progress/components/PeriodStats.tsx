import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatTile from './StatTile';
import { COLORS } from '@/constants/colors';
import { Spacing, Typography } from '@/constants/theme';

type Period = 'Semana' | 'Mes' | 'Año' | 'Todo';

interface WeeklyStatsProps {
  period: Period; // Recibe el periodo actual de la pantalla principal
  hydration?: { value: string; unit?: string; subtitle: string };
  calories?: { value: string; subtitle: string };
  activity?: { value: string; unit?: string; subtitle: string };
  adherence?: { value: string; subtitle: string };
}

// Diccionario para cambiar el título según el periodo seleccionado
const TITLE_BY_PERIOD: Record<Period, string> = {
  Semana: 'Estadísticas Semanales',
  Mes: 'Estadísticas Mensuales',
  Año: 'Estadísticas Anuales',
  Todo: 'Estadísticas Históricas',
};

export default function PeriodStats({
  period,
  hydration = { value: '8.5', unit: 'L', subtitle: 'Promedio: 1.2L/día' },
  calories = { value: '10,500', subtitle: 'Promedio: 1,500/día' },
  activity = { value: '5', unit: 'días', subtitle: 'Meta: 30 min/día' },
  adherence = { value: '86', subtitle: '¡Muy bien!' },
}: WeeklyStatsProps) {
  return (
    <View style={styles.section}>
      {/* El título ahora cambia dinámicamente */}
      <Text style={styles.sectionTitle}>{TITLE_BY_PERIOD[period]}</Text>
      
      <View style={styles.grid}>
        <View style={styles.row}>
          <StatTile
            icon="water"
            iconColor="#4A90D9"
            iconBg="#E8EFF8"
            label="Hidratación"
            value={hydration.value}
            unit={hydration.unit}
            subtitle={hydration.subtitle}
          />
          <View style={styles.gap} />
          <StatTile
            icon="flame"
            iconColor="#FF9800"
            iconBg="#FFF3E0"
            label="Calorías"
            value={calories.value}
            subtitle={calories.subtitle}
          />
        </View>
        <View style={styles.rowGap} />
        <View style={styles.row}>
          <StatTile
            icon="body"
            iconColor="#9C6FD6"
            iconBg="#F3EEFB"
            label="Actividad"
            value={activity.value}
            unit={activity.unit}
            subtitle={activity.subtitle}
          />
          <View style={styles.gap} />
          <StatTile
            icon="checkmark-circle"
            iconColor={COLORS.primary}
            iconBg={COLORS.primaryLight}
            label="Adherencia"
            value={adherence.value + '%'}
            subtitle={adherence.subtitle}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  grid: {},
  row: {
    flexDirection: 'row',
  },
  gap: {
    width: Spacing.sm,
  },
  rowGap: {
    height: Spacing.sm,
  },
});