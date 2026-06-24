import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Radius, Shadows } from '@/constants/theme';

interface MetricToggleProps<T extends string> {
  options: T[];
  activeOption: T;
  onSelect: (option: T) => void;
}

export default function MetricToggle<T extends string>({
  options,
  activeOption,
  onSelect,
}: MetricToggleProps<T>) {
  return (
    <View style={styles.toggleContainer}>
      {options.map((option) => {
        const isActive = activeOption === option;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.toggleTab, isActive && styles.toggleTabActive]}
            onPress={() => onSelect(option)}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, isActive && styles.toggleTextActive]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: Radius.full,
    padding: 3,
  },
  toggleTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  toggleTabActive: { backgroundColor: COLORS.white, ...Shadows.sm },
  toggleText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  toggleTextActive: { color: COLORS.primary },
});
