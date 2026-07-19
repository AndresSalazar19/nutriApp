import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface ChatHeaderProps {
  title: string;
  subtitle: string;
  avatarIcon?: string;
  onBack: () => void;
  onMenuPress?: () => void;
}

export function ChatHeader({
  title,
  subtitle,
  avatarIcon = 'account',
  onBack,
  onMenuPress,
}: ChatHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.textOnPrimary} />
      </TouchableOpacity>

      <View style={styles.avatar}>
        <MaterialCommunityIcons name={avatarIcon as any} size={22} color={COLORS.primary} />
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.iconBtn} onPress={onMenuPress}>
        <MaterialCommunityIcons name="dots-vertical" size={22} color={COLORS.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textOnPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.overlayMedium,
  },
});