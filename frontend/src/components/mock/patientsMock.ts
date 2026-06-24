// ─── Types ────────────────────────────────────────────────────────────────────

export type PatientStatus = 'active' | 'inactive' | 'pending';
export type PlanType = 'Premium' | 'Basic';
export type ConsultType = 'Presencial' | 'Virtual';

export interface WeightEntry {
  date: string;
  value: number;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: ConsultType;
  notes?: string;
}

export interface NutritionalPlan {
  id: string;
  name: string;
  startDate: string;
  calories: number;
  sodium: number;
  compliance: number;
}

export interface Patient {
  id: string;
  initials: string;
  color: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'Masculino' | 'Femenino';
  email: string;
  phone: string;
  status: PatientStatus;
  plan: PlanType;
  adherence: number;
  lastConsult: string;
  nextAppointment: string;
  // Medical info
  diagnosis: string;
  additionalConditions: string[];
  allergies: string;
  // Anthropometric
  weight: number; // kg
  weightGoal: number; // kg
  height: number; // m
  bmi: number;
  waist: number; // cm
  hip: number; // cm
  fatPercent: number; // %
  weightChange: number; // kg (negative = lost)
  // History
  weightHistory: WeightEntry[];
  appointments: Appointment[];
  nutritionalPlan: NutritionalPlan;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_PATIENTS: Patient[] = [
  {
    id: '0012',
    initials: 'MR',
    color: 'bg-green-500',
    firstName: 'María',
    lastName: 'Rodríguez',
    age: 45,
    gender: 'Femenino',
    email: 'maria.r@email.com',
    phone: '+593 99 123 4567',
    status: 'active',
    plan: 'Premium',
    adherence: 92,
    lastConsult: 'Hoy, 10:00 AM',
    nextAppointment: '15 Nov, 3:00 PM',
    diagnosis: 'Hipertensión arterial (Grado II)',
    additionalConditions: ['Sobrepeso (IMC: 28.5)', 'Colesterol elevado'],
    allergies: 'Intolerancia a la lactosa',
    weight: 72.5,
    weightGoal: 70,
    height: 1.6,
    bmi: 28.5,
    waist: 89,
    hip: 102,
    fatPercent: 32,
    weightChange: -2.3,
    weightHistory: [
      { date: '15 Oct', value: 76.5 },
      { date: '01 Nov', value: 75.8 },
      { date: '15 Nov', value: 74.9 },
      { date: '01 Dic', value: 74.1 },
      { date: '15 Dic', value: 73.5 },
      { date: '01 Ene', value: 72.8 },
      { date: '15 Ene', value: 71.3 },
    ],
    appointments: [
      { id: 'a1', date: 'Hoy', time: '10:00 AM', type: 'Presencial', notes: 'Control mensual' },
      { id: 'a2', date: '15 Nov', time: '3:00 PM', type: 'Virtual', notes: 'Revisión de plan' },
    ],
    nutritionalPlan: {
      id: 'p1',
      name: 'Plan Hiposódico - Octubre 2025',
      startDate: '1 de octubre de 2025',
      calories: 1800,
      sodium: 2000,
      compliance: 92,
    },
  },
  {
    id: '0023',
    initials: 'JG',
    color: 'bg-blue-500',
    firstName: 'Jorge',
    lastName: 'Gutiérrez',
    age: 38,
    gender: 'Masculino',
    email: 'jorge.g@email.com',
    phone: '+593 98 765 4321',
    status: 'active',
    plan: 'Basic',
    adherence: 74,
    lastConsult: 'Ayer, 3:30 PM',
    nextAppointment: '20 Nov, 9:00 AM',
    diagnosis: 'Diabetes tipo 2',
    additionalConditions: ['Obesidad (IMC: 31.2)'],
    allergies: 'Ninguna',
    weight: 89,
    weightGoal: 80,
    height: 1.69,
    bmi: 31.2,
    waist: 98,
    hip: 108,
    fatPercent: 28,
    weightChange: -1.1,
    weightHistory: [
      { date: '15 Oct', value: 91.2 },
      { date: '01 Nov', value: 90.8 },
      { date: '15 Nov', value: 90.1 },
      { date: '01 Dic', value: 89.9 },
      { date: '15 Dic', value: 89.5 },
      { date: '01 Ene', value: 89.2 },
      { date: '15 Ene', value: 89.0 },
    ],
    appointments: [{ id: 'a3', date: 'Ayer', time: '3:30 PM', type: 'Presencial' }],
    nutritionalPlan: {
      id: 'p2',
      name: 'Plan Hipocalórico - Septiembre 2025',
      startDate: '5 de septiembre de 2025',
      calories: 1600,
      sodium: 2500,
      compliance: 74,
    },
  },
  {
    id: '0034',
    initials: 'LC',
    color: 'bg-orange-400',
    firstName: 'Lucía',
    lastName: 'Castro',
    age: 29,
    gender: 'Femenino',
    email: 'lucia.c@email.com',
    phone: '+593 97 234 5678',
    status: 'active',
    plan: 'Premium',
    adherence: 88,
    lastConsult: 'Hace 2 días',
    nextAppointment: '18 Nov, 11:00 AM',
    diagnosis: 'Síndrome de ovario poliquístico',
    additionalConditions: ['Resistencia a la insulina'],
    allergies: 'Gluten (sensibilidad)',
    weight: 64,
    weightGoal: 60,
    height: 1.62,
    bmi: 24.4,
    waist: 78,
    hip: 95,
    fatPercent: 26,
    weightChange: -0.8,
    weightHistory: [
      { date: '15 Oct', value: 65.5 },
      { date: '01 Nov', value: 65.1 },
      { date: '15 Nov', value: 64.8 },
      { date: '01 Dic', value: 64.5 },
      { date: '15 Dic', value: 64.2 },
      { date: '01 Ene', value: 64.0 },
      { date: '15 Ene', value: 64.0 },
    ],
    appointments: [],
    nutritionalPlan: {
      id: 'p3',
      name: 'Plan Sin Gluten - Octubre 2025',
      startDate: '10 de octubre de 2025',
      calories: 1700,
      sodium: 2200,
      compliance: 88,
    },
  },
  {
    id: '0041',
    initials: 'AP',
    color: 'bg-purple-500',
    firstName: 'Ana',
    lastName: 'Pérez',
    age: 52,
    gender: 'Femenino',
    email: 'ana.p@email.com',
    phone: '+593 96 345 6789',
    status: 'pending',
    plan: 'Basic',
    adherence: 61,
    lastConsult: 'Hace 5 días',
    nextAppointment: 'Sin agendar',
    diagnosis: 'Hipotiroidismo',
    additionalConditions: ['Sobrepeso leve'],
    allergies: 'Ninguna',
    weight: 71,
    weightGoal: 65,
    height: 1.55,
    bmi: 29.6,
    waist: 85,
    hip: 99,
    fatPercent: 35,
    weightChange: -0.3,
    weightHistory: [
      { date: '15 Oct', value: 71.8 },
      { date: '01 Nov', value: 71.6 },
      { date: '15 Nov', value: 71.5 },
      { date: '01 Dic', value: 71.4 },
      { date: '15 Dic', value: 71.3 },
      { date: '01 Ene', value: 71.1 },
      { date: '15 Ene', value: 71.0 },
    ],
    appointments: [],
    nutritionalPlan: {
      id: 'p4',
      name: 'Plan Tiroideo - Agosto 2025',
      startDate: '1 de agosto de 2025',
      calories: 1500,
      sodium: 1800,
      compliance: 61,
    },
  },
  {
    id: '0055',
    initials: 'RM',
    color: 'bg-teal-500',
    firstName: 'Roberto',
    lastName: 'Morales',
    age: 44,
    gender: 'Masculino',
    email: 'roberto.m@email.com',
    phone: '+593 95 456 7890',
    status: 'inactive',
    plan: 'Basic',
    adherence: 45,
    lastConsult: 'Hace 3 semanas',
    nextAppointment: 'Sin agendar',
    diagnosis: 'Dislipidemia',
    additionalConditions: [],
    allergies: 'Mariscos',
    weight: 82,
    weightGoal: 78,
    height: 1.75,
    bmi: 26.8,
    waist: 92,
    hip: 100,
    fatPercent: 22,
    weightChange: 0.5,
    weightHistory: [
      { date: '15 Oct', value: 81.2 },
      { date: '01 Nov', value: 81.5 },
      { date: '15 Nov', value: 81.8 },
      { date: '01 Dic', value: 82.0 },
      { date: '15 Dic', value: 82.2 },
      { date: '01 Ene', value: 82.3 },
      { date: '15 Ene', value: 82.0 },
    ],
    appointments: [],
    nutritionalPlan: {
      id: 'p5',
      name: 'Plan Cardioprotector - Julio 2025',
      startDate: '15 de julio de 2025',
      calories: 1900,
      sodium: 2300,
      compliance: 45,
    },
  },
];
