import { Plan, StepConfig } from './types';
import { COLORS } from '@/constants/colors';

export const ONBOARDING_STEPS: StepConfig[] = [
  { id: 1, label: 'Perfil\nMédico' },
  { id: 2, label: 'Plan' },
  { id: 3, label: 'Pago' },
  { id: 4, label: 'Listo', icon: '✓' },
];

export const ALLERGIES = ['Lácteos', 'Gluten', 'Mariscos', 'Soya', 'Huevos'];

export const PLANS: Plan[] = [
  {
    id: 'basic',
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
    name: 'Plan Estándar',
    price: '$34.99',
    period: '/mes',
    badge: '⭐ Más Popular',
    savingsText: 'Ahorra 30%',
    accentColor: '#F39C12',
    titleColor: '#F39C12',
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
    name: 'Plan Premium',
    price: '$49.99',
    period: '/mes',
    accentColor: '#9B59B6',
    titleColor: '#9B59B6',
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
