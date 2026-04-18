// ─── Types ────────────────────────────────────────────────────────────────────

export interface TimePoint {
  date: string;
  value: number;
}

export interface MacroData {
  name: string;
  consumed: number;
  goal: number;
  color: string;
  goalColor: string;
}

export interface CorrelationCard {
  label: string;
  value: number;
  description: string;
  positive: boolean;
}

export interface WeeklyActivity {
  week: string;
  days: number;
  goal: number;
}

export interface ReportPatient {
  id: string;
  name: string;
  initials: string;
  color: string;
}

// ─── Mock patients for selector ───────────────────────────────────────────────

export const REPORT_PATIENTS: ReportPatient[] = [
  { id: '0012', name: 'María Rodríguez', initials: 'MR', color: 'bg-green-500'  },
  { id: '0023', name: 'Jorge Gutiérrez', initials: 'JG', color: 'bg-blue-500'   },
  { id: '0034', name: 'Lucía Castro',    initials: 'LC', color: 'bg-orange-400' },
  { id: '0041', name: 'Ana Pérez',       initials: 'AP', color: 'bg-purple-500' },
  { id: '0055', name: 'Roberto Morales', initials: 'RM', color: 'bg-teal-500'   },
];

// ─── Mock data per patient ────────────────────────────────────────────────────

export interface ReportData {
  weightLost:        number;
  weightLostPct:     number;
  bloodPressureSys:  number;
  bloodPressureDia:  number;
  bloodPressureNote: string;
  adherence:         number;
  adherenceChange:   number;
  activityDays:      number;
  activityGoal:      number;
  activityNote:      string;
  weightHistory:     TimePoint[];
  systolicHistory:   TimePoint[];
  diastolicHistory:  TimePoint[];
  macros:            MacroData[];
  correlations:      CorrelationCard[];
  weeklyActivity:    WeeklyActivity[];
}

export const MOCK_REPORTS: Record<string, ReportData> = {
  '0012': {
    weightLost: 5.2,        weightLostPct: 6.8,
    bloodPressureSys: 118,  bloodPressureDia: 76, bloodPressureNote: 'Dentro del rango normal',
    adherence: 87,           adherenceChange: 5,
    activityDays: 4.2,       activityGoal: 5,     activityNote: 'Estable',
    weightHistory: [
      { date: '15 Oct', value: 76.5 }, { date: '01 Nov', value: 75.8 },
      { date: '15 Nov', value: 74.9 }, { date: '01 Dic', value: 74.1 },
      { date: '15 Dic', value: 73.5 }, { date: '01 Ene', value: 72.8 },
      { date: '15 Ene', value: 71.3 },
    ],
    systolicHistory: [
      { date: '15 Oct', value: 130 }, { date: '01 Nov', value: 128 },
      { date: '15 Nov', value: 126 }, { date: '01 Dic', value: 124 },
      { date: '15 Dic', value: 122 }, { date: '01 Ene', value: 120 },
      { date: '15 Ene', value: 118 },
    ],
    diastolicHistory: [
      { date: '15 Oct', value: 84 }, { date: '01 Nov', value: 83 },
      { date: '15 Nov', value: 82 }, { date: '01 Dic', value: 80 },
      { date: '15 Dic', value: 79 }, { date: '01 Ene', value: 77 },
      { date: '15 Ene', value: 76 },
    ],
    macros: [
      { name: 'Proteínas',     consumed: 142, goal: 150, color: '#ef4444', goalColor: '#fca5a5' },
      { name: 'Carbohidratos', consumed: 168, goal: 175, color: '#14b8a6', goalColor: '#99f6e4' },
      { name: 'Grasas',        consumed: 58,  goal: 60,  color: '#f59e0b', goalColor: '#fde68a' },
    ],
    correlations: [
      { label: 'Sodio ↔ Presión Arterial', value: -0.72, description: 'Correlación negativa fuerte\n↓ Reducción de sodio efectiva', positive: true  },
      { label: 'Ejercicio ↔ Peso',         value: -0.68, description: 'Correlación negativa fuerte\n↓ Actividad física efectiva',  positive: true  },
      { label: 'Adherencia ↔ Resultados',  value: +0.84, description: 'Correlación positiva muy fuerte\n↑ Alta adherencia = mejores resultados', positive: true },
    ],
    weeklyActivity: [
      { week: 'Sem 1', days: 3, goal: 5 },
      { week: 'Sem 2', days: 4, goal: 5 },
      { week: 'Sem 3', days: 5, goal: 5 },
      { week: 'Sem 4', days: 4, goal: 5 },
    ],
  },
  '0023': {
    weightLost: 2.2,        weightLostPct: 2.4,
    bloodPressureSys: 135,  bloodPressureDia: 85, bloodPressureNote: 'Levemente elevado',
    adherence: 74,           adherenceChange: -2,
    activityDays: 2.8,       activityGoal: 4,     activityNote: '↓ Bajó',
    weightHistory: [
      { date: '15 Oct', value: 91.2 }, { date: '01 Nov', value: 90.8 },
      { date: '15 Nov', value: 90.5 }, { date: '01 Dic', value: 90.2 },
      { date: '15 Dic', value: 89.8 }, { date: '01 Ene', value: 89.5 },
      { date: '15 Ene', value: 89.0 },
    ],
    systolicHistory: [
      { date: '15 Oct', value: 140 }, { date: '01 Nov', value: 139 },
      { date: '15 Nov', value: 138 }, { date: '01 Dic', value: 137 },
      { date: '15 Dic', value: 136 }, { date: '01 Ene', value: 136 },
      { date: '15 Ene', value: 135 },
    ],
    diastolicHistory: [
      { date: '15 Oct', value: 90 }, { date: '01 Nov', value: 89 },
      { date: '15 Nov', value: 88 }, { date: '01 Dic', value: 87 },
      { date: '15 Dic', value: 86 }, { date: '01 Ene', value: 86 },
      { date: '15 Ene', value: 85 },
    ],
    macros: [
      { name: 'Proteínas',     consumed: 98,  goal: 130, color: '#ef4444', goalColor: '#fca5a5' },
      { name: 'Carbohidratos', consumed: 210, goal: 180, color: '#14b8a6', goalColor: '#99f6e4' },
      { name: 'Grasas',        consumed: 72,  goal: 55,  color: '#f59e0b', goalColor: '#fde68a' },
    ],
    correlations: [
      { label: 'Sodio ↔ Presión Arterial', value: -0.45, description: 'Correlación moderada\nMejorar adherencia al sodio', positive: false },
      { label: 'Ejercicio ↔ Peso',         value: -0.38, description: 'Correlación débil\nAumentar frecuencia de ejercicio',  positive: false },
      { label: 'Adherencia ↔ Resultados',  value: +0.61, description: 'Correlación positiva moderada\nMejorar cumplimiento del plan', positive: true },
    ],
    weeklyActivity: [
      { week: 'Sem 1', days: 2, goal: 4 },
      { week: 'Sem 2', days: 3, goal: 4 },
      { week: 'Sem 3', days: 2, goal: 4 },
      { week: 'Sem 4', days: 4, goal: 4 },
    ],
  },
};

// Fallback for patients without specific data
export function getReportData(patientId: string): ReportData {
  return MOCK_REPORTS[patientId] ?? MOCK_REPORTS['0012'];
}

export const RANGE_OPTIONS = ['Últimos 3 meses', 'Últimos 6 meses', 'Último año'] as const;
export type RangeOption = typeof RANGE_OPTIONS[number];
