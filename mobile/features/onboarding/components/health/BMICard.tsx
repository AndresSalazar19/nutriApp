import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface BMICardProps {
  weight: string;
  height: string;
}

export const BMICard: React.FC<BMICardProps> = ({ weight, height }) => {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const bmi = w > 0 && h > 0 ? (w / (h * h)).toFixed(1) : '--';
  const bmiNum = parseFloat(bmi);

  let label = '';
  if (!isNaN(bmiNum)) {
    if (bmiNum < 18.5) label = 'Bajo peso';
    else if (bmiNum < 25) label = 'Normal';
    else if (bmiNum < 30) label = 'Sobrepeso';
    else label = 'Obesidad';
  }

  return (
    <View style={styles.bmiCard}>
      <MaterialCommunityIcons name="chart-bar" size={28} color={COLORS.primary} />
      <View>
        <Text style={styles.bmiTitle}>Tu IMC (Índice de Masa Corporal)</Text>
        <Text style={styles.bmiValue}>
          {bmi} - <Text style={styles.bmiLabel}>{label}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bmiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginVertical: 14,
    gap: 12,
  },
  bmiIcon: { fontSize: 28 },
  bmiTitle: { fontSize: 12, color: '#555' },
  bmiValue: { fontSize: 17, fontWeight: '700', color: COLORS.primaryDark, marginTop: 2 },
  bmiLabel: { color: COLORS.primaryDark },
});
