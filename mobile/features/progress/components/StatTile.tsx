import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Spacing, Radius, Typography, Shadows } from '@/constants/theme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface StatTileProps {
  icon: IconName;
  iconColor?: string;
  iconBg?: string;
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
}

export default function StatTile({
  icon,
  iconColor = COLORS.primary,
  iconBg = COLORS.primaryLight,
  label,
  value,
  unit,
  subtitle,
}: StatTileProps) {
  return (
    <View style={styles.tile}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
    minHeight: 110,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  unit: {
    ...Typography.bodySmall,
    color: COLORS.textMuted,
    marginBottom: 3,
    fontWeight: '500',
  },
  subtitle: {
    ...Typography.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
