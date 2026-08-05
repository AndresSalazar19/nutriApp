import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { MealType, NutritionPlan, NutritionPlanMeal, NutritionPlanStatus } from '../services/nutritionPlanService';

export interface MealTypeConfig {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  time: string;
}

// Order matters: this is the display order for each day's meals.
export const MEAL_TYPE_ORDER: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];

export const MEAL_TYPE_CONFIG: Record<MealType, MealTypeConfig> = {
  breakfast: { label: 'Desayuno', icon: 'weather-sunset-up', time: 'Mañana' },
  lunch: { label: 'Almuerzo', icon: 'white-balance-sunny', time: 'Mediodía' },
  snack: { label: 'Merienda', icon: 'coffee-outline', time: 'Tarde' },
  dinner: { label: 'Cena', icon: 'weather-night', time: 'Noche' },
};

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export const STATUS_CONFIG: Record<NutritionPlanStatus, StatusConfig> = {
  pending: {
    label: 'En revisión',
    color: COLORS.warning,
    bg: COLORS.warningLight,
    icon: 'clock-outline',
  },
  approved: {
    label: 'Aprobado',
    color: COLORS.success,
    bg: COLORS.primaryLight,
    icon: 'check-decagram',
  },
  rejected: {
    label: 'Rechazado',
    color: COLORS.error,
    bg: COLORS.errorLight,
    icon: 'close-circle-outline',
  },
};

const DAY_LABELS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_LABELS_LONG = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',
];
const MONTH_LABELS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** JS Date.getDay() is 0=Sunday..6=Saturday; the API's day_of_week is 1=Monday..7=Sunday. */
export function isoWeekday(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function parseISODate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export interface PlanWeekDay {
  date: Date;
  isoWeekday: number;
  dayLabel: string;
  dayNumber: number;
  isToday: boolean;
}

/** Builds the 7 calendar days between a plan's start_date and end_date. */
export function buildWeekDays(startDate: string | null, endDate: string | null): PlanWeekDay[] {
  if (!startDate) return [];
  const start = parseISODate(startDate);
  const end = endDate ? parseISODate(endDate) : new Date(start.getTime() + 6 * 86400000);
  const today = new Date();

  const days: PlanWeekDay[] = [];
  const cursor = new Date(start);
  while (cursor <= end && days.length < 7) {
    days.push({
      date: new Date(cursor),
      isoWeekday: isoWeekday(cursor),
      dayLabel: DAY_LABELS_SHORT[isoWeekday(cursor) - 1],
      dayNumber: cursor.getDate(),
      isToday: sameDay(cursor, today),
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function formatFullDate(date: Date): string {
  return `${DAY_LABELS_LONG[isoWeekday(date) - 1]} ${date.getDate()} de ${MONTH_LABELS[date.getMonth()]}`;
}

export function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate || !endDate) return '';
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = `${start.getDate()}`;
  const endLabel = sameMonth
    ? `${end.getDate()} de ${MONTH_LABELS[end.getMonth()]}`
    : `${end.getDate()} de ${MONTH_LABELS[end.getMonth()]}`;
  return `${startLabel} - ${endLabel}`;
}

/** Groups a day's meals by meal_type, preserving MEAL_TYPE_ORDER; each group can hold several foods. */
export function groupMealsByType(
  meals: NutritionPlanMeal[],
  dayIsoWeekday: number
): { type: MealType; meals: NutritionPlanMeal[] }[] {
  const dayMeals = meals.filter(m => m.day_of_week === dayIsoWeekday);
  return MEAL_TYPE_ORDER
    .map(type => ({ type, meals: dayMeals.filter(m => m.meal_type === type) }))
    .filter(group => group.meals.length > 0);
}

export function mealFoodLabel(meal: NutritionPlanMeal): string {
  return meal.food_name || meal.custom_food || 'Alimento';
}

export function formatQuantity(meal: NutritionPlanMeal): string | null {
  if (meal.quantity_g == null) return null;
  return `${Math.round(meal.quantity_g)} g`;
}

/** The plan currently in effect (approved + active), if any. */
export function findActivePlan(plans: NutritionPlan[]): NutritionPlan | null {
  return plans.find(p => p.is_active) ?? null;
}

/** The most recent plan still awaiting nutritionist review. */
export function findPendingPlan(plans: NutritionPlan[]): NutritionPlan | null {
  return plans.find(p => p.status === 'pending') ?? null;
}
