import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type TabKey = 'inicio' | 'comidas' | 'progreso' | 'recursos' | 'perfil';

const TABS: {
  key: TabKey;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  href: string;
  }[] = [
  {
    key: 'inicio',
    icon: 'home-outline',
    label: 'Inicio',
    href: '/(tabs)/',
  },
  {
    key: 'comidas',
    icon: 'silverware-fork-knife',
    label: 'Comidas',
    href: '/(tabs)/',
  },
  {
    key: 'progreso',
    icon: 'chart-line',
    label: 'Progreso',
    href: '/(tabs)/progress',
  },
  {
    key: 'recursos',
    icon: 'book-open-page-variant-outline',
    label: 'Recursos',
    href: '/(tabs)/content',
  },
  {
    key: 'perfil',
    icon: 'account-outline',
    label: 'Perfil',
    href: '/(tabs)/profile',
  },
];

interface BottomTabBarProps {
  activeTab: TabKey;
}

export function BottomTabBar({ activeTab }: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => router.navigate(tab.href as any)}
        >
          <MaterialCommunityIcons
            name={tab.icon}
            size={22}
            color={
              activeTab === tab.key
                ? COLORS.primary
                : '#4caf50'
            }
          />
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 10,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    color: '#4caf50',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
