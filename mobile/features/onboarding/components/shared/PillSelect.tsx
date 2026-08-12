import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { FieldLabel } from './FormField';

interface PillSelectProps {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
}

/** Selección única con pills, para preguntas abiertas de opción corta
 *  (¿quién prepara los alimentos?, ¿cómo describirías tu apetito?). */
export const PillSelect: React.FC<PillSelectProps> = ({ label, options, value, onChange, required = false }) => (
  <View style={styles.wrap}>
    <FieldLabel text={label} required={required} />
    <View style={styles.pills}>
      {options.map((option) => {
        const selected = value === option;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.pill, selected && styles.pillSelected]}
            onPress={() => onChange(option)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#fff',
  },
  pillSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  pillText: { fontSize: 13, color: '#555', fontWeight: '500' },
  pillTextSelected: { color: COLORS.primary, fontWeight: '700' },
});
