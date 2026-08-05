import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { BottomTabBar } from '@/components/ui/BottomTabBar';
import { GeneratePlanModal } from './GeneratePlanModal';
import {
  NutritionPlan,
  NutritionPlanMeal,
  NutritionPlanService,
} from '../services/nutritionPlanService';
import {
  MEAL_TYPE_CONFIG,
  PlanWeekDay,
  STATUS_CONFIG,
  buildWeekDays,
  findActivePlan,
  findPendingPlan,
  formatDateRange,
  formatFullDate,
  formatQuantity,
  groupMealsByType,
  mealFoodLabel,
} from '../utils/planHelpers';

function WeekStrip({
  days,
  selectedIndex,
  onSelect,
}: {
  days: PlanWeekDay[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <View style={styles.weekStrip}>
      {days.map((day, i) => {
        const isActive = selectedIndex === i;
        return (
          <TouchableOpacity
            key={i}
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

function StatusBanner({ plan }: { plan: NutritionPlan }) {
  const cfg = STATUS_CONFIG[plan.status];
  return (
    <View style={[styles.banner, { backgroundColor: cfg.bg, borderLeftColor: cfg.color }]}>
      <MaterialCommunityIcons name={cfg.icon} size={20} color={cfg.color} />
      <View style={styles.bannerBody}>
        <Text style={[styles.bannerTitle, { color: cfg.color }]}>{plan.title || 'Plan generado por IA'}</Text>
        {plan.status === 'pending' && (
          <Text style={styles.bannerText}>
            Tu nutricionista está revisando este plan. Te avisaremos cuando esté activo.
          </Text>
        )}
        {plan.status === 'rejected' && (
          <Text style={styles.bannerText}>
            {plan.rejection_reason
              ? `No se aprobó: ${plan.rejection_reason}`
              : 'Este plan no fue aprobado por tu nutricionista.'}
          </Text>
        )}
      </View>
    </View>
  );
}

function PantryPhotoCard({ plan }: { plan: NutritionPlan }) {
  const [showNote, setShowNote] = useState(false);
  const imageUrl = NutritionPlanService.imageUrl(plan.source_image_path);

  return (
    <View style={styles.pantryCard}>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.pantryImage} resizeMode="cover" />}
      <View style={styles.pantryBody}>
        <View style={styles.pantryHeaderRow}>
          <MaterialCommunityIcons name="robot-outline" size={16} color={COLORS.primaryMedium} />
          <Text style={styles.pantryTitle}>Generado por IA a partir de tu despensa</Text>
        </View>
        {!!plan.description && <Text style={styles.pantryDescription}>{plan.description}</Text>}

        {!!plan.patient_notes && (
          <TouchableOpacity onPress={() => setShowNote(v => !v)} activeOpacity={0.7}>
            <Text style={styles.pantryToggle}>
              {showNote ? 'Ocultar nota enviada' : 'Ver nota enviada'}
              {'  '}
              <MaterialCommunityIcons name={showNote ? 'chevron-up' : 'chevron-down'} size={12} />
            </Text>
          </TouchableOpacity>
        )}
        {showNote && !!plan.patient_notes && (
          <Text style={styles.pantryNote}>&ldquo;{plan.patient_notes}&rdquo;</Text>
        )}
      </View>
    </View>
  );
}

function MealCard({ type, meals }: { type: keyof typeof MEAL_TYPE_CONFIG; meals: NutritionPlanMeal[] }) {
  const cfg = MEAL_TYPE_CONFIG[type];
  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealIconWrap}>
          <MaterialCommunityIcons name={cfg.icon} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.mealHeaderText}>
          <Text style={styles.mealLabel}>{cfg.label}</Text>
          <Text style={styles.mealTime}>{cfg.time}</Text>
        </View>
      </View>

      <View style={styles.mealItems}>
        {meals.map((meal) => (
          <View key={meal.id} style={styles.mealItemRow}>
            <View style={styles.mealItemDot} />
            <View style={styles.mealItemBody}>
              <View style={styles.mealItemTopRow}>
                <Text style={styles.mealItemName} numberOfLines={2}>{mealFoodLabel(meal)}</Text>
                {!!formatQuantity(meal) && (
                  <Text style={styles.mealItemPortion}>{formatQuantity(meal)}</Text>
                )}
              </View>
              {!!meal.instructions && (
                <Text style={styles.mealItemInstructions}>{meal.instructions}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <MaterialCommunityIcons name="creation" size={40} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>Aún no tienes un plan alimenticio</Text>
      <Text style={styles.emptyText}>
        Toma una foto de lo que tienes en casa y cuéntanos qué alimentos tienes disponibles.
        Nuestra IA generará un plan semanal según tu perfil médico, y tu nutricionista lo revisará
        antes de activarlo.
      </Text>
      <TouchableOpacity style={styles.emptyBtn} activeOpacity={0.85} onPress={onGenerate}>
        <MaterialCommunityIcons name="creation" size={20} color={COLORS.textOnPrimary} />
        <Text style={styles.emptyBtnText}>Generar mi primer plan con IA</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function MealsScreen() {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const hasLoadedRef = useRef(false);

  const load = useCallback(async (opts: { silent?: boolean } = {}) => {
    if (!opts.silent) setLoading(true);
    setLoadError(null);
    try {
      const data = await NutritionPlanService.listMine();
      setPlans(data);
      hasLoadedRef.current = true;
    } catch (error: any) {
      setLoadError(error?.message ?? 'No se pudieron cargar tus planes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Silent (no full-screen spinner) once we've already loaded data at least once.
      void load({ silent: hasLoadedRef.current });
    }, [load])
  );

  function handleRefresh() {
    setRefreshing(true);
    void load({ silent: true });
  }

  function handleGenerated(plan: NutritionPlan) {
    setPlans(prev => [plan, ...prev]);
  }

  const activePlan = findActivePlan(plans);
  const pendingPlan = findPendingPlan(plans);
  const latestPlan = plans[0] ?? null;
  const showRejectedBanner = !activePlan && !pendingPlan && latestPlan?.status === 'rejected';

  const weekDays = activePlan ? buildWeekDays(activePlan.start_date, activePlan.end_date) : [];
  const today = weekDays.findIndex(d => d.isToday);
  const dayIndex = Math.min(selectedDay, Math.max(weekDays.length - 1, 0));
  const selectedWeekDay = weekDays[dayIndex] ?? weekDays[Math.max(today, 0)];
  const mealGroups =
    activePlan && selectedWeekDay
      ? groupMealsByType(activePlan.meals, selectedWeekDay.isoWeekday)
      : [];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Mi Plan Alimenticio</Text>
            <Text style={styles.headerSub}>
              {activePlan
                ? `Semana del ${formatDateRange(activePlan.start_date, activePlan.end_date)}`
                : 'Generado por IA, revisado por tu nutricionista'}
            </Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8} onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="calendar-plus" size={22} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
        </View>

        {activePlan && weekDays.length > 0 && (
          <WeekStrip days={weekDays} selectedIndex={dayIndex} onSelect={setSelectedDay} />
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : loadError ? (
          <View style={styles.errorWrap}>
            <MaterialCommunityIcons name="wifi-off" size={32} color={COLORS.textMuted} />
            <Text style={styles.errorText}>{loadError}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {pendingPlan && <StatusBanner plan={pendingPlan} />}
            {showRejectedBanner && latestPlan && <StatusBanner plan={latestPlan} />}

            {activePlan ? (
              <>
                <PantryPhotoCard plan={activePlan} />

                {selectedWeekDay && (
                  <Text style={styles.dayHeading}>{formatFullDate(selectedWeekDay.date)}</Text>
                )}

                {mealGroups.length > 0 ? (
                  mealGroups.map(group => (
                    <MealCard key={group.type} type={group.type} meals={group.meals} />
                  ))
                ) : (
                  <View style={styles.noMealsCard}>
                    <MaterialCommunityIcons name="silverware-clean" size={22} color={COLORS.textMuted} />
                    <Text style={styles.noMealsText}>No hay comidas registradas para este día.</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.generateBtn} activeOpacity={0.85} onPress={() => setModalVisible(true)}>
                  <MaterialCommunityIcons name="creation" size={20} color={COLORS.textOnPrimary} />
                  <Text style={styles.generateBtnText}>Generar nuevo plan semanal</Text>
                </TouchableOpacity>
              </>
            ) : (
              <EmptyState onGenerate={() => setModalVisible(true)} />
            )}
          </>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      <GeneratePlanModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onGenerated={handleGenerated}
      />

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
    gap: 12,
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
    flex: 1,
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

  loadingWrap: { paddingVertical: 60, alignItems: 'center' },
  errorWrap: { paddingVertical: 40, alignItems: 'center', gap: 10 },
  errorText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: 20 },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
  },
  retryBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  // ── Status banner ──
  banner: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    gap: 10,
  },
  bannerBody: { flex: 1 },
  bannerTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  bannerText: { fontSize: 12.5, color: COLORS.textSecondary, lineHeight: 18 },

  // ── Pantry photo card ──
  pantryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  pantryImage: {
    width: '100%',
    height: 160,
  },
  pantryBody: { padding: 14 },
  pantryHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  pantryTitle: { fontSize: 12, fontWeight: '700', color: COLORS.primaryMedium },
  pantryDescription: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 6 },
  pantryToggle: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  pantryNote: { fontSize: 12.5, color: COLORS.textMuted, fontStyle: 'italic', marginTop: 6, lineHeight: 18 },

  dayHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    textTransform: 'capitalize',
  },

  noMealsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  noMealsText: { fontSize: 13, color: COLORS.textMuted },

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
  mealItems: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  mealItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mealItemDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primaryAccent,
    marginRight: 10,
    marginTop: 6,
  },
  mealItemBody: { flex: 1 },
  mealItemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  mealItemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  mealItemPortion: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  mealItemInstructions: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 12,
  },
  emptyIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
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
