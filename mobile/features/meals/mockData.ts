import { DayPlan } from './types';

export const MOCK_MEAL_PLANS: DayPlan[] = [
  {
    id: '1',
    dayLabel: 'Lun',
    dayNumber: 23,
    dateLabel: 'Lunes 23 de Junio',
    isToday: true,
    status: 'approved',
    totalCalories: 1100,
    nutritionistNote: 'Buen balance de macronutrientes. Mantén la hidratación con al menos 2L de agua.',
    meals: [
      {
        type: 'desayuno', time: '07:30', totalCalories: 380,
        items: [
          { name: 'Avena con leche descremada', portion: '1 taza', calories: 180 },
          { name: 'Banana', portion: '1 unidad', calories: 105 },
          { name: 'Almendras', portion: '10 uds', calories: 70 },
          { name: 'Té verde sin azúcar', portion: '1 taza', calories: 25 },
        ],
      },
      {
        type: 'almuerzo', time: '12:30', totalCalories: 520,
        items: [
          { name: 'Pechuga de pollo a la plancha', portion: '150g', calories: 230 },
          { name: 'Arroz integral', portion: '3/4 taza', calories: 160 },
          { name: 'Ensalada mixta con limón', portion: '1 plato', calories: 45 },
          { name: 'Aguacate', portion: '1/4 ud', calories: 85 },
        ],
      },
      {
        type: 'merienda', time: '16:00', totalCalories: 200,
        items: [
          { name: 'Yogurt natural sin azúcar', portion: '1 vaso', calories: 100 },
          { name: 'Fresas', portion: '1 taza', calories: 50 },
          { name: 'Granola baja en azúcar', portion: '2 cdas', calories: 50 },
        ],
      },
    ],
  },
  {
    id: '2',
    dayLabel: 'Mar',
    dayNumber: 24,
    dateLabel: 'Martes 24 de Junio',
    isToday: false,
    status: 'approved',
    totalCalories: 1020,
    meals: [
      {
        type: 'desayuno', time: '07:30', totalCalories: 350,
        items: [
          { name: 'Tostada integral con aguacate', portion: '2 reb.', calories: 220 },
          { name: 'Huevo cocido', portion: '1 unidad', calories: 78 },
          { name: 'Jugo de naranja natural', portion: '1 vaso', calories: 52 },
        ],
      },
      {
        type: 'almuerzo', time: '12:30', totalCalories: 490,
        items: [
          { name: 'Filete de tilapia', portion: '150g', calories: 190 },
          { name: 'Menestra de lenteja', portion: '1 taza', calories: 180 },
          { name: 'Ensalada de tomate y pepino', portion: '1 plato', calories: 40 },
          { name: 'Maduro al horno', portion: '1/2 ud', calories: 80 },
        ],
      },
      {
        type: 'merienda', time: '16:00', totalCalories: 180,
        items: [
          { name: 'Manzana verde', portion: '1 unidad', calories: 80 },
          { name: 'Mantequilla de maní', portion: '1 cda', calories: 100 },
        ],
      },
    ],
  },
  {
    id: '3',
    dayLabel: 'Mié',
    dayNumber: 25,
    dateLabel: 'Miércoles 25 de Junio',
    isToday: false,
    status: 'pending_review',
    totalCalories: 1040,
    meals: [
      {
        type: 'desayuno', time: '07:30', totalCalories: 370,
        items: [
          { name: 'Smoothie verde', portion: '1 vaso', calories: 200 },
          { name: 'Pan integral con queso fresco', portion: '1 reb.', calories: 170 },
        ],
      },
      {
        type: 'almuerzo', time: '12:30', totalCalories: 510,
        items: [
          { name: 'Carne molida magra', portion: '120g', calories: 220 },
          { name: 'Arroz integral', portion: '3/4 taza', calories: 160 },
          { name: 'Ensalada cesar ligera', portion: '1 plato', calories: 130 },
        ],
      },
      {
        type: 'merienda', time: '16:00', totalCalories: 160,
        items: [
          { name: 'Mix de frutos secos', portion: '30g', calories: 160 },
        ],
      },
    ],
  },
  {
    id: '4',
    dayLabel: 'Jue',
    dayNumber: 26,
    dateLabel: 'Jueves 26 de Junio',
    isToday: false,
    status: 'pending_review',
    totalCalories: 1080,
    meals: [
      {
        type: 'desayuno', time: '07:30', totalCalories: 360,
        items: [
          { name: 'Pancakes de avena', portion: '3 uds', calories: 240 },
          { name: 'Miel', portion: '1 cda', calories: 60 },
          { name: 'Café con leche', portion: '1 taza', calories: 60 },
        ],
      },
      {
        type: 'almuerzo', time: '12:30', totalCalories: 500,
        items: [
          { name: 'Pollo al horno con hierbas', portion: '150g', calories: 250 },
          { name: 'Papa cocida', portion: '1 ud', calories: 130 },
          { name: 'Ensalada de rúcula', portion: '1 plato', calories: 40 },
          { name: 'Agua de limón', portion: '1 vaso', calories: 10 },
        ],
      },
      {
        type: 'merienda', time: '16:00', totalCalories: 220,
        items: [
          { name: 'Batido de proteína', portion: '1 vaso', calories: 150 },
          { name: 'Galletas integrales', portion: '3 uds', calories: 70 },
        ],
      },
    ],
  },
  {
    id: '5',
    dayLabel: 'Vie',
    dayNumber: 27,
    dateLabel: 'Viernes 27 de Junio',
    isToday: false,
    status: 'ai_generated',
    totalCalories: 1060,
    meals: [
      {
        type: 'desayuno', time: '07:30', totalCalories: 340,
        items: [
          { name: 'Wrap integral con huevo', portion: '1 ud', calories: 260 },
          { name: 'Té de manzanilla', portion: '1 taza', calories: 5 },
          { name: 'Kiwi', portion: '1 unidad', calories: 75 },
        ],
      },
      {
        type: 'almuerzo', time: '12:30', totalCalories: 480,
        items: [
          { name: 'Salmón al horno', portion: '120g', calories: 250 },
          { name: 'Quinoa', portion: '1/2 taza', calories: 110 },
          { name: 'Vegetales al vapor', portion: '1 taza', calories: 80 },
          { name: 'Limón', portion: 'al gusto', calories: 5 },
        ],
      },
      {
        type: 'merienda', time: '16:00', totalCalories: 240,
        items: [
          { name: 'Yogurt griego', portion: '1 vaso', calories: 130 },
          { name: 'Arándanos', portion: '1/2 taza', calories: 40 },
          { name: 'Semillas de chía', portion: '1 cda', calories: 70 },
        ],
      },
    ],
  },
  {
    id: '6',
    dayLabel: 'Sáb',
    dayNumber: 28,
    dateLabel: 'Sábado 28 de Junio',
    isToday: false,
    status: 'ai_generated',
    totalCalories: 1120,
    meals: [
      {
        type: 'desayuno', time: '08:30', totalCalories: 400,
        items: [
          { name: 'Huevos revueltos con espinaca', portion: '2 uds', calories: 200 },
          { name: 'Pan integral tostado', portion: '2 reb.', calories: 140 },
          { name: 'Jugo verde', portion: '1 vaso', calories: 60 },
        ],
      },
      {
        type: 'almuerzo', time: '13:00', totalCalories: 530,
        items: [
          { name: 'Lomo de res a la plancha', portion: '130g', calories: 260 },
          { name: 'Arroz con vegetales', portion: '1 taza', calories: 190 },
          { name: 'Ensalada fresca', portion: '1 plato', calories: 50 },
        ],
      },
      {
        type: 'merienda', time: '16:30', totalCalories: 190,
        items: [
          { name: 'Smoothie de fresa y banana', portion: '1 vaso', calories: 190 },
        ],
      },
    ],
  },
  {
    id: '7',
    dayLabel: 'Dom',
    dayNumber: 29,
    dateLabel: 'Domingo 29 de Junio',
    isToday: false,
    status: 'ai_generated',
    totalCalories: 1050,
    meals: [
      {
        type: 'desayuno', time: '09:00', totalCalories: 380,
        items: [
          { name: 'Açaí bowl', portion: '1 porción', calories: 280 },
          { name: 'Granola', portion: '2 cdas', calories: 60 },
          { name: 'Infusión de jengibre', portion: '1 taza', calories: 10 },
        ],
      },
      {
        type: 'almuerzo', time: '13:00', totalCalories: 470,
        items: [
          { name: 'Pechuga de pollo desmenuzada', portion: '140g', calories: 220 },
          { name: 'Pasta integral', portion: '1 taza', calories: 180 },
          { name: 'Salsa de tomate casera', portion: '3 cdas', calories: 35 },
        ],
      },
      {
        type: 'merienda', time: '16:00', totalCalories: 200,
        items: [
          { name: 'Tostadas de arroz', portion: '4 uds', calories: 100 },
          { name: 'Hummus', portion: '2 cdas', calories: 70 },
          { name: 'Pepino en rodajas', portion: '1/2 ud', calories: 8 },
        ],
      },
    ],
  },
];
