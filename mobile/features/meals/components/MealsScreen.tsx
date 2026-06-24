import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { BottomTabBar } from '@/components/ui/BottomTabBar';
import { MOCK_MEAL_PLANS } from '../mockData';
import { DayPlan, Meal } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_CELL_SIZE = (SCREEN_WIDTH - 32 - 48) / 7;

const MEAL_CONFIG: Record<Meal['type'], { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  desayuno: { label: 'Desayuno', icon: 'weather-sunset-up' },
  almuerzo: { label: 'Almuerzo', icon: 'white-balance-sunny' },
  merienda: { label: 'Merienda', icon: 'coffee-outline' },
};

function WeekStrip({
  days,
  selectedIndex,
  onSelect,
}: {
  days: DayPlan[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <View style={styles.weekStrip}>
      {days.map((day, i) => {
        const isActive = selectedIndex === i;
        return (
          <TouchableOpacity
            key={day.id}
            onPress={() => onSelect(i)}
            style={[styles.dayCell, isActive && styles.dayCellActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayCellLabel, isActive && styles.dayCellLabelActive]}>
              {day.dayLabel}
            </Text>
            <View style={[styles.dayCellNumberWrap, isActive && styles.dayCellNumberWrapActive]}>
              <Text style={[styles.dayCellNumber, isActive && styles.dayCellNumberActive]}>
                {day.dayNumber}
              </Text>
            </View>
            {day.isToday && <View style={[styles.todayDot, isActive && styles.todayDotActive]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function CalorieSummary({ plan }: { plan: DayPlan }) {
  const pct = Math.min(Math.round((plan.totalCalories / 1500) * 100), 100);
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTop}>
        <View>
          <Text style={styles.summaryDateLabel}>{plan.dateLabel}</Text>
          <View style={styles.summaryCalRow}>
            <Text style={styles.summaryCalValue}>{plan.totalCalories}</Text>
            <Text style={styles.summaryCalUnit}> / 1,500 kcal</Text>
          </View>
        </View>
        <View style={styles.summaryPctWrap}>
          <Text style={styles.summaryPct}>{pct}%</Text>
        </View>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
      </View>
      <View style={styles.summaryMetrics}>
        <View style={styles.metricItem}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={16} color={COLORS.primaryMedium} />
          <Text style={styles.metricText}>{plan.meals.length} comidas</Text>
        </View>
        <View style={styles.metricItem}>
          <MaterialCommunityIcons name="fire" size={16} color={COLORS.primaryMedium} />
          <Text style={styles.metricText}>{plan.totalCalories} kcal</Text>
        </View>
        <View style={styles.metricItem}>
          <MaterialCommunityIcons name="target" size={16} color={COLORS.primaryMedium} />
          <Text style={styles.metricText}>Meta 1,500</Text>
        </View>
      </View>
    </View>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  const cfg = MEAL_CONFIG[meal.type];
  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealIconWrap}>
          <MaterialCommunityIcons name={cfg.icon} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.mealHeaderText}>
          <Text style={styles.mealLabel}>{cfg.label}</Text>
          <Text style={styles.mealTime}>{meal.time}</Text>
        </View>
        <View style={styles.mealCalsBadge}>
          <Text style={styles.mealCalsText}>{meal.totalCalories} kcal</Text>
        </View>
      </View>

      <View style={styles.mealItems}>
        {meal.items.map((item, i) => (
          <View key={i} style={styles.mealItemRow}>
            <View style={styles.mealItemDot} />
            <Text style={styles.mealItemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.mealItemPortion}>{item.portion}</Text>
            <Text style={styles.mealItemCals}>{item.calories}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function NutritionistNote({ note }: { note: string }) {
  return (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <MaterialCommunityIcons name="stethoscope" size={18} color={COLORS.primary} />
        <Text style={styles.noteTitle}>Observaciones del nutricionista</Text>
      </View>
      <Text style={styles.noteText}>{note}</Text>
    </View>
  );
}

export default function MealsScreen() {
  const todayIndex = MOCK_MEAL_PLANS.findIndex(d => d.isToday);
  const [selectedDay, setSelectedDay] = useState(todayIndex >= 0 ? todayIndex : 0);
  const plan = MOCK_MEAL_PLANS[selectedDay];
  const scrollRef = useRef<ScrollView>(null);

  function handleGenerate() {
    Alert.alert(
      'Generar plan semanal',
      'Se generará un nuevo plan alimenticio para la próxima semana basado en tu perfil.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Generar', onPress: () => {} },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Mi Plan Alimenticio</Text>
            <Text style={styles.headerSub}>Semana del 23 - 29 de Junio</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8} onPress={handleGenerate}>
            <MaterialCommunityIcons name="calendar-plus" size={22} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
        </View>

        {/* Week strip */}
        <WeekStrip
          days={MOCK_MEAL_PLANS}
          selectedIndex={selectedDay}
          onSelect={setSelectedDay}
        />
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CalorieSummary plan={plan} />

        {plan.meals.map((meal, i) => (
          <MealCard key={i} meal={meal} />
        ))}

        {plan.nutritionistNote && (
          <NutritionistNote note={plan.nutritionistNote} />
        )}

        {/* Generate button */}
        <TouchableOpacity style={styles.generateBtn} activeOpacity={0.85} onPress={handleGenerate}>
          <MaterialCommunityIcons name="creation" size={20} color={COLORS.textOnPrimary} />
          <Text style={styles.generateBtnText}>Generar plan semanal</Text>
        </TouchableOpacity>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="comidas" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  // ── Header ──
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textOnPrimary },
  headerSub: { fontSize: 12, color: COLORS.overlayMedium, marginTop: 2 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Week strip ──
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 4,
  },
  dayCell: {
    width: DAY_CELL_SIZE,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 14,
  },
  dayCellActive: {
    backgroundColor: COLORS.overlay,
  },
  dayCellLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.overlayMedium,
    marginBottom: 6,
  },
  dayCellLabelActive: {
    color: COLORS.textOnPrimary,
  },
  dayCellNumberWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellNumberWrapActive: {
    backgroundColor: COLORS.surface,
  },
  dayCellNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.overlayMedium,
  },
  dayCellNumberActive: {
    color: COLORS.primary,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primaryAccent,
    marginTop: 4,
  },
  todayDotActive: {
    backgroundColor: COLORS.surface,
  },

  // ── Scroll ──
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  // ── Summary ──
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryDateLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  summaryCalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  summaryCalValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  summaryCalUnit: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 3,
  },
  summaryPctWrap: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  summaryPct: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.divider,
    borderRadius: 3,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: COLORS.primaryAccent,
    borderRadius: 3,
  },
  summaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // ── Meal card ──
  mealCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  mealIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mealHeaderText: { flex: 1 },
  mealLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  mealTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  mealCalsBadge: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  mealCalsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryMedium,
  },
  mealItems: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  mealItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealItemDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primaryAccent,
    marginRight: 10,
  },
  mealItemName: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  mealItemPortion: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginRight: 12,
    minWidth: 55,
    textAlign: 'right',
  },
  mealItemCals: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    minWidth: 30,
    textAlign: 'right',
  },

  // ── Nutritionist note ──
  noteCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  noteText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // ── Generate button ──
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
});
