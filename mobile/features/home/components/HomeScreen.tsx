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
import { CATEGORY_EMOJI, CATEGORY_LABEL } from '@/features/content/services/contentService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

function StatCard({
  emoji,
  value,
  unit,
  color,
}: {
  emoji: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </View>
  );
}

function ActionCard({
  emoji,
  title,
  subtitle,
  accentColor,
  badge,
  dot,
}: {
  emoji: string;
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
        <Text style={styles.actionEmoji}>{emoji}</Text>
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
      <Text style={styles.reminderBulb}>💡</Text>
      <View style={styles.reminderBody}>
        <Text style={styles.reminderTitle}>Recordatorio del día</Text>
        <Text style={styles.reminderText}>
          Registra tu peso y presión arterial antes del desayuno
        </Text>
      </View>
    </View>
  );
}

// ── FAB de Nutricionista ──────────────────────────────────────────────────────
function NutritionistFloatingButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.nutritionistFab}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.fabInner}>
        <MaterialCommunityIcons name="chat" size={28} color="#fff" />
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
      {/* ── Green Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>
            Hola, Juan <Text>👋</Text>
          </Text>
          <Text style={styles.headerSub}>¿Cómo te sientes hoy?</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats Card ── */}
      <View style={styles.statsCardWrapper}>
        <View style={styles.statsCard}>
          <StatCard emoji="⚖️" value="72.5" unit="kg" color="#555" />
          <View style={styles.statDivider} />
          <StatCard emoji="❤️" value="120/80" unit="mmHg" color="#e53935" />
          <View style={styles.statDivider} />
          <StatCard emoji="💧" value="1.5" unit="L hoy" color="#1e88e5" />
          <View style={styles.statDivider} />
          <StatCard emoji="🔥" value="1,450" unit="kcal" color="#fb8c00" />
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
            emoji="🩺"
            title="Registrar la presión"
            subtitle="Ver menú de hoy"
            accentColor={COLORS.primary}
          />
          <ActionCard
            emoji="📅"
            title="Mis Citas"
            subtitle="Próxima: 15 Nov"
            accentColor="#fb8c00"
            badge={2}
          />
        </View>

        {/* ── Recursos Educativos ── */}
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
                <Text style={styles.resourceIcon}>{CATEGORY_EMOJI[item.category] ?? '📖'}</Text>
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

        {/* Bottom spacing for tab bar + FABs */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <NutritionistFloatingButton onPress={() => {}} />
      <AIFloatingButton
        onPress={() => {}}
        style={{ bottom: 100, right: 90 }}
      />

      {/* ── Bottom Tab Bar ── */}
      <BottomTabBar activeTab="inicio" />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_GAP = 12;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },

  // ── Header ──
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
    color: '#fff',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: { fontSize: 18 },

  // ── Stats Card (overlapping header) ──
  statsCardWrapper: {
    paddingHorizontal: 16,
    marginTop: -36,
    marginBottom: 4,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#000',
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
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statUnit: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
  },

  // ── Scroll ──
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  // ── Section Title ──
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 14,
  },

  // ── Action Cards Grid ──
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: 18,
  },
  actionCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
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
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  actionEmoji: { fontSize: 22 },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
    marginBottom: 3,
    lineHeight: 18,
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#999',
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
    color: '#fff',
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

  // ── PDF Row ──
  pdfRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  pdfIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  pdfIcon: { fontSize: 20 },
  pdfText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  pdfArrow: {
    fontSize: 20,
    color: '#ccc',
  },

  // ── Reminder ──
  reminderCard: {
    backgroundColor: '#fffde7',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#fdd835',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 22,
  },
  reminderBulb: {
    fontSize: 22,
    marginRight: 12,
    marginTop: 2,
  },
  reminderBody: { flex: 1 },
  reminderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f57f17',
    marginBottom: 4,
  },
  reminderText: {
    fontSize: 12,
    color: '#795548',
    lineHeight: 18,
  },

  // ── Section header row ──
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
    color: '#aaa',
  },

  // ── Resource Row ──
  resourceRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
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
  resourceIcon: { fontSize: 24 },
  resourceBody: { flex: 1 },
  resourceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
    marginBottom: 3,
  },
  resourceSubtitle: {
    fontSize: 11,
    color: '#999',
    lineHeight: 16,
  },
  resourceArrow: {
    fontSize: 20,
    color: '#ccc',
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