import React, { useState } from 'react';
import { MdRestaurantMenu, MdOutlineImage } from 'react-icons/md';
import { NutritionistLayout } from '../../components/layout/NutritionistLayout';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CreatePlanModal } from '../../components/ui/CreatePlanModal';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Toast, ToastType } from '../../components/ui/Toast';
import { usePendingNutritionPlans } from '../../hooks/useNutritionPlans';
import {
  NutritionPlanResponse,
  NutritionPlanService,
} from '../../services/NutritionPlans/NutritionPlanService';
import {
  formatDate,
  formatMacro,
  formatQuantity,
  groupMealsByDay,
  initialsFromName,
  mealFoodLabel,
  MACRO_FIELDS,
  MACRO_LABELS,
  MACRO_UNITS,
  MEAL_TYPE_LABELS,
  MICRO_FIELDS,
} from './planReviewHelpers';

// ─── Nutrition summary ──────────────────────────────────────────────────────

function MacroStat({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold text-gray-800">{formatMacro(value, unit)}</p>
      <p className="text-[11px] text-gray-400">{label}</p>
    </div>
  );
}

// ─── Plan card ──────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onReview,
}: {
  plan: NutritionPlanResponse;
  onReview: (plan: NutritionPlanResponse) => void;
}) {
  const patientName = plan.patient?.name ?? 'Paciente';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar initials={initialsFromName(patientName)} size="md" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{patientName}</p>
          <p className="text-xs text-gray-500 truncate">{plan.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="pending" label="Pendiente" />
            {plan.is_ai_generated && <Badge variant="basic" label="Generado con IA" />}
            <span className="text-xs text-gray-400">
              {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
            </span>
            {plan.nutrition_summary.daily_average.calories != null && (
              <span className="text-xs text-gray-400">
                · ~{formatMacro(plan.nutrition_summary.daily_average.calories, '')} kcal/día
              </span>
            )}
          </div>
        </div>
      </div>
      <Button variant="primary" onClick={() => onReview(plan)} className="flex-shrink-0">
        Revisar
      </Button>
    </div>
  );
}

// ─── Review modal ───────────────────────────────────────────────────────────

function ReviewModal({
  plan,
  onClose,
  onApproved,
  onRejected,
}: {
  plan: NutritionPlanResponse;
  onClose: () => void;
  onApproved: () => void;
  onRejected: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const dayGroups = groupMealsByDay(plan.meals);
  const imageUrl = NutritionPlanService.imageUrl(plan.source_image_path);

  async function handleApprove() {
    setSubmitting(true);
    setError(null);
    try {
      await NutritionPlanService.approve(plan.id);
      onApproved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!reason.trim()) {
      setError('Escribe un motivo para el rechazo.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await NutritionPlanService.reject(plan.id, reason.trim());
      onRejected();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Revisar plan alimenticio" size="lg">
      <div className="max-h-[70vh] overflow-y-auto -mx-1 px-1">
        {/* Patient + plan summary */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar initials={initialsFromName(plan.patient?.name ?? 'Paciente')} size="lg" />
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-900">{plan.patient?.name}</p>
            <p className="text-xs text-gray-500">{plan.patient?.email}</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{plan.title}</p>
            {plan.description && <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>}
          </div>
        </div>

        {/* Patient note + pantry photo */}
        {(plan.patient_notes || imageUrl) && (
          <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3 mb-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Foto de la despensa enviada por el paciente"
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400">
                <MdOutlineImage className="w-8 h-8" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Nota del paciente
              </p>
              <p className="text-sm text-gray-700">{plan.patient_notes || 'Sin nota adicional'}</p>
            </div>
          </div>
        )}

        {/* Nutrition summary */}
        {dayGroups.length > 0 && (
          <div className="bg-nutri-light/20 border border-nutri-light rounded-lg p-3 mb-4">
            <p className="text-xs font-semibold text-nutri-dark uppercase mb-2">
              Promedio diario del plan
            </p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">
              Macronutrientes
            </p>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-3">
              {MACRO_FIELDS.map((field) => (
                <MacroStat
                  key={field}
                  label={MACRO_LABELS[field]}
                  value={plan.nutrition_summary.daily_average[field]}
                  unit={MACRO_UNITS[field]}
                />
              ))}
            </div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">
              Micronutrientes
            </p>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {MICRO_FIELDS.map((field) => (
                <MacroStat
                  key={field}
                  label={MACRO_LABELS[field]}
                  value={plan.nutrition_summary.daily_average[field]}
                  unit={MACRO_UNITS[field]}
                />
              ))}
            </div>
            {plan.nutrition_summary.meals_missing_macro_data > 0 && (
              <p className="text-[11px] text-gray-400 mt-2">
                {plan.nutrition_summary.meals_missing_macro_data} comida
                {plan.nutrition_summary.meals_missing_macro_data !== 1 ? 's' : ''} sin datos
                nutricionales (alimento personalizado, no del catálogo) — no se incluyen en este
                promedio.
              </p>
            )}
          </div>
        )}

        {/* Meals by day */}
        <div className="space-y-4">
          {dayGroups.length === 0 && (
            <p className="text-sm text-gray-400">Este plan no tiene comidas registradas.</p>
          )}
          {dayGroups.map((group) => {
            const dayTotals = plan.nutrition_summary.by_day[String(group.day)];
            return (
              <div key={group.day}>
                <div className="flex items-baseline justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-800">{group.label}</h4>
                  {dayTotals && (
                    <span className="text-xs text-gray-400">
                      {formatMacro(dayTotals.calories, '')} kcal · P{' '}
                      {formatMacro(dayTotals.protein_g, 'g')} · C{' '}
                      {formatMacro(dayTotals.carbs_g, 'g')} · G {formatMacro(dayTotals.fat_g, 'g')}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {group.meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-nutri-dark mr-2">
                          {MEAL_TYPE_LABELS[meal.meal_type]}
                        </span>
                        <span className="text-sm text-gray-700">{mealFoodLabel(meal)}</span>
                        {meal.instructions && (
                          <p className="text-xs text-gray-400">{meal.instructions}</p>
                        )}
                      </div>
                      {formatQuantity(meal) && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatQuantity(meal)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reject reason form */}
        {showRejectForm && (
          <div className="mt-4">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Motivo del rechazo
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-medium"
              placeholder="Explica al paciente por qué se rechaza este plan..."
            />
          </div>
        )}

        {error && <p className="text-sm text-admin-accent mt-3">{error}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
        {!showRejectForm ? (
          <>
            <Button
              variant="outline-danger"
              onClick={() => setShowRejectForm(true)}
              disabled={submitting}
            >
              Rechazar
            </Button>
            <Button variant="success" onClick={handleApprove} disabled={submitting}>
              {submitting ? 'Aprobando...' : 'Aprobar plan'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => setShowRejectForm(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleReject} disabled={submitting}>
              {submitting ? 'Rechazando...' : 'Confirmar rechazo'}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

const PlansPage: React.FC = () => {
  const { plans, loading, error, refetch } = usePendingNutritionPlans();
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlanResponse | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    isVisible: false,
    message: '',
    type: 'success' as ToastType,
  });

  function showToast(message: string, type: ToastType) {
    setToastConfig({ isVisible: true, message, type });
  }

  function handleApproved() {
    setSelectedPlan(null);
    refetch();
    showToast('Plan aprobado y activado para el paciente', 'success');
  }

  function handleRejected() {
    setSelectedPlan(null);
    refetch();
    showToast('Plan rechazado', 'success');
  }

  function handleCreated() {
    setShowCreateModal(false);
    showToast('Plan creado y activado para el paciente', 'success');
  }

  return (
    <NutritionistLayout>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-8 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Planes por revisar</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {plans.length} plan{plans.length !== 1 ? 'es' : ''} generado
              {plans.length !== 1 ? 's' : ''} por IA esperando tu aprobación
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            Crear Plan
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {loading && (
            <div className="flex justify-center py-16">
              <Spinner size="lg" text="Cargando planes pendientes..." />
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-16 text-sm text-admin-accent">{error}</div>
          )}

          {!loading && !error && plans.length === 0 && (
            <EmptyState
              icon={<MdRestaurantMenu className="mx-auto" />}
              title="No hay planes pendientes"
              description="Cuando un paciente genere un plan alimenticio con IA, aparecerá aquí para tu revisión."
            />
          )}

          {!loading && !error && plans.length > 0 && (
            <div className="space-y-3 max-w-3xl">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onReview={setSelectedPlan} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPlan && (
        <ReviewModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onApproved={handleApproved}
          onRejected={handleRejected}
        />
      )}

      <CreatePlanModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
      />

      <Toast
        isVisible={toastConfig.isVisible}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={() => setToastConfig((prev) => ({ ...prev, isVisible: false }))}
      />
    </NutritionistLayout>
  );
};

export default PlansPage;
