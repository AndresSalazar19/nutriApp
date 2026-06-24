import { COLORS } from '@/constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

export function Checkbox({ checked, onPress, children }: CheckboxProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.box, checked && styles.boxActive]}>
        {checked && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
      </View>

      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  box: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  boxActive: {
    backgroundColor: COLORS.primary,
  },
});
