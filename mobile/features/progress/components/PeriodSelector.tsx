import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';

const PERIODS = ['Semana', 'Mes', 'Año', 'Todo'] as const;
type Period = (typeof PERIODS)[number];

interface PeriodSelectorProps {
  selected: Period; // Ahora es obligatorio
  onSelect: (period: Period) => void; // Ahora es obligatorio
}

export default function PeriodSelector({ selected, onSelect } : PeriodSelectorProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {PERIODS.map((period) => {
          const isActive = selected === period;
          return (
            <TouchableOpacity
              key={period}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onSelect(period)} // Dispara el cambio de estado global
              activeOpacity={0.7}
            >
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {period}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    backgroundColor: 'transparent', // Para que se vea el fondo verde
  },
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Botones inactivos semitransparentes
    borderRadius: Radius.full,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  tabActive: {
    backgroundColor: '#fff', // Barra blanca cuando está activo
  },
  label: {
    fontWeight: '600',
    color: '#fff',
  },
  labelActive: {
    color: COLORS.primary, // Texto verde dentro de la barra blanca
  },
});