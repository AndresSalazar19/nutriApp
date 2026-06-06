import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';

export type TabKey = 'inicio' | 'comidas' | 'progreso' | 'recursos' | 'perfil';

const TABS: { key: TabKey; emoji: string; label: string; href: string }[] = [
  { key: 'inicio',   emoji: '🏠',  label: 'Inicio',    href: '/(tabs)/'         },
  { key: 'comidas',  emoji: '🍽️', label: 'Comidas',   href: '/(tabs)/'         },
  { key: 'progreso', emoji: '📈',  label: 'Progreso',  href: '/(tabs)/progress' },
  { key: 'recursos', emoji: '📚',  label: 'Recursos',  href: '/(tabs)/content'  },
  { key: 'perfil',   emoji: '👤',  label: 'Perfil',    href: '/(tabs)/profile'  },
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
          <Text style={[styles.tabEmoji, activeTab === tab.key && styles.tabEmojiActive]}>
            {tab.emoji}
          </Text>
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
  tabEmoji:       { fontSize: 20, opacity: 0.4 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: {
    fontSize: 10,
    color: '#aaa',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
