import { AppointmentResponse } from './AppointmentService';
import { CalendarAppointment } from '../../pages/Appoinment/agendaUtils';

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
    patientColor: '#22c55e',
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
