import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AllergyChip } from '../health/AllergyChip';
import { FieldLabel } from './FormField';

interface ChipMultiSelectProps {
  label: string;
  hint?: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  required?: boolean;
}

/** Selector de catálogo cerrado (checklist de opciones), reutilizando el
 *  chip visual de alergias. Estas listas nunca bloquean el avance: dejar
 *  todo sin marcar es una respuesta válida ("ninguno aplica"). */
export const ChipMultiSelect: React.FC<ChipMultiSelectProps> = ({
  label,
  hint,
  options,
  selected,
  onToggle,
  required = false,
}) => (
  <View style={styles.wrap}>
    <FieldLabel text={label} required={required} />
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    <View style={styles.chips}>
      {options.map((option) => (
        <AllergyChip
          key={option}
          label={option}
          selected={selected.includes(option)}
          onPress={() => onToggle(option)}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  hint: { fontSize: 12, color: '#888', marginBottom: 8, marginTop: -4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
