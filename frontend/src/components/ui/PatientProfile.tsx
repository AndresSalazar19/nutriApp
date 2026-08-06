import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdCalendarMonth,
  MdConstruction,
  MdAdd,
  MdEdit,
  MdEmail,
  MdMoreVert,
  MdNotifications,
  MdPhone,
  MdSms,
} from 'react-icons/md';
import { Patient } from '../../components/mock/patientsMock';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { WeightChart } from '../../components/charts/WeightChart';
import { Modal } from './Modal';
import { AnthropometricForm, AnthropometricRecord } from './AnthropometricForm';
import { PatientDetail, PatientService } from '../../services/Patients/PatientService';
import { ROUTES } from '../../routes/routes';

function bmiColor(bmi: number) {
  if (bmi < 18.5) return 'text-blue-500';
  if (bmi < 25) return 'text-green-600';
  if (bmi < 30) return 'text-orange-500';
  return 'text-red-500';
}

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}

const TABS = ['Información', 'Progreso', 'Historial', 'Planes', 'Documentos'] as const;
type Tab = (typeof TABS)[number];

function Metric({
  label,
  value,
  sub,
  bmiValue,
}: {
  label: string;
  value: string;
  sub?: string;
  /** When set, colors the value by BMI range instead of the default gray. */
  bmiValue?: number | null;
}) {
  const colorClass =
    bmiValue != null && !Number.isNaN(bmiValue) ? bmiColor(bmiValue) : 'text-gray-800';

  return (
    <div className="bg-gray-50 rounded-xl p-4 text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Info tab ─────────────────────────────────────────────────────────────────

function InfoTab({
  patient,
  detail,
  onAddMeasurement,
  onEditNotes,
}: {
  patient: Patient;
  detail: PatientDetail | null;
  onAddMeasurement: () => void;
  onEditNotes: () => void;
}) {
  const weight = detail?.weight_kg ?? null;
  const height = detail?.height_m ?? null;
  const bmi = detail?.bmi ?? null;
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Información médica */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-800 text-sm">Información Médica</h4>
          <button
            onClick={onEditNotes}
            className="text-green-600 text-xs hover:underline flex items-center gap-1"
          >
            <MdEdit className="w-3.5 h-3.5" />
            Editar
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">
              Notas clínicas
            </p>
            <p className="text-gray-600">{detail?.clinical_notes || 'Sin notas registradas.'}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">
              Hipertensión
            </p>
            <p className="text-gray-600">
              {detail?.hypertension_diagnosed ? 'Diagnosticada' : 'No diagnosticada'}
              {detail?.systolic && detail?.diastolic
                ? ` · ${detail.systolic}/${detail.diastolic} mmHg`
                : ''}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">
              Medicamentos
            </p>
            {detail?.medications.length ? (
              <ul className="text-gray-600 space-y-0.5">
                {detail.medications.map((m) => (
                  <li key={m}>• {m}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">Ninguno registrado.</p>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">
              Alergias e intolerancias
            </p>
            <p className="text-gray-600">
              {detail?.allergies.length ? detail.allergies.join(', ') : 'Ninguna registrada.'}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">
              Restricciones dietéticas
            </p>
            <p className="text-gray-600">
              {detail?.dietary_restrictions.length
                ? detail.dietary_restrictions.join(', ')
                : 'Ninguna registrada.'}
            </p>
          </div>
        </div>
      </div>

      {/* Evolución de peso */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-800 text-sm">Evolución de Peso</h4>
          <div className="flex gap-1">
            {['1M', '3M', '6M'].map((r) => (
              <button
                key={r}
                className={`px-2 py-0.5 rounded text-xs font-medium transition
                ${r === '1M' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <WeightChart data={patient.weightHistory} goal={patient.weightGoal} />
      </div>

      {/* Datos antropométricos */}
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-800 text-sm">Datos Antropométricos</h4>
          <button
            onClick={onAddMeasurement}
            className="text-green-600 text-xs hover:underline flex items-center gap-1"
          >
            <MdAdd className="w-3.5 h-3.5" />
            Registrar medición
          </button>
        </div>
        <div className="grid grid-cols-6 gap-3">
          <Metric
            label="Peso"
            value={weight != null ? `${weight} kg` : '—'}
            sub={weight == null ? 'Sin registro' : undefined}
          />
          <Metric
            label="Estatura"
            value={height != null ? `${height.toFixed(2)} m` : '—'}
            sub={height == null ? 'Sin registro' : undefined}
          />
          <Metric
            label="IMC"
            value={bmi != null ? `${bmi}` : '—'}
            sub={bmi != null ? bmiLabel(bmi) : 'Faltan peso/estatura'}
            bmiValue={bmi}
          />
          <Metric label="Cintura" value={patient.waist ? `${patient.waist}` : '—'} sub="cm" />
          <Metric label="Cadera" value={patient.hip ? `${patient.hip}` : '—'} sub="cm" />
          <Metric
            label="% Grasa"
            value={patient.fatPercent ? `${patient.fatPercent}` : '—'}
            sub="%"
          />
        </div>
      </div>

      {/* Plan nutricional */}
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-800 text-sm">Plan Nutricional</h4>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Los planes de este paciente se revisan y aprueban desde la bandeja de Planes
            Nutricionales.
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.PLANS)} className="flex-shrink-0">
            Ir a Planes →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder tabs ─────────────────────────────────────────────────────────

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-300">
      <MdConstruction className="w-12 h-12 mb-3" />
      <p className="text-sm font-medium">Sección {label} en desarrollo</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface PatientProfileProps {
  patient: Patient;
  onBack: () => void;
}

export function PatientProfile({ patient, onBack }: PatientProfileProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Información');
  const navigate = useNavigate();

  const [showAnthropometricForm, setShowAnthropometricForm] = useState(false);
  const [detail, setDetail] = useState<PatientDetail | null>(null);
  const [savingMeasurement, setSavingMeasurement] = useState(false);
  const [measurementError, setMeasurementError] = useState<string | null>(null);

  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const [showNotesForm, setShowNotesForm] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const fetchDetail = React.useCallback(() => {
    PatientService.getDetail(patient.id)
      .then(setDetail)
      .catch((err) => console.error('Error cargando datos del paciente:', err));
  }, [patient.id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setShowActionsMenu(false);
      }
    }
    if (showActionsMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionsMenu]);

  const handleToggleFlag = async () => {
    setUpdatingStatus(true);
    try {
      await PatientService.updateFlag(patient.id, !detail?.priority_flag);
      fetchDetail();
    } catch (err) {
      console.error('Error actualizando prioridad:', err);
    } finally {
      setUpdatingStatus(false);
      setShowActionsMenu(false);
    }
  };

  const handleChangeStatus = async (status: 'active' | 'inactive' | 'at_risk') => {
    setUpdatingStatus(true);
    try {
      await PatientService.updateStatus(patient.id, status);
      fetchDetail();
    } catch (err) {
      console.error('Error actualizando estado:', err);
    } finally {
      setUpdatingStatus(false);
      setShowActionsMenu(false);
    }
  };

  const openNotesForm = () => {
    setNotesDraft(detail?.clinical_notes ?? '');
    setNotesError(null);
    setShowNotesForm(true);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesError(null);
    try {
      await PatientService.updateNotes(patient.id, notesDraft);
      fetchDetail();
      setShowNotesForm(false);
    } catch (err: any) {
      setNotesError(err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveAnthropometric = async (record: AnthropometricRecord) => {
    setSavingMeasurement(true);
    setMeasurementError(null);
    try {
      const weight_kg = record.weight.trim() ? parseFloat(record.weight) : undefined;
      const height_m = record.height.trim() ? parseFloat(record.height) : undefined;

      await PatientService.updateAnthropometrics(patient.id, {
        log_date: record.date,
        weight_kg,
        height_m,
        notes: record.notes.trim() || undefined,
      });

      fetchDetail();
      setShowAnthropometricForm(false);
    } catch (err: any) {
      setMeasurementError(err.message);
    } finally {
      setSavingMeasurement(false);
    }
  };

  const currentStatus = detail?.status ?? patient.status;
  const statusVariant =
    currentStatus === 'active' ? 'active' : currentStatus === 'inactive' ? 'inactive' : 'pending';
  const statusLabel =
    currentStatus === 'active' ? 'Activo' : currentStatus === 'inactive' ? 'Inactivo' : 'En riesgo';

  return (
    <div className="flex flex-col h-full">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Perfil del Paciente
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={<MdSms className="w-4 h-4" />}
            onClick={() => navigate(ROUTES.MESSAGES, { state: { patientId: patient.id } })}
          >
            Mensaje
          </Button>
          <Button
            variant="primary"
            icon={<MdCalendarMonth className="w-4 h-4" />}
            onClick={() => navigate(ROUTES.AGENDA, { state: { patientId: patient.id } })}
          >
            Agendar
          </Button>
          <div className="relative" ref={actionsMenuRef}>
            <button
              onClick={() => setShowActionsMenu((v) => !v)}
              aria-label="Más acciones"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition text-lg"
            >
              <MdMoreVert className="w-5 h-5" />
            </button>
            {showActionsMenu && (
              <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1">
                <button
                  onClick={handleToggleFlag}
                  disabled={updatingStatus}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  {detail?.priority_flag ? 'Quitar prioridad' : 'Marcar como prioritario'}
                </button>
                <div className="my-1 border-t border-gray-100" />
                <p className="px-4 pt-1 pb-0.5 text-[11px] font-semibold text-gray-400 uppercase">
                  Cambiar estado
                </p>
                {(['active', 'at_risk', 'inactive'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleChangeStatus(s)}
                    disabled={updatingStatus || currentStatus === s}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-40"
                  >
                    {s === 'active' ? 'Activo' : s === 'at_risk' ? 'En riesgo' : 'Inactivo'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* ── Patient header card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div
              className={`w-20 h-20 ${patient.color} rounded-full flex items-center justify-center
              text-white font-bold text-2xl flex-shrink-0 shadow-md`}
            >
              {patient.initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-0.5">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <p className="text-gray-400 text-sm mb-2">
                    ID: #{patient.id} · {patient.age} años · {patient.gender}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="inline-flex items-center gap-1">
                      <MdEmail className="w-4 h-4" />
                      {patient.email}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MdPhone className="w-4 h-4" />
                      {patient.phone}
                    </span>
                  </div>
                  <Badge variant={statusVariant} label={statusLabel} />
                  {detail?.priority_flag && <Badge variant="revision" label="Prioritario" />}
                </div>

                {/* Stats */}
                <div className="flex gap-6 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Adherencia</p>
                    <p
                      className={`text-3xl font-bold ${
                        patient.adherence >= 80
                          ? 'text-green-600'
                          : patient.adherence >= 60
                            ? 'text-orange-500'
                            : 'text-red-500'
                      }`}
                    >
                      {patient.adherence}%
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">
                      {patient.adherence >= 80
                        ? '↑ Excelente'
                        : patient.adherence >= 60
                          ? '→ Regular'
                          : '↓ Bajo'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Última consulta</p>
                    <p className="text-sm font-bold text-gray-800">
                      {patient.lastConsult.split(',')[0]}
                    </p>
                    <p className="text-xs text-gray-400">
                      {patient.lastConsult.split(',')[1]?.trim()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Próxima cita</p>
                    <p className="text-sm font-bold text-gray-800">
                      {patient.nextAppointment.split(',')[0]}
                    </p>
                    <p className="text-xs text-gray-400">
                      {patient.nextAppointment.split(',')[1]?.trim()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs + action */}
          <div className="flex items-center justify-between mt-5 border-t border-gray-100 pt-4">
            <div className="flex gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === tab
                      ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Button variant="primary" icon={<MdNotifications className="w-4 h-4" />} disabled>
              Enviar Recordatorio (próximamente)
            </Button>
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {activeTab === 'Información' ? (
            <InfoTab
              patient={patient}
              detail={detail}
              onAddMeasurement={() => setShowAnthropometricForm(true)}
              onEditNotes={openNotesForm}
            />
          ) : (
            <PlaceholderTab label={activeTab} />
          )}
        </div>
      </div>

      {/* Modal de registro antropométrico */}
      <Modal
        isOpen={showAnthropometricForm}
        onClose={() => {
          setShowAnthropometricForm(false);
          setMeasurementError(null);
        }}
        title="Registro de Datos Antropométricos"
        size="lg"
      >
        <AnthropometricForm
          patientName={`${patient.firstName} ${patient.lastName}`}
          onCancel={() => {
            setShowAnthropometricForm(false);
            setMeasurementError(null);
          }}
          onSave={handleSaveAnthropometric}
          submitting={savingMeasurement}
          error={measurementError}
        />
      </Modal>

      {/* Modal de edición de notas clínicas */}
      <Modal
        isOpen={showNotesForm}
        onClose={() => setShowNotesForm(false)}
        title="Editar Información Médica"
        size="md"
      >
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Notas clínicas
          </label>
          <textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            rows={5}
            placeholder="Diagnóstico, condiciones, observaciones relevantes..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 transition bg-white resize-none"
          />
          {notesError && <p className="text-sm text-admin-accent">{notesError}</p>}
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <Button variant="outline" onClick={() => setShowNotesForm(false)} disabled={savingNotes}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveNotes} disabled={savingNotes}>
              {savingNotes ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
