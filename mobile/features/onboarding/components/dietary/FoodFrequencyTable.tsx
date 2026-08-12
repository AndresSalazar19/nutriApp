import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FOOD_FREQUENCY_OPTIONS, FOOD_ITEM_LABELS } from '../../constants';
import { FoodFrequencyData, FoodItem, FoodFrequencyValue, FOOD_ITEMS } from '../../types';
import { FieldLabel, FieldError } from '../shared/FormField';

const FOOD_ICONS: Record<FoodItem, keyof typeof MaterialCommunityIcons.glyphMap> = {
  fruits: 'food-apple-outline',
  vegetables: 'carrot',
  dairy: 'cup-outline',
  meat: 'food-steak',
  coldCuts: 'food-hot-dog',
  fastFood: 'hamburger',
  sweets: 'cupcake',
  snacks: 'popcorn',
  coffee: 'coffee-outline',
  energyDrinks: 'bottle-soda-outline',
};

interface FoodFrequencyTableProps {
  value: FoodFrequencyData;
  onChange: (item: FoodItem, value: FoodFrequencyValue) => void;
  error?: string | null;
}

/** Tabla de frecuencia de consumo del cuestionario en formato "tarjeta por
 *  alimento" en vez de tabla con checkboxes -- mucho más usable en pantalla
 *  angosta que la grilla original del formulario en papel. */
export const FoodFrequencyTable: React.FC<FoodFrequencyTableProps> = ({ value, onChange, error }) => (
  <View style={styles.wrap}>
    <FieldLabel text="Frecuencia de consumo de alimentos" />
    <Text style={styles.hint}>Marca qué tan seguido consumes cada uno</Text>
    {FOOD_ITEMS.map((item) => (
      <View key={item} style={styles.row}>
        <View style={styles.rowHeader}>
          <MaterialCommunityIcons name={FOOD_ICONS[item]} size={18} color={COLORS.primary} />
          <Text style={styles.rowLabel}>{FOOD_ITEM_LABELS[item]}</Text>
        </View>
        <View style={styles.options}>
          {FOOD_FREQUENCY_OPTIONS.map((opt) => {
            const selected = value[item] === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.pill, selected && styles.pillSelected]}
                onPress={() => onChange(item, opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    ))}
    <FieldError message={error} />
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginTop: 8, marginBottom: 4 },
  hint: { fontSize: 12, color: '#888', marginBottom: 12, marginTop: -4 },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EEE',
    padding: 12,
    marginBottom: 10,
  },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  rowLabel: { fontSize: 14, fontWeight: '700', color: '#333' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#FAFAFA',
  },
  pillSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  pillText: { fontSize: 11.5, color: '#666', fontWeight: '500' },
  pillTextSelected: { color: COLORS.primaryDark, fontWeight: '700' },
});
