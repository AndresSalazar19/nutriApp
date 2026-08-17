import { useCallback, useMemo, useState } from 'react';
import { DietaryHistoryData, FoodFrequencyData, FoodItem, FoodFrequencyValue, FOOD_ITEMS } from '../types';

export type DietaryField =
  | 'skipsMeals'
  | 'eatsOutFrequently'
  | 'eatsFromEmotions'
  | 'frequentCravings'
  | 'drinksSugaryBeverages'
  | 'drinksAlcohol'
  | 'smokes'
  | 'foodFrequency';

export type DietaryFieldErrors = Partial<Record<DietaryField, string>>;

const REQUIRED_MESSAGE = 'Responde Sí o No para continuar.';

const EMPTY_FOOD_FREQUENCY: FoodFrequencyData = FOOD_ITEMS.reduce((acc, item) => {
  acc[item] = null;
  return acc;
}, {} as FoodFrequencyData);

function validate(values: DietaryHistoryData): DietaryFieldErrors {
  const errors: DietaryFieldErrors = {};
  const REQUIRED_BOOLEANS: Exclude<DietaryField, 'foodFrequency'>[] = [
    'skipsMeals',
    'eatsOutFrequently',
    'eatsFromEmotions',
    'frequentCravings',
    'drinksSugaryBeverages',
    'drinksAlcohol',
    'smokes',
  ];
  REQUIRED_BOOLEANS.forEach((field) => {
    if (values[field] === null) errors[field] = REQUIRED_MESSAGE;
  });

  const missingFrequency = FOOD_ITEMS.some((item) => values.foodFrequency[item] === null);
  if (missingFrequency) {
    errors.foodFrequency = 'Selecciona la frecuencia de todos los alimentos.';
  }

  return errors;
}

export function useDietaryForm() {
  const [mealsPerDay, setMealsPerDay] = useState('');
  const [skipsMeals, setSkipsMeals] = useState<boolean | null>(null);
  const [mealPreparer, setMealPreparer] = useState('');
  const [eatsOutFrequently, setEatsOutFrequently] = useState<boolean | null>(null);
  const [appetite, setAppetite] = useState('');
  const [eatsFromEmotions, setEatsFromEmotions] = useState<boolean | null>(null);
  const [frequentCravings, setFrequentCravings] = useState<boolean | null>(null);
  const [waterGlassesPerDay, setWaterGlassesPerDay] = useState('');
  const [drinksSugaryBeverages, setDrinksSugaryBeverages] = useState<boolean | null>(null);
  const [drinksAlcohol, setDrinksAlcohol] = useState<boolean | null>(null);
  const [smokes, setSmokes] = useState<boolean | null>(null);
  const [foodFrequency, setFoodFrequency] = useState<FoodFrequencyData>(EMPTY_FOOD_FREQUENCY);
  const [errors, setErrors] = useState<DietaryFieldErrors>({});

  const setFoodFrequencyItem = (item: FoodItem, value: FoodFrequencyValue) => {
    setFoodFrequency((prev) => ({ ...prev, [item]: value }));
  };

  const getData = useCallback(
    (): DietaryHistoryData => ({
      mealsPerDay,
      skipsMeals,
      mealPreparer,
      eatsOutFrequently,
      appetite,
      eatsFromEmotions,
      frequentCravings,
      waterGlassesPerDay,
      drinksSugaryBeverages,
      drinksAlcohol,
      smokes,
      foodFrequency,
    }),
    [
      mealsPerDay, skipsMeals, mealPreparer, eatsOutFrequently, appetite,
      eatsFromEmotions, frequentCravings, waterGlassesPerDay,
      drinksSugaryBeverages, drinksAlcohol, smokes, foodFrequency,
    ]
  );

  const validateAll = useCallback(() => {
    const next = validate(getData());
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [getData]);

  const isValid = useMemo(() => Object.keys(validate(getData())).length === 0, [getData]);

  return {
    mealsPerDay, setMealsPerDay,
    skipsMeals, setSkipsMeals,
    mealPreparer, setMealPreparer,
    eatsOutFrequently, setEatsOutFrequently,
    appetite, setAppetite,
    eatsFromEmotions, setEatsFromEmotions,
    frequentCravings, setFrequentCravings,
    waterGlassesPerDay, setWaterGlassesPerDay,
    drinksSugaryBeverages, setDrinksSugaryBeverages,
    drinksAlcohol, setDrinksAlcohol,
    smokes, setSmokes,
    foodFrequency, setFoodFrequencyItem,
    errors,
    isValid,
    validateAll,
    getData,
  };
}
