import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NutritionistLayout } from '../../components/layout/NutritionistLayout';
import { Button } from '../../components/ui/Button';
import { AppointmentCard } from '../../components/ui/AppointmentCard';
import { AppointmentViewModal, NewAppointmentModal } from '../../components/ui/AppointmentModal';
import {
  CalendarAppointment,
  CalendarView,
  DAYS_SHORT,
  getWeekStart,
  getWeekDays,
  formatMonthYear,
  isSameDay,
  pad,
} from './agendaUtils';
import { useAppointments } from '../../hooks/useAppointments';
import { ToCalendarAppointment } from '../../services/Appointments/appointment.transform';

// ─── Constants ────────────────────────────────────────────────────────────────

const SLOT_HEIGHT = 56; // px per 30-min slot
const HOUR_START = 8;
const HOUR_END = 19;
const TOTAL_HOURS = HOUR_END - HOUR_START;
const TOTAL_SLOTS = TOTAL_HOURS * 2;
const TIME_COL_W = 56; // px

// ─── WeekGrid ─────────────────────────────────────────────────────────────────

interface WeekGridProps {
  weekDays: Date[];
  appointments: CalendarAppointment[];
  today: Date;
  onApptClick: (appt: CalendarAppointment, day: Date) => void;
}

function WeekGrid({ weekDays, appointments, today, onApptClick }: WeekGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  // Scroll to 8:00 on mount
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = 0;
    }
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
        <div style={{ width: TIME_COL_W, flexShrink: 0 }} className="pt-0">
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
              {/* Slot rows */}
              {slots.map((slot, i) => (
                <div
                  key={i}
                  style={{ height: SLOT_HEIGHT }}
                  className={`border-b ${slot.m === 0 ? 'border-gray-100' : 'border-gray-50 border-dashed'}`}
                />
              ))}

              {/* Appointments — absolutely positioned */}
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

              {/* Today current time line */}
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

// ─── Day header row ───────────────────────────────────────────────────────────

function DayHeaders({ weekDays, today }: { weekDays: Date[]; today: Date }) {
  return (
    <div
      className="flex border-b border-gray-100 bg-white sticky top-0 z-10"
      style={{ minWidth: 700 }}
    >
      {/* Time col spacer */}
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [view, setView] = useState<CalendarView>('Semana');
  const { appointments, setAppointments } = useAppointments();
  const [selectedAppt, setSelectedAppt] = useState<{ appt: CalendarAppointment; day: Date } | null>(
    null,
  );
  const [showNewModal, setShowNewModal] = useState(false);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const calendarAppointments = useMemo(() => {
    return appointments
      .map((a) => {
        try {
          return ToCalendarAppointment(a);
        } catch (err) {
          console.error('Error transforming appointment', err);
          return null;
        }
      })
      .filter(Boolean);
  }, [appointments]);

  const monthLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    if (start.getMonth() === end.getMonth()) {
      return formatMonthYear(start);
    }
    return `${start.toLocaleDateString('es-EC', { month: 'short' })} – ${formatMonthYear(end)}`;
  }, [weekDays]);

  function prevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }

  function nextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }

  function goToday() {
    setWeekStart(getWeekStart(today));
  }

  function handleNewAppt(appt: Omit<CalendarAppointment, 'id'>) {
    setAppointments((prev) => [...prev, { ...appt, id: `temp-${Date.now()}` } as any]);
  }

  // Today's appointment count
  const todayCount = calendarAppointments.filter((a) => {
    if (a.startDate) {
      try {
        return isSameDay(new Date(a.startDate), today);
      } catch {
        return a.dayIndex === (today.getDay() === 0 ? 6 : today.getDay() - 1);
      }
    }
    return a.dayIndex === (today.getDay() === 0 ? 6 : today.getDay() - 1);
  }).length;

  return (
    <NutritionistLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mi Agenda</h1>
            {todayCount > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                {todayCount} cita{todayCount !== 1 ? 's' : ''} hoy
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* View switcher */}
            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
              {(['Semana', 'Mes', 'Lista'] as CalendarView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    view === v
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              onClick={() => setShowNewModal(true)}
              icon={<span className="text-sm font-bold">+</span>}
            >
              Nueva Cita
            </Button>
          </div>
        </div>

        {/* ── Week nav bar ── */}
        <div className="flex items-center justify-between px-8 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={prevWeek}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition text-lg"
            >
              ‹
            </button>
            <h2 className="text-base font-semibold text-gray-900 capitalize min-w-[200px] text-center">
              {monthLabel}
            </h2>
            <button
              onClick={nextWeek}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition text-lg"
            >
              ›
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Today button */}
            <button
              onClick={goToday}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200
                text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              <span className="w-2 h-2 bg-admin-accent rounded-full" />
              Hoy
            </button>
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-nutri-medium" /> Presencial
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-admin-medium" /> Virtual
              </span>
            </div>
          </div>
        </div>

        {/* ── Calendar ── */}
        <div className="flex-1 overflow-hidden px-8 pt-0 pb-4">
          <div className="h-full flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-4">
            <DayHeaders weekDays={weekDays} today={today} />
            <WeekGrid
              weekDays={weekDays}
              appointments={calendarAppointments}
              today={today}
              onApptClick={(appt, day) => setSelectedAppt({ appt, day })}
            />
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {selectedAppt && (
        <AppointmentViewModal
          appt={selectedAppt.appt}
          dayDate={selectedAppt.day}
          onClose={() => setSelectedAppt(null)}
        />
      )}
      {showNewModal && (
        <NewAppointmentModal
          onClose={() => setShowNewModal(false)}
          onSave={handleNewAppt}
          prefillWeekStart={weekStart}
        />
      )}
    </NutritionistLayout>
  );
}
