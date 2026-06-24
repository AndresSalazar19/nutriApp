import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { BottomTabBar } from '@/components/ui/BottomTabBar';
import { AIFloatingButton } from './AIFloatingButton';
import { useContent } from '@/features/content/hooks/useContent';
import { CATEGORY_ICON, CATEGORY_LABEL } from '@/features/content/services/contentService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

function StatCard({
  icon,
  value,
  unit,
  iconColor,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: string;
  unit: string;
  iconColor: string;
}) {
  return (
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </View>
  );
}

function ActionCard({
  icon,
  title,
  subtitle,
  accentColor,
  badge,
  dot,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  accentColor: string;
  badge?: number;
  dot?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
      <View style={[styles.actionAccent, { backgroundColor: accentColor }]} />
      <View style={styles.actionIconWrap}>
        <MaterialCommunityIcons name={icon} size={24} color={accentColor} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>

      {badge !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {dot && <View style={styles.dot} />}
    </TouchableOpacity>
  );
}

function ReminderCard() {
  return (
    <View style={styles.reminderCard}>
      <MaterialCommunityIcons
        name="lightbulb-on-outline"
        size={22}
        color={COLORS.warning}
      />
      <View style={styles.reminderBody}>
        <Text style={styles.reminderTitle}>Recordatorio del día</Text>
        <Text style={styles.reminderText}>
          Registra tu peso y presión arterial antes del desayuno
        </Text>
      </View>
    </View>
  );
}

function NutritionistFloatingButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.nutritionistFab}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.fabInner}>
        <MaterialCommunityIcons name="chat" size={28} color={COLORS.textOnPrimary} />
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { items: contentItems, loading: contentLoading } = useContent();
  const previewItems = contentItems.slice(0, 3);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Hola, Juan</Text>
          <Text style={styles.headerSub}>¿Cómo te sientes hoy?</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={COLORS.textOnPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsCardWrapper}>
        <View style={styles.statsCard}>
          <StatCard icon="scale-bathroom" value="72.5" unit="kg" iconColor={COLORS.primaryMedium} />
          <View style={styles.statDivider} />
          <StatCard icon="heart-pulse" value="120/80" unit="mmHg" iconColor={COLORS.primaryMedium} />
          <View style={styles.statDivider} />
          <StatCard icon="water" value="1.5" unit="L hoy" iconColor={COLORS.primaryMedium} />
          <View style={styles.statDivider} />
          <StatCard icon="fire" value="1,450" unit="kcal" iconColor={COLORS.primaryMedium} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ReminderCard />

        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

        <View style={styles.actionsGrid}>
          <ActionCard
            icon="heart-pulse"
            title="Registrar Presión"
            subtitle="Registrar medición"
            accentColor={COLORS.primary}
          />
          <ActionCard
            icon="calendar-month"
            title="Mis Citas"
            subtitle="Próxima: 15 Nov"
            accentColor={COLORS.primaryMedium}
            badge={2}
          />
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recursos Educativos</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/content' as any)}>
            <Text style={styles.sectionLink}>Ver todos ›</Text>
          </TouchableOpacity>
        </View>

        {contentLoading ? (
          <View style={styles.resourceLoading}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : previewItems.length === 0 ? (
          <View style={styles.resourceEmpty}>
            <Text style={styles.resourceEmptyText}>No hay recursos disponibles aún.</Text>
          </View>
        ) : (
          previewItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.resourceRow}
              activeOpacity={0.8}
              onPress={() => router.push(`/(tabs)/content/${item.id}` as any)}
            >
              <View style={styles.resourceIconWrap}>
                <MaterialCommunityIcons
                  name={
                    (CATEGORY_ICON[item.category] as keyof typeof MaterialCommunityIcons.glyphMap)
                    ?? 'book-open-page-variant'
                  }
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.resourceBody}>
                <Text style={styles.resourceTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.resourceSubtitle}>
                  {CATEGORY_LABEL[item.category] ?? item.category}
                  {item.tags && item.tags.length > 0 ? ` · ${item.tags[0]}` : ''}
                </Text>
              </View>
              <Text style={styles.resourceArrow}>›</Text>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <NutritionistFloatingButton onPress={() => {}} />
      <AIFloatingButton
        onPress={() => {}}
        style={{ bottom: 100, right: 90 }}
      />

      <BottomTabBar activeTab="inicio" />
    </SafeAreaView>
  );
}

const CARD_GAP = 12;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 52,
  },
  headerGreeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textOnPrimary,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.overlayMedium,
    marginTop: 2,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsCardWrapper: {
    paddingHorizontal: 16,
    marginTop: -36,
    marginBottom: 4,
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.divider,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  reminderCard: {
    backgroundColor: COLORS.warningLight,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warningBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 20,
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  reminderBody: { flex: 1, marginLeft: 12 },
  reminderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.warning,
    marginBottom: 3,
  },
  reminderText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: 18,
  },
  actionCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  actionAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
    lineHeight: 18,
  },
  actionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.textOnPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  dot: {
    position: 'absolute',
    top: 14,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resourceLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  resourceEmpty: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  resourceEmptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  resourceRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  resourceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  resourceBody: { flex: 1 },
  resourceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  resourceSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  resourceArrow: {
    fontSize: 20,
    color: COLORS.border,
    marginLeft: 8,
  },

  nutritionistFab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
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
