// ─── Types ────────────────────────────────────────────────────────────────────
// Nota: este archivo ya no contiene datos mock — solo los tipos que consumen
// PatientProfile, WeightChart, PatientsPage y ClientPage. Se conserva el nombre
// de archivo para no romper los imports existentes.

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
