import { AppointmentResponse } from './AppointmentService';
import { CalendarAppointment } from '../../pages/Appoinment/agendaUtils';

const PATIENT_COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#14b8a6', '#ec4899'];

function colorForPatient(patientId: string): string {
  let hash = 0;
  for (let i = 0; i < patientId.length; i++) {
    hash = patientId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PATIENT_COLORS[Math.abs(hash) % PATIENT_COLORS.length];
}

export function ToCalendarAppointment(dto: AppointmentResponse): CalendarAppointment {
  const startDate = new Date(dto.scheduled_at);
  const endDate = new Date(startDate.getTime() + dto.duration_min * 60000);

  const firstName = dto.patient?.person?.first_name ?? 'Paciente';
  const lastName = dto.patient?.person?.last_name ?? '';

  const fullName = `${firstName} ${lastName}`.trim();

  const initials = (firstName[0] ?? '') + (lastName[0] ?? '');

  return {
    id: dto.id,
    patientName: fullName,
    patientInitials: initials.toUpperCase() || 'PA',
    patientColor: colorForPatient(dto.patient_id),
    dayIndex: (startDate.getDay() + 6) % 7,
    startDate: startDate.toISOString(),
    startHour: startDate.getHours(),
    startMin: startDate.getMinutes(),
    endHour: endDate.getHours(),
    endMin: endDate.getMinutes(),
    type: dto.modality === 'virtual' ? 'Virtual' : 'Presencial',
    notes: dto.notes ?? '',
  };
}
