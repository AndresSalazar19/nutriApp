import React, { useMemo, useRef, useEffect } from 'react';
import { AppointmentCard } from '../../components/ui/AppointmentCard';
import { CalendarAppointment, CalendarView, DAYS_SHORT, isSameDay, pad } from './agendaUtils';

// ─── Constants ────────────────────────────────────────────────────────────────

const SLOT_HEIGHT = 56;
const HOUR_START = 8;
const HOUR_END = 19;
const TOTAL_HOURS = HOUR_END - HOUR_START;
const TOTAL_SLOTS = TOTAL_HOURS * 2;
const TIME_COL_W = 56;

// ─── Shared prop types ────────────────────────────────────────────────────────

interface ViewProps {
  appointments: CalendarAppointment[];
  today: Date;
  onApptClick: (appt: CalendarAppointment, day: Date) => void;
}

// ─── DayHeaders ───────────────────────────────────────────────────────────────

function DayHeaders({ weekDays, today }: { weekDays: Date[]; today: Date }) {
  return (
    <div
      className="flex border-b border-gray-100 bg-white sticky top-0 z-10"
      style={{ minWidth: 700 }}
    >
      <div style={{ width: TIME_COL_W, flexShrink: 0 }} />
      {weekDays.map((day, i) => {
        const isToday = isSameDay(day, today);
        return (
          <div key={i} className="flex-1 text-center py-3 border-l border-gray-100">
            <p
              className={`text-xs font-semibold uppercase tracking-wide mb-1
              ${isToday ? 'text-nutri-dark' : 'text-gray-500'}`}
            >
              {DAYS_SHORT[i]}
            </p>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto
              text-sm font-bold transition
              ${isToday ? 'bg-nutri-dark text-white' : 'text-gray-700'}`}
            >
              {day.getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface WeekGridProps extends ViewProps {
  weekDays: Date[];
}

function WeekGrid({ weekDays, appointments, today, onApptClick }: WeekGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = 0;
  }, []);

  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    const h = HOUR_START + Math.floor(i / 2);
    const m = i % 2 === 0 ? 0 : 30;
    return { h, m, label: m === 0 ? `${pad(h)}:00` : '' };
  });

  return (
    <div
      ref={gridRef}
      className="overflow-auto flex-1"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      <div className="flex" style={{ minWidth: 700 }}>
        {/* Time column */}
        <div style={{ width: TIME_COL_W, flexShrink: 0 }}>
          {slots.map((slot, i) => (
            <div
              key={i}
              style={{ height: SLOT_HEIGHT }}
              className="flex items-start justify-end pr-3 border-b border-gray-50"
            >
              {slot.label && (
                <span className="text-xs text-gray-500 -translate-y-2">{slot.label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day, dayIdx) => {
          const isToday = isSameDay(day, today);
          const dayAppts = appointments.filter((a) => {
            if (a.startDate) {
              try {
                return isSameDay(new Date(a.startDate), day);
              } catch {
                return a.dayIndex === dayIdx;
              }
            }
            return a.dayIndex === dayIdx;
          });

          return (
            <div key={dayIdx} className="flex-1 relative border-l border-gray-100">
              {slots.map((slot, i) => (
                <div
                  key={i}
                  style={{ height: SLOT_HEIGHT }}
                  className={`border-b ${slot.m === 0 ? 'border-gray-100' : 'border-gray-50 border-dashed'}`}
                />
              ))}

              {dayAppts.map((appt) => {
                const topSlots = (appt.startHour * 60 + appt.startMin) / 30 - HOUR_START * 2;
                const top = topSlots * SLOT_HEIGHT;
                const endSlots = (appt.endHour * 60 + appt.endMin) / 30 - HOUR_START * 2;
                const height = (endSlots - topSlots) * SLOT_HEIGHT - 4;
                return (
                  <div
                    key={appt.id}
                    style={{ position: 'absolute', top, left: 2, right: 2, height }}
                    onClick={() => onApptClick(appt, day)}
                  >
                    <AppointmentCard appt={appt} onClick={() => onApptClick(appt, day)} />
                  </div>
                );
              })}

              {isToday &&
                (() => {
                  const now = new Date();
                  const mins = now.getHours() * 60 + now.getMinutes() - HOUR_START * 60;
                  if (mins < 0 || mins > TOTAL_HOURS * 60) return null;
                  const topPx = (mins / 30) * SLOT_HEIGHT;
                  return (
                    <div
                      style={{ position: 'absolute', top: topPx, left: 0, right: 0 }}
                      className="flex items-center pointer-events-none"
                    >
                      <div className="w-2 h-2 bg-admin-accent rounded-full -ml-1 flex-shrink-0" />
                      <div className="flex-1 border-t-2 border-admin-accent" />
                    </div>
                  );
                })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MonthGrid ────────────────────────────────────────────────────────────────

interface MonthGridProps extends ViewProps {
  referenceDate: Date;
}

function MonthGrid({ appointments, today, referenceDate, onApptClick }: MonthGridProps) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0

  const cells = Array.from({ length: startOffset + daysInMonth }, (_, i) =>
    i < startOffset ? null : new Date(year, month, i - startOffset + 1),
  );

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Day name headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-gray-400 py-1 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="bg-white h-24" />;

          const isToday = isSameDay(day, today);
          const isCurrentMonth = day.getMonth() === month;
          const dayAppts = appointments.filter((a) => {
            try {
              return isSameDay(new Date(a.startDate!), day);
            } catch {
              return false;
            }
          });

          return (
            <div
              key={i}
              className={`bg-white h-24 p-1.5 flex flex-col ${!isCurrentMonth ? 'opacity-40' : ''}`}
            >
              <div className="flex justify-end mb-1">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-nutri-dark text-white' : 'text-gray-600'}`}
                >
                  {day.getDate()}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayAppts.slice(0, 2).map((appt) => (
                  <button
                    key={appt.id}
                    onClick={() => onApptClick(appt, day)}
                    className="text-left text-[10px] leading-tight px-1.5 py-0.5 rounded bg-nutri-light text-nutri-dark font-medium truncate hover:opacity-80 transition"
                  >
                    {pad(appt.startHour)}:{pad(appt.startMin)} {appt.patientName}
                  </button>
                ))}
                {dayAppts.length > 2 && (
                  <span className="text-[10px] text-gray-400 pl-1">+{dayAppts.length - 2} más</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ListView ─────────────────────────────────────────────────────────────────

function ListView({ appointments, today, onApptClick }: ViewProps) {
  const groups = useMemo(() => {
    const map = new Map<string, { day: Date; appts: CalendarAppointment[] }>();
    appointments.forEach((a) => {
      try {
        const day = new Date(a.startDate!);
        const key = day.toISOString().split('T')[0];
        if (!map.has(key)) map.set(key, { day, appts: [] });
        map.get(key)!.appts.push(a);
      } catch {}
    });
    return Array.from(map.values()).sort((a, b) => a.day.getTime() - b.day.getTime());
  }, [appointments]);

  if (groups.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-16">
        Sin citas registradas
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 space-y-6">
      {groups.map(({ day, appts }) => {
        const isToday = isSameDay(day, today);
        const label = day.toLocaleDateString('es-EC', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        });

        return (
          <div key={day.toISOString()}>
            {/* Day header */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wide capitalize
                ${isToday ? 'text-nutri-dark' : 'text-gray-400'}`}
              >
                {label}
              </span>
              {isToday && (
                <span className="text-[10px] bg-nutri-dark text-white px-1.5 py-0.5 rounded-full">
                  Hoy
                </span>
              )}
            </div>

            {/* Appointment rows */}
            <div className="space-y-2">
              {appts
                .sort((a, b) => a.startHour * 60 + a.startMin - (b.startHour * 60 + b.startMin))
                .map((appt) => (
                  <div
                    key={appt.id}
                    onClick={() => onApptClick(appt, day)}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl
                    hover:border-nutri-medium hover:shadow-sm cursor-pointer transition"
                  >
                    {/* Time */}
                    <div className="text-xs font-mono text-gray-400 w-12 shrink-0">
                      {pad(appt.startHour)}:{pad(appt.startMin)}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: appt.patientColor }}
                    >
                      {appt.patientInitials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {appt.patientName}
                      </p>
                      <p className="text-xs text-gray-400">{appt.type ?? 'Consulta'}</p>
                    </div>

                    {/* Duration pill */}
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full shrink-0">
                      {pad(appt.endHour)}:{pad(appt.endMin)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface CalendarViewsProps {
  view: CalendarView;
  appointments: CalendarAppointment[];
  today: Date;
  weekDays: Date[];
  weekStart: Date;
  onApptClick: (appt: CalendarAppointment, day: Date) => void;
}

export function CalendarViews({
  view,
  appointments,
  today,
  weekDays,
  weekStart,
  onApptClick,
}: CalendarViewsProps) {
  return (
    <>
      {/* Day headers solo en vista Semana */}
      {view === 'Semana' && <DayHeaders weekDays={weekDays} today={today} />}

      {view === 'Semana' && (
        <WeekGrid
          weekDays={weekDays}
          appointments={appointments}
          today={today}
          onApptClick={onApptClick}
        />
      )}

      {view === 'Mes' && (
        <MonthGrid
          appointments={appointments}
          today={today}
          referenceDate={weekStart}
          onApptClick={onApptClick}
        />
      )}

      {view === 'Lista' && (
        <ListView appointments={appointments} today={today} onApptClick={onApptClick} />
      )}
    </>
  );
}
