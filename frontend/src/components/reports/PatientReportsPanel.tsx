import React, { useEffect, useState } from 'react';
import { MdCalendarMonth, MdFavorite, MdFileDownload, MdMonitorWeight } from 'react-icons/md';
import { Avatar } from '../ui/Avatar';
import { EmptyState } from '../ui/EmptyState';
import { Toast, ToastType } from '../ui/Toast';
import { LineChart } from '../charts/LineChart';
import { API_URL } from '../../config/api';
import {
  ReportService,
  PatientReportData,
  RangeKey,
  ReportType,
} from '../../services/ReportService';
import { NutritionPlanService } from '../../services/NutritionPlans/NutritionPlanService';

// ─── Range options ──────────────────────────────────────────────────────────

const RANGE_OPTIONS = ['Últimos 3 meses', 'Últimos 6 meses', 'Último año'] as const;
type RangeOption = (typeof RANGE_OPTIONS)[number];

const RANGE_TO_KEY: Record<RangeOption, RangeKey> = {
  'Últimos 3 meses': '3m',
  'Últimos 6 meses': '6m',
  'Último año': '1y',
};

// ─── Report type options ────────────────────────────────────────────────────

const REPORT_TYPE_OPTIONS: { value: ReportType; label: string }[] = [
  { value: 'progress', label: 'Reporte de progreso' },
  { value: 'clinical_history', label: 'Historia clínica' },
  { value: 'soap', label: 'SOAP nutricional' },
  { value: 'evolution', label: 'Evolución clínica' },
  { value: 'meal_plan', label: 'Plan alimentario' },
];

export interface ReportPatientOption {
  id: string;
  name: string;
  initials: string;
  color: string;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  subColor = 'text-gray-500',
  iconColorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  iconColorClass: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <span className={iconColorClass}>{icon}</span>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{value}</p>
      {sub && <p className={`text-xs font-medium ${subColor}`}>{sub}</p>}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5">
      <div className="mb-2">
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyChartMessage({ text }: { text: string }) {
  return <p className="text-xs text-gray-400 py-10 text-center">{text}</p>;
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export interface PatientReportsPanelProps {
  patients: ReportPatientOption[];
  patientsLoading: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  /** Brand palette for the UI chrome (icon accent, selected items, export button) —
   * 'nutri' (green) for the nutritionist pages, 'admin' (red) for the admin panel.
   * Doesn't affect the weight/BP chart colors, which are semantic (green = weight,
   * red/orange = systolic/diastolic) and stay the same regardless of theme. */
  accent?: 'nutri' | 'admin';
}

const ACCENT_STYLES = {
  nutri: {
    icon: 'text-nutri-dark',
    selectedText: 'text-green-700',
    button: 'bg-nutri-medium hover:bg-nutri-dark',
  },
  admin: {
    icon: 'text-admin-dark',
    selectedText: 'text-admin-medium',
    button: 'bg-admin-medium hover:bg-admin-dark',
  },
} as const;

/**
 * Patient selector + date-range + report-type pickers, stat cards, and
 * weight/BP charts, with a PDF export button. Shared between the
 * nutritionist Reports page (patients = their own assigned patients) and
 * the admin Reports page (patients = every patient in the system) — the
 * only difference between the two is which patient list gets passed in and
 * which layout wraps this panel.
 */
export function PatientReportsPanel({
  patients,
  patientsLoading,
  headerTitle = 'Análisis de Progreso - Pacientes',
  headerSubtitle = 'Visualización de métricas y tendencias de salud',
  emptyStateTitle = 'No hay pacientes disponibles',
  emptyStateDescription = 'Cuando haya pacientes registrados, podrás ver aquí sus reportes de progreso.',
  accent = 'nutri',
}: PatientReportsPanelProps) {
  const styles = ACCENT_STYLES[accent];
  const [selectedId, setSelectedId] = useState('');

  const [range, setRange] = useState<RangeOption>('Últimos 3 meses');
  const [reportType, setReportType] = useState<ReportType>('progress');
  const [hasActivePlan, setHasActivePlan] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  const [data, setData] = useState<PatientReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [toastConfig, setToastConfig] = useState<{
    isVisible: boolean;
    message: string;
    type: ToastType;
  }>({ isVisible: false, message: '', type: 'success' });

  // Default-select the first patient once the list arrives
  useEffect(() => {
    setSelectedId((current) => current || patients[0]?.id || '');
  }, [patients]);

  // Load real report data for the selected patient + range
  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      if (!selectedId) {
        setData(null);
        return;
      }

      setReportLoading(true);
      try {
        const result = await ReportService.getPatientReport(selectedId, RANGE_TO_KEY[range]);
        if (isMounted) setData(result);
      } catch (error) {
        console.error('Error cargando el reporte:', error);
        if (isMounted) {
          setData(null);
          setToastConfig({
            isVisible: true,
            message: 'No se pudo cargar el reporte de este paciente.',
            type: 'error',
          });
        }
      } finally {
        if (isMounted) setReportLoading(false);
      }
    }

    loadReport();
    return () => {
      isMounted = false;
    };
  }, [selectedId, range]);

  // Check whether the selected patient has an active plan (needed to offer "Plan alimentario")
  useEffect(() => {
    let isMounted = true;
    if (!selectedId) {
      setHasActivePlan(true);
      return;
    }
    NutritionPlanService.listForPatient(selectedId)
      .then((plans) => {
        const active = plans.some((p) => p.is_active);
        if (!isMounted) return;
        setHasActivePlan(active);
        setReportType((current) => (current === 'meal_plan' && !active ? 'progress' : current));
      })
      .catch(() => {
        if (isMounted) setHasActivePlan(true);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  async function handleExport() {
    if (!selectedId || exporting) return;

    setExporting(true);
    try {
      const report = await ReportService.generateReportPdf(
        selectedId,
        RANGE_TO_KEY[range],
        reportType,
      );
      window.open(`${API_URL.replace('/api/v1', '')}${report.file_url}`, '_blank');
      setToastConfig({ isVisible: true, message: 'Reporte generado con éxito.', type: 'success' });
    } catch (error) {
      console.error('Error generando el reporte PDF:', error);
      setToastConfig({
        isVisible: true,
        message: 'No se pudo generar el reporte en PDF.',
        type: 'error',
      });
    } finally {
      setExporting(false);
    }
  }

  const patient = patients.find((p) => p.id === selectedId) ?? null;

  const weightValue = reportLoading
    ? '...'
    : data?.weight_lost != null
      ? `-${data.weight_lost} kg`
      : 'Sin datos';
  const weightSub = reportLoading
    ? undefined
    : data?.weight_lost != null
      ? `↓ ${data.weight_lost_pct}% del peso inicial`
      : 'No hay suficientes registros de peso';

  const bpValue = reportLoading
    ? '...'
    : data?.blood_pressure_systolic != null
      ? `${data.blood_pressure_systolic}/${data.blood_pressure_diastolic}`
      : 'Sin datos';
  const bpSub = reportLoading
    ? undefined
    : (data?.blood_pressure_note ?? 'No hay registros de presión arterial');
  const bpColor =
    data?.blood_pressure_systolic != null
      ? data.blood_pressure_systolic < 130
        ? 'text-green-500'
        : 'text-orange-500'
      : 'text-gray-400';

  return (
    <>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{headerTitle}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{headerSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Patient selector */}
          <div className="relative">
            <button
              onClick={() => {
                if (patients.length === 0) return;
                setDropdownOpen((v) => !v);
                setRangeOpen(false);
                setTypeOpen(false);
              }}
              disabled={patients.length === 0}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg
                text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {patient && <Avatar initials={patient.initials} color={patient.color} size="sm" />}
              {patient ? patient.name : patientsLoading ? 'Cargando...' : 'Sin pacientes'}
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {dropdownOpen && patients.length > 0 && (
              <div className="absolute right-0 mt-1 w-52 max-h-80 overflow-y-auto bg-white rounded-xl border border-gray-100 shadow-xl z-20 py-1">
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedId(p.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition
                      ${p.id === selectedId ? `${styles.selectedText} font-semibold` : 'text-gray-700'}`}
                  >
                    <Avatar initials={p.initials} color={p.color} size="sm" />
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Range selector */}
          <div className="relative">
            <button
              onClick={() => {
                setRangeOpen((v) => !v);
                setDropdownOpen(false);
                setTypeOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg
                text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <MdCalendarMonth className="w-4 h-4 text-gray-500" />
              {range}
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {rangeOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-xl z-20 py-1">
                {RANGE_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRange(r);
                      setRangeOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition
                      ${r === range ? `${styles.selectedText} font-semibold` : 'text-gray-700'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Report type selector */}
          <div className="relative">
            <button
              onClick={() => {
                setTypeOpen((v) => !v);
                setDropdownOpen(false);
                setRangeOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg
                text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              {REPORT_TYPE_OPTIONS.find((o) => o.value === reportType)?.label}
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {typeOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl border border-gray-100 shadow-xl z-20 py-1">
                {REPORT_TYPE_OPTIONS.map((o) => {
                  const disabled = o.value === 'meal_plan' && !hasActivePlan;
                  return (
                    <button
                      key={o.value}
                      onClick={() => {
                        if (disabled) return;
                        setReportType(o.value);
                        setTypeOpen(false);
                      }}
                      disabled={disabled}
                      title={
                        disabled ? 'Este paciente no tiene un plan nutricional activo' : undefined
                      }
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition
                        ${o.value === reportType ? `${styles.selectedText} font-semibold` : 'text-gray-700'}
                        ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''}`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={!selectedId || exporting || (reportType === 'meal_plan' && !hasActivePlan)}
            className={`flex items-center gap-2 px-4 py-2 ${styles.button} text-white text-sm font-semibold rounded-lg transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <MdFileDownload className="w-4 h-4" />
            {exporting ? 'Generando...' : 'Exportar'}
          </button>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(dropdownOpen || rangeOpen || typeOpen) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setDropdownOpen(false);
            setRangeOpen(false);
            setTypeOpen(false);
          }}
        />
      )}

      {patientsLoading ? (
        <div className="px-6 py-16 text-center text-sm text-gray-400">Cargando pacientes...</div>
      ) : patients.length === 0 ? (
        <div className="px-6 py-4">
          <EmptyState title={emptyStateTitle} description={emptyStateDescription} />
        </div>
      ) : (
        <div className="px-6 py-4 space-y-3">
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<MdMonitorWeight className="w-6 h-6" />}
              iconColorClass={styles.icon}
              label="Pérdida de Peso"
              value={weightValue}
              sub={weightSub}
              subColor={data?.weight_lost != null ? 'text-green-500' : 'text-gray-400'}
            />
            <StatCard
              icon={<MdFavorite className="w-6 h-6" />}
              iconColorClass={styles.icon}
              label="Presión Arterial Actual"
              value={bpValue}
              sub={bpSub}
              subColor={bpColor}
            />
          </div>

          {/* ── Charts: Weight + Blood Pressure ── */}
          <div className="grid grid-cols-2 gap-5">
            <Section
              title="Evolución del Peso"
              subtitle="Registros de peso en el periodo seleccionado"
            >
              {reportLoading ? (
                <EmptyChartMessage text="Cargando..." />
              ) : data && data.weight_history.length > 0 ? (
                <>
                  <LineChart
                    height={120}
                    series={[
                      {
                        data: data.weight_history,
                        color: '#16a34a',
                        label: 'Peso (kg)',
                        fillOpacity: 0.1,
                      },
                    ]}
                  />
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-green-600 inline-block rounded" /> Peso (kg)
                    </span>
                  </div>
                </>
              ) : (
                <EmptyChartMessage text="Sin datos suficientes en este periodo." />
              )}
            </Section>

            <Section title="Evolución de Presión Arterial" subtitle="Sistólica y Diastólica (mmHg)">
              {reportLoading ? (
                <EmptyChartMessage text="Cargando..." />
              ) : data &&
                (data.systolic_history.length > 0 || data.diastolic_history.length > 0) ? (
                <>
                  <LineChart
                    height={120}
                    series={[
                      { data: data.systolic_history, color: '#ef4444', label: 'Sistólica' },
                      { data: data.diastolic_history, color: '#f97316', label: 'Diastólica' },
                    ]}
                  />
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-red-500 inline-block rounded" /> Sistólica
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-orange-400 inline-block rounded" /> Diastólica
                    </span>
                  </div>
                </>
              ) : (
                <EmptyChartMessage text="Sin datos suficientes en este periodo." />
              )}
            </Section>
          </div>
        </div>
      )}

      <Toast
        isVisible={toastConfig.isVisible}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={() => setToastConfig((prev) => ({ ...prev, isVisible: false }))}
      />
    </>
  );
}
