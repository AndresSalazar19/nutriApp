// ─── Types ────────────────────────────────────────────────────────────────────

export type ConsultType = 'Presencial' | 'Virtual';
export type CalendarView = 'Semana' | 'Mes' | 'Lista';

export interface CalendarAppointment {
  id: string;
  patientName: string;
  patientInitials: string;
  patientColor: string;
  dayIndex: number;
  startDate?: string;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  type: ConsultType;
  notes?: string;
}


// ─── Helpers ─────────────────────────────────────────────────────────────────
export const DAYS_SHORT = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

/** Returns the Monday of the week containing `date` */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();                   // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day;   // shift to Monday
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
  return a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();
}

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}
