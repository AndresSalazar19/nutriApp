import React, { useState, useMemo } from 'react';
import { NutritionistLayout } from '../../components/layout/NutritionistLayout';
import { Button } from '../../components/ui/Button';
import { AppointmentViewModal, NewAppointmentModal } from '../../components/ui/AppointmentModal';
import { Toast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Spinner';
import { CalendarAppointment, CalendarView, getWeekStart, getWeekDays, formatMonthYear, isSameDay } from './agendaUtils';
import { useAppointments } from '../../hooks/useAppointments';
import { ToCalendarAppointment } from '../../services/Appointments/appointment.transform';
import { CalendarViews } from './CalendarViews';

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [view, setView] = useState<CalendarView>('Semana');
  const { appointments, refetch, loading } = useAppointments();
  const [selectedAppt, setSelectedAppt] = useState<{ appt: CalendarAppointment; day: Date } | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const calendarAppointments = useMemo(() => {
     return appointments
      .filter((a) => a.cancelled_at == null)
      .map((a) => {
        try {
          return ToCalendarAppointment(a);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as CalendarAppointment[];
  }, [appointments]);

  const monthLabel = useMemo(() => {
    if (view === 'Mes') {
      return formatMonthYear(weekStart);
    }
    if (view === 'Lista') {
      return 'Todas las citas';
    }
    const start = weekDays[0];
    const end = weekDays[6];
    if (start.getMonth() === end.getMonth()) return formatMonthYear(start);
    return `${start.toLocaleDateString('es-EC', { month: 'short' })} – ${formatMonthYear(end)}`;
  }, [weekDays, weekStart, view]);

  // Navigation adapts to view
  function prevPeriod() {
    const d = new Date(weekStart);
    if (view === 'Mes') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }

  function nextPeriod() {
    const d = new Date(weekStart);
    if (view === 'Mes') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }

  function handleApptClick(appt: CalendarAppointment, day: Date) {
    setSelectedAppt({ appt, day });
  }

  function handleNewAppt() {
    setShowNewModal(false);
    setToastConfig({ isVisible: true, message: '¡Cita agendada con éxito!', type: 'success' });
    refetch();
  }

  function handleApptChanged() {
    setToastConfig({ isVisible: true, message: 'Cita actualizada', type: 'success' });
    refetch();
  }

  const todayCount = calendarAppointments.filter((a) => {
    try { return isSameDay(new Date(a.startDate!), today); } catch { return false; }
  }).length;

  // Hide nav arrows in Lista view (no period to navigate)
  const showNav = view !== 'Lista';

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

        {/* ── Period nav bar ── */}
        <div className="flex items-center justify-between px-8 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            {showNav && (
              <button
                onClick={prevPeriod}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition text-lg"
              >
                ‹
              </button>
            )}
            <h2 className="text-base font-semibold text-gray-900 capitalize min-w-[200px] text-center">
              {monthLabel}
            </h2>
            {showNav && (
              <button
                onClick={nextPeriod}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition text-lg"
              >
                ›
              </button>
            )}
          </div>
        </div>

        {/* ── Calendar area ── */}
        <div className="flex-1 overflow-hidden px-8 pt-0 pb-4">
          <div className="h-full flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-4 relative">

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                <Spinner size="lg" color="text-nutri-medium" text="Actualizando agenda..." />
              </div>
            )}

            {/* Las 3 vistas (Semana / Mes / Lista) viven en CalendarViews */}
            <CalendarViews
              view={view}
              appointments={calendarAppointments}
              today={today}
              weekDays={weekDays}
              weekStart={weekStart}
              onApptClick={handleApptClick}
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
          onChanged={handleApptChanged}
        />
      )}
      {showNewModal && (
        <NewAppointmentModal
          onClose={() => setShowNewModal(false)}
          onSave={handleNewAppt}
          prefillWeekStart={weekStart}
        />
      )}

      <Toast
        isVisible={toastConfig.isVisible}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={() => setToastConfig((prev) => ({ ...prev, isVisible: false }))}
      />
    </NutritionistLayout>
  );
}