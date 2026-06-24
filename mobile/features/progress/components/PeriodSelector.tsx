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
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.overlaySubtle, // Botones inactivos semitransparentes
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
    backgroundColor: COLORS.surface,
  },
  label: {
    fontWeight: '600',
    color: COLORS.textOnPrimary,
  },
  labelActive: {
    color: COLORS.primary, // Texto verde dentro de la barra blanca
  },
});