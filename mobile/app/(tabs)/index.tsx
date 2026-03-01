import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

// ─── Bottom Tab ───────────────────────────────────────────────────────────────
function TabItem({
  emoji,
  label,
  active,
}: {
  emoji: string;
  label: string;
  active?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
      <Text style={[styles.tabEmoji, active && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('inicio');

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
        {/* ── Acciones Rápidas ── */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

        <View style={styles.actionsGrid}>
          <ActionCard
            emoji="🥗"
            title="Mi Plan de Comidas"
            subtitle="Ver menú de hoy"
            accentColor="#4caf50"
          />
          <ActionCard
            emoji="📊"
            title="Diario de Progreso"
            subtitle="Registrar datos"
            accentColor="#1e88e5"
          />
          <ActionCard
            emoji="📅"
            title="Mis Citas"
            subtitle="Próxima: 15 Nov"
            accentColor="#fb8c00"
            badge={2}
          />
          <ActionCard
            emoji="💬"
            title="Chat con Nutricionista"
            subtitle=""
            accentColor="#8e24aa"
            dot
          />
        </View>

        {/* ── Obtener Reporte PDF ── */}
        <TouchableOpacity style={styles.pdfRow} activeOpacity={0.8}>
          <View style={styles.pdfIconWrap}>
            <Text style={styles.pdfIcon}>📄</Text>
          </View>
          <Text style={styles.pdfText}>Obtener reporte PDF</Text>
          <Text style={styles.pdfArrow}>›</Text>
        </TouchableOpacity>

        {/* ── Recordatorio del día ── */}
        <View style={styles.reminderCard}>
          <Text style={styles.reminderBulb}>💡</Text>
          <View style={styles.reminderBody}>
            <Text style={styles.reminderTitle}>Recordatorio del día</Text>
            <Text style={styles.reminderText}>
              Registra tu peso y presión arterial{'\n'}antes del desayuno
            </Text>
          </View>
        </View>

        {/* ── Recursos Educativos ── */}
        <Text style={styles.sectionTitle}>Recursos Educativos</Text>

        <TouchableOpacity style={styles.resourceRow} activeOpacity={0.8}>
          <View style={styles.resourceIconWrap}>
            <Text style={styles.resourceIcon}>📖</Text>
          </View>
          <View style={styles.resourceBody}>
            <Text style={styles.resourceTitle}>Alimentación para hipertensión</Text>
            <Text style={styles.resourceSubtitle}>
              Conoce los alimentos que te ayudan a controlar la presión arterial
            </Text>
          </View>
          <Text style={styles.resourceArrow}>›</Text>
        </TouchableOpacity>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <View style={styles.tabBar}>
        <TabItem emoji="🏠" label="Inicio" active />
        <TabItem emoji="🍽️" label="Comidas" />
        <TabItem emoji="📈" label="Progreso" />
        <TabItem emoji="👤" label="Perfil" />
      </View>
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
    backgroundColor: '#4caf50',
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
    backgroundColor: '#4caf50',
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
    backgroundColor: '#4caf50',
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
    backgroundColor: '#e8f5e9',
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
  },
  resourceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
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

  // ── Tab Bar ──
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
  tabEmoji: { fontSize: 22, opacity: 0.4 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#4caf50',
    fontWeight: '700',
  },
});
