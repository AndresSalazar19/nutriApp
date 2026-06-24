// ─── Types ────────────────────────────────────────────────────────────────────

export type ConsultType = 'Presencial' | 'Virtual';
export type CalendarView = 'Semana' | 'Mes' | 'Lista';

export interface CalendarAppointment {
  id: string;
  patientName: string;
  patientInitials: string;
  patientColor: string;
  startHour: number; // e.g. 9
  startMin: number; // e.g. 0 or 30
  endHour: number;
  endMin: number;
  dayIndex: number; // 0 = Monday … 6 = Sunday
  type: ConsultType;
  notes: string;
}

// ─── Mock week (relative to a reference Monday) ───────────────────────────────

export const MOCK_APPOINTMENTS: CalendarAppointment[] = [
  {
    id: 'a1',
    patientName: 'María Rodríguez',
    patientInitials: 'MR',
    patientColor: '#22c55e',
    startHour: 9,
    startMin: 0,
    endHour: 10,
    endMin: 30,
    dayIndex: 0,
    type: 'Virtual',
    notes: 'Control mensual',
  },
  {
    id: 'a2',
    patientName: 'Jorge Gutiérrez',
    patientInitials: 'JG',
    patientColor: '#3b82f6',
    startHour: 8,
    startMin: 0,
    endHour: 9,
    endMin: 30,
    dayIndex: 1,
    type: 'Presencial',
    notes: 'Primera consulta',
  },
  {
    id: 'a3',
    patientName: 'Roberto Morales',
    patientInitials: 'RM',
    patientColor: '#14b8a6',
    startHour: 10,
    startMin: 0,
    endHour: 11,
    endMin: 0,
    dayIndex: 2,
    type: 'Virtual',
    notes: 'Control trimestral',
  },
  {
    id: 'a4',
    patientName: 'Lucía Castro',
    patientInitials: 'LC',
    patientColor: '#f97316',
    startHour: 11,
    startMin: 30,
    endHour: 12,
    endMin: 30,
    dayIndex: 1,
    type: 'Virtual',
    notes: 'Seguimiento',
  },
  {
    id: 'a5',
    patientName: 'Ana Pérez',
    patientInitials: 'AP',
    patientColor: '#a855f7',
    startHour: 14,
    startMin: 0,
    endHour: 15,
    endMin: 0,
    dayIndex: 1,
    type: 'Presencial',
    notes: 'Ajuste de plan',
  },
  {
    id: 'a6',
    patientName: 'Patricia Sánchez',
    patientInitials: 'PS',
    patientColor: '#ec4899',
    startHour: 9,
    startMin: 0,
    endHour: 10,
    endMin: 0,
    dayIndex: 3,
    type: 'Presencial',
    notes: 'Nutrición deportiva',
  },
  {
    id: 'a7',
    patientName: 'Carlos Fernández',
    patientInitials: 'CF',
    patientColor: '#f59e0b',
    startHour: 13,
    startMin: 0,
    endHour: 14,
    endMin: 0,
    dayIndex: 3,
    type: 'Virtual',
    notes: 'Revisión de análisis',
  },
  {
    id: 'a8',
    patientName: 'Elena Torres',
    patientInitials: 'ET',
    patientColor: '#6366f1',
    startHour: 11,
    startMin: 0,
    endHour: 12,
    endMin: 0,
    dayIndex: 4,
    type: 'Presencial',
    notes: 'Primera consulta',
  },
  {
    id: 'a9',
    patientName: 'Diego Ramírez',
    patientInitials: 'DR',
    patientColor: '#8b5cf6',
    startHour: 15,
    startMin: 30,
    endHour: 16,
    endMin: 30,
    dayIndex: 4,
    type: 'Virtual',
    notes: 'Control mensual',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const DAYS_ES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const DAYS_SHORT = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

/** Returns the Monday of the week containing `date` */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns array of 7 Date objects starting from Monday */
export function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}
