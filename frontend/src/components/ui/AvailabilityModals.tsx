import React from 'react';
import { AvailabilityRule } from '../../services/NutritionistService';
import { Modal } from './Modal';
import { Button } from './Button';
import { formatTime, ruleTypeLabel, ruleLabel } from './AvailabilityFormatters';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AvailabilityFormState {
  rule_type: 'recurring' | 'exception';
  day_of_week: number;
  specific_date: string;
  start_time: string;
  end_time: string;
}

// ─── Editor Modal ─────────────────────────────────────────────────────────────

interface EditorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvailability: AvailabilityRule | null;
  formState: AvailabilityFormState;
  onChange: (field: keyof AvailabilityFormState, value: string | boolean | number) => void;
  onSave: () => void;
  loading: boolean;
  error: string | null;
}

export function AvailabilityEditorModal({
  isOpen,
  onClose,
  selectedAvailability,
  formState,
  onChange,
  onSave,
  loading,
  error,
}: EditorProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        selectedAvailability ? 'Editar regla de disponibilidad' : 'Nueva regla de disponibilidad'
      }
      size="md"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Tipo de regla</label>
          <select
            value={formState.rule_type}
            onChange={(e) => onChange('rule_type', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="recurring">Recurrente</option>
            <option value="exception">Excepción</option>
          </select>
        </div>

        {formState.rule_type === 'recurring' ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Día de la semana</label>
            <select
              value={formState.day_of_week}
              onChange={(e) => onChange('day_of_week', Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value={0}>Lunes</option>
              <option value={1}>Martes</option>
              <option value={2}>Miércoles</option>
              <option value={3}>Jueves</option>
              <option value={4}>Viernes</option>
              <option value={5}>Sábado</option>
              <option value={6}>Domingo</option>
            </select>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Fecha específica</label>
              <input
                type="date"
                value={formState.specific_date}
                onChange={(e) => onChange('specific_date', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Inicio</label>
            <input
              type="time"
              value={formState.start_time}
              onChange={(e) => onChange('start_time', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Fin</label>
            <input
              type="time"
              value={formState.end_time}
              onChange={(e) => onChange('end_time', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {selectedAvailability ? 'Guardar cambios' : 'Crear regla'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

interface DeleteProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvailability: AvailabilityRule | null;
  onConfirm: () => void;
  loading: boolean;
  error: string | null;
}

export function DeleteAvailabilityModal({
  isOpen,
  onClose,
  selectedAvailability,
  onConfirm,
  loading,
  error,
}: DeleteProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Eliminar disponibilidad" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          ¿Estás seguro de que deseas eliminar esta regla de disponibilidad?
        </p>
        {selectedAvailability && (
          <div className="rounded-2xl bg-gray-50 p-3 text-xs text-gray-600">
            <p>{ruleTypeLabel(selectedAvailability.rule_type)}</p>
            <p>{ruleLabel(selectedAvailability)}</p>
            <p>
              {selectedAvailability.start_time == null || selectedAvailability.end_time == null
                ? 'Bloqueo total'
                : `${formatTime(selectedAvailability.start_time)} - ${formatTime(selectedAvailability.end_time)}`}
            </p>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
