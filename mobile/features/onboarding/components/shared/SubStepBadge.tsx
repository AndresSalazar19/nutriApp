import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

const SUB_STEPS = ['Salud básica', 'Antecedentes', 'Historia alimentaria'];

/** Los 3 pasos del wizard de "Perfil Médico" (health/history/dietary)
 *  comparten el macro-paso 1 en el StepIndicator de arriba, así que esta
 *  barra secundaria es la única señal de en qué sub-paso está el usuario. */
export function SubStepBadge({ step }: { step: 1 | 2 | 3 }) {
  return (
    <View style={styles.wrap}>
      {SUB_STEPS.map((label, index) => {
        const n = index + 1;
        const active = n === step;
        const done = n < step;
        return (
          <View key={label} style={styles.item}>
            <View style={[styles.dot, (active || done) && styles.dotActive]} />
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {label}
            </Text>
            {index < SUB_STEPS.length - 1 && <View style={[styles.line, done && styles.lineActive]} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 },
  item: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D8D8D8', marginRight: 5 },
  dotActive: { backgroundColor: COLORS.primary },
  label: { fontSize: 11, color: '#999', fontWeight: '500', marginRight: 6 },
  labelActive: { color: COLORS.primary, fontWeight: '700' },
  line: { width: 16, height: 1.5, backgroundColor: '#E0E0E0', marginRight: 6 },
  lineActive: { backgroundColor: COLORS.primary },
});
