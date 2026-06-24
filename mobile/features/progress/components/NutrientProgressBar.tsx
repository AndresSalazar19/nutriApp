import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Radius } from '@/constants/theme';

interface NutrientProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

export default function NutrientProgressBar({
  label,
  current,
  target,
  unit,
  color,
}: NutrientProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <View style={styles.nutrientRow}>
      <View style={styles.nutrientMeta}>
        <Text style={styles.nutrientLabel}>{label}</Text>
        <Text style={styles.nutrientValues}>
          {current}/{target} {unit}
        </Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nutrientRow: { width: '100%' },
  nutrientMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  nutrientLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  nutrientValues: { fontSize: 12, color: COLORS.textSecondary },
  barBackground: {
    height: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: Radius.full },
});
