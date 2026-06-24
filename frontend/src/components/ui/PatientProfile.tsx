import React, { useState } from 'react';
import { Patient } from '../../components/mock/patientsMock';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { WeightChart } from '../../components/charts/WeightChart';
import { Modal } from './Modal';
import { AnthropometricForm, AnthropometricRecord } from './AnthropometricForm';

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
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p
        className={`text-2xl font-bold ${highlight ? bmiColor(parseFloat(value)) : 'text-gray-800'}`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Info tab ─────────────────────────────────────────────────────────────────

function InfoTab({
  patient,
  onAddMeasurement,
}: {
  patient: Patient;
  onAddMeasurement: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Información médica */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-800 text-sm">Información Médica</h4>
          <button className="text-green-600 text-xs hover:underline flex items-center gap-1">
            ✏️ Editar
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">
              Diagnóstico Principal
            </p>
            <p className="text-gray-600">{patient.diagnosis}</p>
          </div>
          {patient.additionalConditions.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">
                Condiciones adicionales
              </p>
              <ul className="text-gray-600 space-y-0.5">
                {patient.additionalConditions.map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">
              Alergias e intolerancias
            </p>
            <p className="text-gray-600">{patient.allergies}</p>
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
            ➕ Registrar medición
          </button>
        </div>
        <div className="grid grid-cols-6 gap-3">
          <Metric
            label="Peso"
            value={`${patient.weight}`}
            sub={`${patient.weightChange > 0 ? '+' : ''}${patient.weightChange} kg`}
          />
          <Metric label="Estatura" value={`${patient.height.toFixed(2)}`} sub="metros" />
          <Metric label="IMC" value={`${patient.bmi}`} sub={bmiLabel(patient.bmi)} highlight />
          <Metric label="Cintura" value={`${patient.waist}`} sub="cm" />
          <Metric label="Cadera" value={`${patient.hip}`} sub="cm" />
          <Metric label="% Grasa" value={`${patient.fatPercent}`} sub="%" />
        </div>
      </div>

      {/* Plan nutricional */}
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-800 text-sm">Plan Nutricional Actual</h4>
          <button type="button" className="text-green-600 text-xs hover:underline">
            Ver detalles →
          </button>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="font-semibold text-gray-800 text-sm mb-1">{patient.nutritionalPlan.name}</p>
          <p className="text-gray-400 text-xs mb-3">Creado: {patient.nutritionalPlan.startDate}</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5">Calorías/día</p>
              <p className="text-lg font-bold text-green-700">
                {patient.nutritionalPlan.calories.toLocaleString()} kcal
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5">Sodio/día</p>
              <p className="text-lg font-bold text-green-700">
                &lt; {patient.nutritionalPlan.sodium.toLocaleString()} mg
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5">Cumplimiento</p>
              <p className="text-lg font-bold text-green-700">
                {patient.nutritionalPlan.compliance}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder tabs ─────────────────────────────────────────────────────────

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-300">
      <span className="text-5xl mb-3">🚧</span>
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

  const [showAnthropometricForm, setShowAnthropometricForm] = useState(false);

  const handleSaveAnthropometric = (record: AnthropometricRecord) => {
    console.log('Medición antropométrica guardada:', record);
    // TODO: conectar con el backend cuando el endpoint esté listo
    setShowAnthropometricForm(false);
  };

  const statusVariant =
    patient.status === 'active' ? 'active' : patient.status === 'inactive' ? 'inactive' : 'pending';

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
          <Button variant="outline" icon={<span>💬</span>}>
            Mensaje
          </Button>
          <Button variant="primary" icon={<span>📅</span>}>
            Agendar
          </Button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition text-lg">
            ⋮
          </button>
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
                    <span>📧 {patient.email}</span>
                    <span>📱 {patient.phone}</span>
                  </div>
                  <Badge
                    variant={statusVariant}
                    label={
                      patient.status === 'active'
                        ? 'Activo'
                        : patient.status === 'inactive'
                          ? 'Inactivo'
                          : 'Pendiente'
                    }
                  />
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
            <Button variant="primary" icon={<span>🔔</span>}>
              Enviar Recordatorio
            </Button>
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {activeTab === 'Información' ? (
            <InfoTab patient={patient} onAddMeasurement={() => setShowAnthropometricForm(true)} />
          ) : (
            <PlaceholderTab label={activeTab} />
          )}
        </div>
      </div>

      {/* Modal de registro antropométrico */}
      <Modal
        isOpen={showAnthropometricForm}
        onClose={() => setShowAnthropometricForm(false)}
        title="Registro de Datos Antropométricos"
        size="lg"
      >
        <AnthropometricForm
          patientName={`${patient.firstName} ${patient.lastName}`}
          onCancel={() => setShowAnthropometricForm(false)}
          onSave={handleSaveAnthropometric}
        />
      </Modal>
    </div>
  );
}
