import { MealType, NutritionPlanMeal } from '../../services/NutritionPlans/NutritionPlanService';

export const MEAL_TYPE_ORDER: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  snack: 'Merienda',
  dinner: 'Cena',
};

export const DAY_LABELS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

export function groupMealsByDay(
  meals: NutritionPlanMeal[],
): { day: number; label: string; meals: NutritionPlanMeal[] }[] {
  const days = Array.from({ length: 7 }, (_, i) => i + 1);
  return days
    .map((day) => ({
      day,
      label: DAY_LABELS[day],
      meals: meals
        .filter((m) => m.day_of_week === day)
        .sort((a, b) => MEAL_TYPE_ORDER.indexOf(a.meal_type) - MEAL_TYPE_ORDER.indexOf(b.meal_type)),
    }))
    .filter((group) => group.meals.length > 0);
}

export function mealFoodLabel(meal: NutritionPlanMeal): string {
  return meal.food_name || meal.custom_food || 'Alimento';
}

export function formatQuantity(meal: NutritionPlanMeal): string | null {
  if (meal.quantity_g == null) return null;
  return `${Math.round(meal.quantity_g)} g`;
}

export function formatDate(value: string | null): string {
  if (!value) return '';
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatMacro(value: number | null, unit: string): string {
  if (value == null) return '—';
  return `${Math.round(value)}${unit}`;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0]}${parts[1][0]}`;
}
