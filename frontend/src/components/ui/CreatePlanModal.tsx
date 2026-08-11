import React, { useEffect, useState } from 'react';
import { MdAdd, MdClose } from 'react-icons/md';
import { Modal } from './Modal';
import { Button } from './Button';
import { useAuth } from '../../hooks/useAuth';
import {
  PatientNutritionistPatient,
  PatientNutritionistService,
} from '../../services/PatientNutritionist/patientNutritionistService';
import { FoodPickerItem, FoodService } from '../../services/Foods/FoodService';
import {
  MealType,
  NutritionPlanResponse,
  NutritionPlanService,
} from '../../services/NutritionPlans/NutritionPlanService';
import { DAY_LABELS, MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from '../../pages/MainView/planReviewHelpers';

interface MealRow {
  clientId: string;
  mealType: MealType;
  foodId: string | null;
  foodName: string;
  quantityG: string;
  instructions: string;
}

function emptyMealsByDay(): Record<number, MealRow[]> {
  const result: Record<number, MealRow[]> = {};
  for (let day = 1; day <= 7; day++) result[day] = [];
  return result;
}

function newRow(): MealRow {
  return {
    clientId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    mealType: 'breakfast',
    foodId: null,
    foodName: '',
    quantityG: '',
    instructions: '',
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function FoodPickerInput({
  value,
  foodId,
  onChange,
}: {
  value: string;
  foodId: string | null;
  onChange: (foodName: string, foodId: string | null) => void;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<FoodPickerItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!showDropdown || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const handle = setTimeout(() => {
      FoodService.search(query)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, showDropdown]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
          onChange(e.target.value, null);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder="Buscar alimento del catálogo o escribir uno libre..."
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 ${
          foodId ? 'border-green-300 bg-green-50' : 'border-gray-200'
        }`}
      />
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((food) => (
            <button
              key={food.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setQuery(food.name);
                setShowDropdown(false);
                onChange(food.name, food.id);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 flex items-center justify-between gap-2"
            >
              <span className="truncate">{food.name}</span>
              {food.calories != null && (
                <span className="text-xs text-gray-400 flex-shrink-0">{Math.round(food.calories)} kcal</span>
              )}
            </button>
          ))}
        </div>
      )}
      {!foodId && query.trim() && (
        <p className="text-[11px] text-gray-400 mt-0.5">Alimento personalizado (no del catálogo)</p>
      )}
    </div>
  );
}

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (plan: NutritionPlanResponse) => void;
}

export function CreatePlanModal({ isOpen, onClose, onCreated }: CreatePlanModalProps) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientNutritionistPatient[]>([]);
  const [patientId, setPatientId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mealsByDay, setMealsByDay] = useState<Record<number, MealRow[]>>(emptyMealsByDay());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch once per session (opening/closing the modal repeatedly shouldn't
    // re-hit the network — the nutritionist's patient list rarely changes mid-session).
    if (!isOpen || !user?.userId || patients.length > 0) return;
    PatientNutritionistService.listPatientsByNutritionist(user.userId)
      .then(setPatients)
      .catch((err) => console.error('Error cargando pacientes:', err));
  }, [isOpen, user?.userId, patients.length]);

  useEffect(() => {
    if (isOpen) {
      setPatientId('');
      setTitle('');
      setDescription('');
      setMealsByDay(emptyMealsByDay());
      setError(null);
    }
  }, [isOpen]);

  function addRow(day: number) {
    setMealsByDay((prev) => ({ ...prev, [day]: [...prev[day], newRow()] }));
  }

  function removeRow(day: number, clientId: string) {
    setMealsByDay((prev) => ({
      ...prev,
      [day]: prev[day].filter((row) => row.clientId !== clientId),
    }));
  }

  function updateRow(day: number, clientId: string, patch: Partial<MealRow>) {
    setMealsByDay((prev) => ({
      ...prev,
      [day]: prev[day].map((row) => (row.clientId === clientId ? { ...row, ...patch } : row)),
    }));
  }

  async function handleSubmit() {
    if (!patientId) {
      setError('Selecciona un paciente.');
      return;
    }
    if (!title.trim()) {
      setError('Escribe un título para el plan.');
      return;
    }

    const meals = Object.entries(mealsByDay).flatMap(([day, rows]) =>
      rows
        .filter((row) => row.foodId || row.foodName.trim())
        .map((row) => ({
          day_of_week: Number(day),
          meal_type: row.mealType,
          food_id: row.foodId || undefined,
          custom_food: row.foodId ? undefined : row.foodName.trim(),
          quantity_g: row.quantityG.trim() ? Number(row.quantityG) : undefined,
          instructions: row.instructions.trim() || undefined,
        })),
    );

    if (meals.length === 0) {
      setError('Agrega al menos una comida al plan.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const plan = await NutritionPlanService.createManualPlan({
        patient_id: patientId,
        title: title.trim(),
        description: description.trim() || undefined,
        meals,
      });
      onCreated(plan);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Plan Nutricional" size="lg">
      <div className="max-h-[70vh] overflow-y-auto -mx-1 px-1 space-y-4">
        <Field label="Paciente">
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          >
            <option value="">— Seleccionar paciente —</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Título del plan">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Plan de mantenimiento"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </Field>
          <Field label="Descripción (opcional)">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas generales del plan"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </Field>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
            <div key={day} className="border border-gray-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-800">{DAY_LABELS[day]}</h4>
                <button
                  type="button"
                  onClick={() => addRow(day)}
                  className="text-green-600 text-xs hover:underline flex items-center gap-1"
                >
                  <MdAdd className="w-3.5 h-3.5" />
                  Agregar comida
                </button>
              </div>
              {mealsByDay[day].length === 0 && (
                <p className="text-xs text-gray-400">Sin comidas este día.</p>
              )}
              <div className="space-y-2">
                {mealsByDay[day].map((row) => (
                  <div
                    key={row.clientId}
                    className="grid grid-cols-12 gap-2 items-start bg-gray-50 rounded-lg p-2"
                  >
                    <select
                      value={row.mealType}
                      onChange={(e) =>
                        updateRow(day, row.clientId, { mealType: e.target.value as MealType })
                      }
                      className="col-span-2 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-green-500"
                    >
                      {MEAL_TYPE_ORDER.map((mt) => (
                        <option key={mt} value={mt}>
                          {MEAL_TYPE_LABELS[mt]}
                        </option>
                      ))}
                    </select>
                    <div className="col-span-6">
                      <FoodPickerInput
                        value={row.foodName}
                        foodId={row.foodId}
                        onChange={(foodName, foodId) =>
                          updateRow(day, row.clientId, { foodName, foodId })
                        }
                      />
                    </div>
                    <input
                      type="number"
                      value={row.quantityG}
                      onChange={(e) => updateRow(day, row.clientId, { quantityG: e.target.value })}
                      placeholder="g"
                      className="col-span-2 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-green-500"
                    />
                    <input
                      type="text"
                      value={row.instructions}
                      onChange={(e) =>
                        updateRow(day, row.clientId, { instructions: e.target.value })
                      }
                      placeholder="Instrucciones"
                      className="col-span-1 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-green-500 hidden md:block"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(day, row.clientId)}
                      className="col-span-1 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                      aria-label="Quitar comida"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-admin-accent">{error}</p>}
      </div>

      <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Creando...' : 'Crear Plan'}
        </Button>
      </div>
    </Modal>
  );
}
