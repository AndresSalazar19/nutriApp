import React from 'react';
import { AvailabilityCalendar, AvailabilityRule } from '../../services/NutritionistService';
import { EmptyState } from './EmptyState';
import { Button } from './Button';
import { TbPlus, TbPencil, TbTrash } from 'react-icons/tb';
import { formatTime, ruleTypeLabel, formatExceptionDate } from './AvailabilityFormatters';

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

interface Props {
  calendar: AvailabilityCalendar | null;
  onAdd: () => void;
  onAddDay: (dayIndex: number) => void;
  onAddException: () => void;
  onEdit: (rule: AvailabilityRule) => void;
  onDelete: (rule: AvailabilityRule) => void;
}

export function AvailabilitySection({
  calendar,
  onAdd,
  onAddDay,
  onAddException,
  onEdit,
  onDelete,
}: Props) {
  const exceptions = calendar?.exceptions ?? [];

  return (
    <>
      {/* Disponibilidad recurrente */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h4 className="font-bold text-gray-800 text-sm">Disponibilidad</h4>
            <p className="text-sm text-gray-500">Administra tu semana con bloques de horario.</p>
          </div>
          <Button variant="primary" onClick={onAdd}>
            <TbPlus className="w-4 h-4" />
            Agregar horario
          </Button>
        </div>

        {!calendar || !calendar.days ? (
          <p className="text-sm text-gray-500">Cargando disponibilidad...</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
            {DAYS.map((day, index) => {
              const blocks = calendar.days?.[day.key] ?? [];
              const isEmpty = blocks.length === 0;

              return (
                <div key={day.key} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-800">{day.label}</span>
                    <button
                      type="button"
                      onClick={() => onAddDay(index)}
                      aria-label={`Añadir horario el ${day.label.toLowerCase()}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-nutri-medium hover:text-nutri-medium"
                    >
                      <TbPlus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {isEmpty ? (
                      <button
                        type="button"
                        onClick={() => onAddDay(index)}
                        className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-6 text-gray-400 transition-colors hover:border-nutri-medium hover:text-nutri-medium"
                      >
                        <TbPlus className="h-4 w-4" />
                        <span className="text-xs">Libre</span>
                      </button>
                    ) : (
                      blocks.map((block) => {
                        const isBlockedDay = block.start_time == null || block.end_time == null;
                        return (
                          <div
                            key={block.id}
                            className={`relative overflow-hidden rounded-lg bg-white pl-3 pr-2 py-2 ${
                              isBlockedDay
                                ? 'border-l-[3px] border-red-400'
                                : 'border-l-[3px] border-emerald-500'
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-900">
                              {isBlockedDay
                                ? 'Bloqueo total'
                                : `${formatTime(block.start_time!)}–${formatTime(block.end_time!)}`}
                            </p>
                            <p className="text-xs text-gray-400">
                              {ruleTypeLabel(block.rule_type)}
                            </p>
                            <div className="mt-1.5 flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => onEdit(block)}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-nutri-medium"
                              >
                                <TbPencil className="h-3.5 w-3.5" /> Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => onDelete(block)}
                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                              >
                                <TbTrash className="h-3.5 w-3.5" /> Eliminar
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Excepciones */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h4 className="font-bold text-gray-800 text-sm">Excepciones</h4>
            <p className="text-sm text-gray-500">
              Días puntuales que rompen tu horario recurrente esta semana.
            </p>
          </div>
          <Button variant="outline" onClick={onAddException}>
            <TbPlus className="w-4 h-4" />
            Agregar excepción
          </Button>
        </div>

        {!calendar ? (
          <p className="text-sm text-gray-500">Cargando excepciones...</p>
        ) : exceptions.length === 0 ? (
          <EmptyState
            title="Sin excepciones esta semana"
            description="Aquí aparecerán los días puntuales donde bloqueas o cambias tu horario habitual."
          />
        ) : (
          <div className="space-y-2">
            {exceptions.map((exc) => {
              const isBlockedDay = exc.start_time == null || exc.end_time == null;
              return (
                <div
                  key={exc.id}
                  className={`flex items-center justify-between rounded-lg pl-3 pr-2 py-2 ${
                    isBlockedDay
                      ? 'border-l-[3px] border-red-400'
                      : 'border-l-[3px] border-emerald-500'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {exc.specific_date ? formatExceptionDate(exc.specific_date) : '—'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isBlockedDay
                        ? 'Bloqueo total'
                        : `${formatTime(exc.start_time!)}–${formatTime(exc.end_time!)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(exc)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-nutri-medium"
                    >
                      <TbPencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(exc)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                    >
                      <TbTrash className="h-3.5 w-3.5" /> Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
