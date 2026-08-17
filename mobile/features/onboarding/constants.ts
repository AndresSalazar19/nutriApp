import { ActivityLevel, FoodFrequencyValue, FoodItem } from './types';
import { Plan, StepConfig } from './types';
import { COLORS } from '@/constants/colors';

export const ONBOARDING_STEPS: StepConfig[] = [
  { id: 1, label: 'Perfil\nMédico' },
  { id: 2, label: 'Plan' },
  { id: 3, label: 'Pago' },
  { id: 4, label: 'Listo', icon: '4' },
];

export const ALLERGIES = ['Lácteos', 'Gluten', 'Mariscos', 'Soya', 'Huevos'];

// ─── Nivel de actividad laboral (paso "Salud") ─────────────────────────────
export const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; hint: string }[] = [
  { value: 'sedentario', label: 'Sedentario', hint: 'Trabajo de oficina, poco movimiento' },
  { value: 'moderado', label: 'Moderado', hint: 'De pie, caminas parte del día' },
  { value: 'pesado', label: 'Pesado', hint: 'Esfuerzo físico o carga constante' },
];

// ─── Antecedentes personales patológicos (paso "Antecedentes") ────────────
export const PATHOLOGICAL_CONDITIONS = [
  'Diabetes',
  'Hipertensión',
  'Dislipidemia',
  'Hipotiroidismo / Hipertiroidismo',
  'SOP',
  'Gastritis',
  'Colon irritable',
  'Enfermedad renal',
  'Hígado graso',
  'Trastornos alimentarios',
  'Otra',
];

export const DIGESTIVE_ISSUES: { key: 'constipation' | 'diarrhea' | 'reflux' | 'bloating' | 'nausea'; label: string }[] = [
  { key: 'constipation', label: 'Estreñimiento' },
  { key: 'diarrhea', label: 'Diarrea' },
  { key: 'reflux', label: 'Reflujo' },
  { key: 'bloating', label: 'Distensión abdominal' },
  { key: 'nausea', label: 'Náuseas' },
];

// ─── Antecedentes familiares ────────────────────────────────────────────────
export const FAMILY_HISTORY_ITEMS: {
  key: 'diabetes' | 'hypertension' | 'obesity' | 'cardiovascularDisease' | 'cancer' | 'kidneyDisease' | 'eatingDisorders';
  label: string;
}[] = [
  { key: 'diabetes', label: 'Diabetes' },
  { key: 'hypertension', label: 'Hipertensión' },
  { key: 'obesity', label: 'Obesidad' },
  { key: 'cardiovascularDisease', label: 'Enfermedad cardiovascular' },
  { key: 'cancer', label: 'Cáncer' },
  { key: 'kidneyDisease', label: 'Enfermedad renal' },
  { key: 'eatingDisorders', label: 'Trastornos alimentarios' },
];

// ─── Historia alimentaria: frecuencia de consumo ───────────────────────────
export const FOOD_FREQUENCY_OPTIONS: { value: FoodFrequencyValue; label: string }[] = [
  { value: 'daily', label: 'Diario' },
  { value: '3_5_week', label: '3–5 veces/semana' },
  { value: '1_2_week', label: '1–2 veces/semana' },
  { value: 'rare', label: 'Rara vez' },
  { value: 'never', label: 'Nunca' },
];

export const FOOD_ITEM_LABELS: Record<FoodItem, string> = {
  fruits: 'Frutas',
  vegetables: 'Verduras',
  dairy: 'Lácteos',
  meat: 'Carnes',
  coldCuts: 'Embutidos',
  fastFood: 'Comida rápida',
  sweets: 'Dulces/Postres',
  snacks: 'Snacks',
  coffee: 'Café',
  energyDrinks: 'Bebidas energéticas',
};

export const APPETITE_OPTIONS = ['Bueno', 'Regular', 'Poco'];
export const MEAL_PREPARER_OPTIONS = ['Yo mismo/a', 'Familiar', 'Empleada doméstica', 'Otro'];

export const PLANS: Plan[] = [
  {
    id: 'basic',
    code: 'basic',
    name: 'Plan Básico',
    price: '$19.99',
    period: '/mes',
    accentColor: COLORS.primary,
    titleColor: COLORS.primary,
    features: [
      'Consultas mensuales con nutricionista',
      'Plan de alimentación personalizado',
      'Seguimiento de progreso básico',
      'Acceso a biblioteca de contenido',
      'Soporte por mensajería',
    ],
  },
  {
    id: 'standard',
    code: 'standard',
    name: 'Plan Estándar',
    price: '$34.99',
    period: '/mes',
    badge: 'Más Popular',
    savingsText: 'Ahorra 30%',
    accentColor: COLORS.primaryMedium,
    titleColor: COLORS.primaryMedium,
    features: [
      'Todo en Básico, más:',
      'Consultas quincenales',
      'Ajustes de plan ilimitados',
      'Análisis nutricional detallado',
      'Recetas personalizadas semanales',
      'Recordatorios y notificaciones',
    ],
  },
  {
    id: 'premium',
    code: 'premium',
    name: 'Plan Premium',
    price: '$49.99',
    period: '/mes',
    accentColor: COLORS.primaryAccent,
    titleColor: COLORS.primaryAccent,
    features: [
      'Todo en Estándar, más:',
      'Consultas semanales',
      'Soporte prioritario 24/7',
      'Análisis de laboratorio incluidos',
      'Plan de ejercicio personalizado',
      'Sesiones de seguimiento grupales',
    ],
  },
];
