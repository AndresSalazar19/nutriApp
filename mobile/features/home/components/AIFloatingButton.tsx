import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AIFloatingButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

export function AIFloatingButton({ onPress, style }: AIFloatingButtonProps) {
  return (
    <TouchableOpacity style={[styles.fabContainer, style]} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.fabInner}>
        <MaterialCommunityIcons name="robot-happy" size={28} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  fabInner: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
