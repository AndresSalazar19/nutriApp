import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { FieldLabel, FieldError } from './FormField';

interface YesNoToggleProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  error?: string | null;
  style?: object;
}

/** Radio Sí/No obligatorio: `value === null` significa "sin responder" y no
 *  pinta ninguna opción como seleccionada (a diferencia de un switch, que
 *  siempre tiene un valor por defecto y podría avanzar sin que el usuario
 *  haya tocado nada). */
export const YesNoToggle: React.FC<YesNoToggleProps> = ({ label, value, onChange, error, style }) => (
  <View style={[styles.wrap, style]}>
    <FieldLabel text={label} />
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.option, value === true && styles.optionSelected]}
        onPress={() => onChange(true)}
        activeOpacity={0.7}
      >
        <View style={[styles.circle, value === true && styles.circleFilled]} />
        <Text style={[styles.optionText, value === true && styles.optionTextSelected]}>Sí</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, value === false && styles.optionSelected]}
        onPress={() => onChange(false)}
        activeOpacity={0.7}
      >
        <View style={[styles.circle, value === false && styles.circleFilled]} />
        <Text style={[styles.optionText, value === false && styles.optionTextSelected]}>No</Text>
      </TouchableOpacity>
    </View>
    <FieldError message={error} />
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    backgroundColor: '#fff',
  },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCC',
  },
  circleFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  optionText: { fontSize: 15, color: '#555', fontWeight: '500' },
  optionTextSelected: { color: COLORS.primary, fontWeight: '700' },
});
