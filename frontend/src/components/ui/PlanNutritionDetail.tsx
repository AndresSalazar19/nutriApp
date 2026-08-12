import React from 'react';
import { NutritionPlanResponse } from '../../services/NutritionPlans/NutritionPlanService';
import {
  formatMacro,
  formatQuantity,
  groupMealsByDay,
  mealFoodLabel,
  MACRO_FIELDS,
  MACRO_LABELS,
  MACRO_UNITS,
  MEAL_TYPE_LABELS,
  MICRO_FIELDS,
} from '../../pages/MainView/planReviewHelpers';

function MacroStat({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold text-gray-800">{formatMacro(value, unit)}</p>
      <p className="text-[11px] text-gray-400">{label}</p>
    </div>
  );
}

/**
 * Macro/micro summary + meals-by-day breakdown for a nutrition plan. Shared
 * between the nutritionist's plan-review modal and the patient profile's
 * "Planes" tab so both show the exact same 14-metric table.
 */
export function PlanNutritionDetail({ plan }: { plan: NutritionPlanResponse }) {
  const dayGroups = groupMealsByDay(plan.meals);

  return (
    <div>
      {dayGroups.length > 0 && (
        <div className="bg-nutri-light/20 border border-nutri-light rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-nutri-dark uppercase mb-2">
            Promedio diario del plan
          </p>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Macronutrientes</p>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-3">
            {MACRO_FIELDS.map((field) => (
              <MacroStat
                key={field}
                label={MACRO_LABELS[field]}
                value={plan.nutrition_summary.daily_average[field]}
                unit={MACRO_UNITS[field]}
              />
            ))}
          </div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Micronutrientes</p>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {MICRO_FIELDS.map((field) => (
              <MacroStat
                key={field}
                label={MACRO_LABELS[field]}
                value={plan.nutrition_summary.daily_average[field]}
                unit={MACRO_UNITS[field]}
              />
            ))}
          </div>
          {plan.nutrition_summary.meals_missing_macro_data > 0 && (
            <p className="text-[11px] text-gray-400 mt-2">
              {plan.nutrition_summary.meals_missing_macro_data} comida
              {plan.nutrition_summary.meals_missing_macro_data !== 1 ? 's' : ''} sin datos
              nutricionales (alimento personalizado, no del catálogo) — no se incluyen en este
              promedio.
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {dayGroups.length === 0 && (
          <p className="text-sm text-gray-400">Este plan no tiene comidas registradas.</p>
        )}
        {dayGroups.map((group) => {
          const dayTotals = plan.nutrition_summary.by_day[String(group.day)];
          return (
            <div key={group.day}>
              <div className="flex items-baseline justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-800">{group.label}</h4>
                {dayTotals && (
                  <span className="text-xs text-gray-400">
                    {formatMacro(dayTotals.calories, '')} kcal · P{' '}
                    {formatMacro(dayTotals.protein_g, 'g')} · C{' '}
                    {formatMacro(dayTotals.carbs_g, 'g')} · G {formatMacro(dayTotals.fat_g, 'g')}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {group.meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-nutri-dark mr-2">
                        {MEAL_TYPE_LABELS[meal.meal_type]}
                      </span>
                      <span className="text-sm text-gray-700">{mealFoodLabel(meal)}</span>
                      {meal.instructions && (
                        <p className="text-xs text-gray-400">{meal.instructions}</p>
                      )}
                    </div>
                    {formatQuantity(meal) && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatQuantity(meal)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
