import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { CalendarAppointment, ConsultType, DAYS_ES, pad } from '../../components/mock/agendaMock';

// ─── View modal ───────────────────────────────────────────────────────────────

interface ViewModalProps {
  appt: CalendarAppointment;
  dayDate: Date;
  onClose: () => void;
}

export function AppointmentViewModal({ appt, dayDate, onClose }: ViewModalProps) {
  const isVirtual = appt.type === 'Virtual';
  const badge = isVirtual ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
  const dot = isVirtual ? 'bg-blue-500' : 'bg-green-500';

  const dateStr = dayDate.toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <Modal isOpen onClose={onClose} title="Detalle de Cita" size="sm">
      <div className="space-y-4">
        {/* Patient */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: appt.patientColor }}
          >
            {appt.patientInitials}
          </div>
          <div>
            <p className="font-bold text-gray-800">{appt.patientName}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit mt-0.5 ${badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              {appt.type}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
          <Row icon="📅" label="Fecha" value={dateStr} />
          <Row
            icon="🕐"
            label="Hora"
            value={`${pad(appt.startHour)}:${pad(appt.startMin)} – ${pad(appt.endHour)}:${pad(appt.endMin)}`}
          />
          {appt.notes && <Row icon="📝" label="Notas" value={appt.notes} />}
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

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span>{icon}</span>
      <span className="text-gray-400 w-12 flex-shrink-0">{label}</span>
      <span className="text-gray-700 font-medium capitalize">{value}</span>
    </div>
  );
}

// ─── New appointment modal ────────────────────────────────────────────────────

interface NewModalProps {
  onClose: () => void;
  onSave: (appt: Omit<CalendarAppointment, 'id'>) => void;
  prefillDay?: number;
}

export function NewAppointmentModal({ onClose, onSave, prefillDay }: NewModalProps) {
  const [form, setForm] = useState({
    patientName: '',
    startTime: '09:00',
    endTime: '10:00',
    dayIndex: prefillDay ?? 0,
    type: 'Presencial' as ConsultType,
    notes: '',
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSave() {
    const [sh, sm] = form.startTime.split(':').map(Number);
    const [eh, em] = form.endTime.split(':').map(Number);
    onSave({
      patientName: form.patientName || 'Paciente',
      patientInitials: (
        form.patientName
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2) || 'PA'
      ).toUpperCase(),
      patientColor: '#22c55e',
      startHour: sh,
      startMin: sm,
      endHour: eh,
      endMin: em,
      dayIndex: form.dayIndex,
      type: form.type,
      notes: form.notes,
    });
    onClose();
  }

  return (
    <Modal isOpen onClose={onClose} title="Nueva Cita" size="sm">
      <div className="space-y-4">
        <Field label="Paciente">
          <input
            type="text"
            value={form.patientName}
            onChange={(e) => update('patientName', e.target.value)}
            placeholder="Nombre del paciente"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </Field>

        <Field label="Día">
          <select
            value={form.dayIndex}
            onChange={(e) => update('dayIndex', Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          >
            {DAYS_ES.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Hora inicio">
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => update('startTime', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </Field>
          <Field label="Hora fin">
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => update('endTime', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </Field>
        </div>

        <Field label="Tipo">
          <div className="flex gap-2">
            {(['Presencial', 'Virtual'] as ConsultType[]).map((t) => (
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
                {t === 'Presencial' ? '🏥' : '💻'} {t}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Notas">
          <input
            type="text"
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Control mensual, primera consulta..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </Field>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} className="flex-1">
            Guardar Cita
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
