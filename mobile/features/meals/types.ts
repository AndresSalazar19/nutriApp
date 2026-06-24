export type PlanStatus = 'ai_generated' | 'pending_review' | 'approved';

export interface MealItem {
  name: string;
  portion: string;
  calories: number;
}

export interface Meal {
  type: 'desayuno' | 'almuerzo' | 'merienda';
  time: string;
  items: MealItem[];
  totalCalories: number;
}

export interface DayPlan {
  id: string;
  dayLabel: string;
  dayNumber: number;
  dateLabel: string;
  isToday: boolean;
  status: PlanStatus;
  meals: Meal[];
  totalCalories: number;
  nutritionistNote?: string;
}
