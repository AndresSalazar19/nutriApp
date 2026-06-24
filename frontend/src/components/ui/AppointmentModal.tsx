import React, { useState } from 'react';
import { FiCalendar, FiClock, FiFileText } from 'react-icons/fi';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { CalendarAppointment, ConsultType, pad } from '../../pages/Appoinment/agendaUtils';
import { MOCK_PATIENTS } from '../../components/mock/patientsMock';
import { AppointmentService } from '../../services/Appointments/AppointmentService';
import { ToCalendarAppointment } from '../../services/Appointments/appointment.transform';
import { useAuth } from '../../hooks/useAuth';

// ─── Helpers de fecha ──────────────────────────────────────────────────────

/** Devuelve la fecha local de hoy en formato YYYY-MM-DD */
function todayLocalISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${year}-${month}-${day}`;
}

/** Parsea un string YYYY-MM-DD como fecha LOCAL */
function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function AppointmentViewModal({ appt, dayDate, onClose }) {
  const isVirtual = appt.type === 'Virtual';
  const badge = isVirtual ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
  const dot = isVirtual ? 'bg-blue-500' : 'bg-green-500';

  const displayDate = appt.startDate ? new Date(appt.startDate) : dayDate;
  const dateStr = displayDate.toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <Modal isOpen onClose={onClose} title="Detalle de Cita" size="sm">
      <div className="space-y-4">

        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: appt.patientColor }}
          >
            {appt.patientInitials}
          </div>

          <div>
            <p className="font-bold text-gray-800">{appt.patientName}</p>

            <span className={`text-xs px-2 py-0.5 rounded-full ${badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              {appt.type}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
          <Row icon={<FiCalendar className="w-4 h-4 text-gray-400" />} label="Fecha" value={dateStr} />
          <Row
            icon={<FiClock className="w-4 h-4 text-gray-400" />}
            label="Hora"
            value={`${pad(appt.startHour)}:${pad(appt.startMin)} – ${pad(appt.endHour)}:${pad(appt.endMin)}`}
          />
          {appt.notes && <Row icon={<FiFileText className="w-4 h-4 text-gray-400" />} label="Notas" value={appt.notes} />}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cerrar
          </Button>
          <Button variant="primary" className="flex-1">
            Editar cita
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <span className="text-gray-400 w-12 flex-shrink-0">{label}</span>
      <span className="text-gray-700 font-medium capitalize">{value}</span>
    </div>
  );
}

// ─── New appointment modal ────────────────────────────────────────────────────

interface NewModalProps {
  onClose:  () => void;
  onSave:   (appt: Omit<CalendarAppointment, 'id'>) => void;
  prefillDay?: number;
  prefillWeekStart?: Date;
}

export function NewAppointmentModal({ onClose, onSave, prefillWeekStart }: NewModalProps) {
  const [form, setForm] = useState({
    patientName: '',
    patientId: '',
    startTime:   '09:00',
    endTime:     '10:00',
    date:    todayLocalISO(),
    type:        'Presencial' as ConsultType,
    notes:       '',
  });
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    const [sh, sm] = form.startTime.split(':').map(Number);
    const [eh, em] = form.endTime.split(':').map(Number);

    let startDateIso: string | undefined = undefined;
    if (prefillWeekStart) {
      const [year, month, day] = form.date.split('-').map(Number);
      const d = new Date(year, month - 1, day, sh, sm, 0, 0);
      startDateIso = d.toISOString();
    }

    const durationMin = (eh * 60 + em) - (sh * 60 + sm);
    const payload = {
      patient_id: form.patientId || undefined,
      nutritionist_id: user?.userId ?? undefined,
      scheduled_at: startDateIso ?? new Date().toISOString(),
      duration_min: durationMin > 0 ? durationMin : 45,
      modality: form.type === 'Virtual' ? 'virtual' : 'presencial',
      notes: form.notes || null,
    };

    try {
      setLoading(true);
      const created = await AppointmentService.create(payload as any);
      const cal = ToCalendarAppointment(created);
      onSave(cal as any);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error creando la cita');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Nueva Cita" size="sm">
      <div className="space-y-4">

        <Field label="Paciente (maqueta)">
          <div>
            <select
              value={form.patientId}
              onChange={e => {
                const id = e.target.value;
                const p = MOCK_PATIENTS.find(x => x.id === id);
                update('patientId', id);
                update('patientName', p ? `${p.firstName} ${p.lastName}` : '');
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            >
              <option value="">— Seleccionar paciente —</option>
              {MOCK_PATIENTS.map(p => (
                <option key={p.id} value={p.id}>{`${p.initials} · ${p.firstName} ${p.lastName}`}</option>
              ))}
            </select>
            <div className="text-xs text-gray-400 mt-1">Selecciona un paciente de la lista (maqueta).</div>
          </div>
        </Field>

        <Field label="Fecha">
          <input
            type="date"
            value={form.date}
            onChange={e => update('date', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />

          {form.date && (
            <div className="text-xs text-gray-500 mt-1 capitalize">
              {parseLocalDate(form.date).toLocaleDateString('es-EC', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Hora inicio">
            <input type="time" value={form.startTime}
              onChange={e => update('startTime', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </Field>
          <Field label="Hora fin">
            <input type="time" value={form.endTime}
              onChange={e => update('endTime', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </Field>
        </div>

        <Field label="Tipo">
          <div className="flex gap-2">
            {(['Presencial', 'Virtual'] as ConsultType[]).map(t => (
              <button
                key={t}
                onClick={() => update('type', t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                  form.type === t
                    ? t === 'Presencial'
                      ? 'bg-green-50 border-green-400 text-green-700'
                      : 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Notas">
          <input
            type="text"
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Control mensual, primera consulta..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </Field>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button variant="primary" onClick={handleSave} className="flex-1" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cita'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}