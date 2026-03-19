import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface InfoRowProps {
  emoji: string;
  label: string;
  value: string;
  onPress?: () => void;
}

export function InfoRow({ emoji, label, value, onPress }: InfoRowProps) {
  return (
    <TouchableOpacity style={styles.infoRow} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.infoIconWrap}>
        <Text style={styles.infoEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoEmoji: { fontSize: 16 },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoValue: {
    fontSize: 13,
    color: '#888',
    marginRight: 8,
  },
  chevron: {
    fontSize: 20,
    color: '#ccc',
  },
});
