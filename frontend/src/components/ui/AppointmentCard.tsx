import React from 'react';
import { CalendarAppointment, pad } from '../../components/mock/agendaMock';

const SLOT_HEIGHT = 56; // px per 30-min slot (must match WeekGrid)
const SLOTS_PER_HOUR = 2;

interface AppointmentCardProps {
  appt: CalendarAppointment;
  onClick: (appt: CalendarAppointment) => void;
}

export function AppointmentCard({ appt, onClick }: AppointmentCardProps) {
  const startSlots = (appt.startHour * 60 + appt.startMin) / 30;
  const endSlots   = (appt.endHour   * 60 + appt.endMin)   / 30;
  const durationSlots = endSlots - startSlots;

  // Height in px
  const height = durationSlots * SLOT_HEIGHT - 4; // 4px gap

  const isVirtual = appt.type === 'Virtual';

  const bg     = isVirtual ? 'bg-blue-50  border-blue-200'  : 'bg-green-50  border-green-200';
  const text   = isVirtual ? 'text-blue-800'                : 'text-green-800';
  const badge  = isVirtual ? 'bg-blue-100 text-blue-700'    : 'bg-green-100 text-green-700';
  const dot    = isVirtual ? 'bg-blue-500'                  : 'bg-green-500';
  const avatar = isVirtual ? 'bg-blue-500' : appt.patientColor;

  return (
    <div
      onClick={() => onClick(appt)}
      style={{ height }}
      className={`
        absolute inset-x-0.5 rounded-lg border px-2 py-1.5 cursor-pointer
        ${bg} hover:shadow-md transition-shadow overflow-hidden select-none
      `}
    >
      {/* Top row: time + type badge */}
      <div className="flex items-center justify-between mb-0.5">
        <span className={`text-xs font-semibold ${text}`}>
          {pad(appt.startHour)}:{pad(appt.startMin)} – {pad(appt.endHour)}:{pad(appt.endMin)}
        </span>
        {height > 40 && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {appt.type}
          </span>
        )}
      </div>

      {/* Patient name */}
      {height > 30 && (
        <p className={`text-xs font-bold leading-tight truncate ${text}`}>
          {appt.patientName}
        </p>
      )}

      {/* Notes */}
      {height > 52 && appt.notes && (
        <p className="text-xs text-gray-400 truncate mt-0.5">{appt.notes}</p>
      )}
    </div>
  );
}

export const SLOT_HEIGHT_EXPORT = SLOT_HEIGHT;
