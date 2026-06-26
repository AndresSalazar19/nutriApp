import React, { useState } from 'react';
import {
  MdCalendarMonth,
  MdDirectionsRun,
  MdFavorite,
  MdFileDownload,
  MdMonitorWeight,
  MdPlaylistAddCheck,
} from 'react-icons/md';
import { NutritionistLayout } from '../../components/layout/NutritionistLayout';
import { Avatar } from '../../components/ui/Avatar';
import { LineChart } from '../../components/charts/LineChart';
import { MacroBarChart } from '../../components/charts/MacroBarChart';
import {
  REPORT_PATIENTS,
  getReportData,
  RANGE_OPTIONS,
  RangeOption,
  CorrelationCard,
  WeeklyActivity,
} from '../../components/mock/reportsMock';

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  subColor = 'text-gray-500',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-nutri-dark">{icon}</span>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{value}</p>
      {sub && <p className={`text-xs font-medium ${subColor}`}>{sub}</p>}
    </div>
  );
}

// ─── Correlation card ─────────────────────────────────────────────────────────

function CorrelCard({ card }: { card: CorrelationCard }) {
  const isPositive = card.positive;
  const bg = isPositive ? 'bg-nutri-bg border-nutri-light' : 'bg-admin-bg border-admin-light';
  const text = isPositive ? 'text-nutri-dark' : 'text-admin-dark';
  const val = isPositive ? 'text-nutri-medium' : 'text-admin-accent';

  return (
    <div className={`rounded-xl border p-3.5 ${bg}`}>
      <p className={`text-xs font-semibold mb-2 ${text}`}>{card.label}</p>
      <p className={`text-3xl font-bold mb-1 ${val}`}>
        {card.value > 0 ? '+' : ''}
        {card.value.toFixed(2)}
      </p>
      {card.description.split('\n').map((line, i) => (
        <p key={i} className="text-xs leading-tight text-gray-600">
          {line}
        </p>
      ))}
    </div>
  );
}

// ─── Activity bar ─────────────────────────────────────────────────────────────

function ActivityRow({ week, days, goal }: WeeklyActivity) {
  const pct = Math.min((days / goal) * 100, 100);
  const color = pct >= 80 ? 'bg-nutri-dark' : pct >= 50 ? 'bg-nutri-medium' : 'bg-admin-accent';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-10 flex-shrink-0">{week}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">{days} días</span>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [selectedId, setSelectedId] = useState(REPORT_PATIENTS[0].id);
  const [range, setRange] = useState<RangeOption>('Últimos 3 meses');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);

  const patient = REPORT_PATIENTS.find((p) => p.id === selectedId)!;
  const data = getReportData(selectedId);

  const adherenceChangeColor = data.adherenceChange >= 0 ? 'text-nutri-dark' : 'text-admin-accent';

  return (
    <NutritionistLayout>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Análisis de Progreso - Pacientes</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Visualización de métricas y tendencias de salud
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Patient selector */}
          <div className="relative">
            <button
              onClick={() => {
                setDropdownOpen((v) => !v);
                setRangeOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg
                text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <Avatar initials={patient.initials} color={patient.color} size="sm" />
              {patient.name}
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl border border-gray-100 shadow-xl z-20 py-1">
                {REPORT_PATIENTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedId(p.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition
                      ${p.id === selectedId ? 'text-green-700 font-semibold' : 'text-gray-700'}`}
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
                      ${r === range ? 'text-green-700 font-semibold' : 'text-gray-700'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 bg-nutri-medium hover:bg-nutri-dark text-white text-sm font-semibold rounded-lg transition shadow-sm">
            <MdFileDownload className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(dropdownOpen || rangeOpen) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setDropdownOpen(false);
            setRangeOpen(false);
          }}
        />
      )}

      <div className="px-6 py-4 space-y-3">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            icon={<MdMonitorWeight className="w-6 h-6" />}
            label="Pérdida de Peso"
            value={`-${data.weightLost} kg`}
            sub={`↓ ${data.weightLostPct}% del peso inicial`}
            subColor="text-green-500"
          />
          <StatCard
            icon={<MdFavorite className="w-6 h-6" />}
            label="Presión Arterial Actual"
            value={`${data.bloodPressureSys}/${data.bloodPressureDia}`}
            sub={data.bloodPressureNote}
            subColor={data.bloodPressureSys < 130 ? 'text-green-500' : 'text-orange-500'}
          />
          <StatCard
            icon={<MdPlaylistAddCheck className="w-6 h-6" />}
            label="Adherencia al Plan"
            value={`${data.adherence}%`}
            sub={`${data.adherenceChange >= 0 ? '↑' : '↓'} ${Math.abs(data.adherenceChange)}% vs mes anterior`}
            subColor={adherenceChangeColor}
          />
          <StatCard
            icon={<MdDirectionsRun className="w-6 h-6" />}
            label="Actividad Física"
            value={`${data.activityDays} días/semana`}
            sub={`→ ${data.activityNote} · Meta: ${data.activityGoal} días/sem`}
            subColor="text-gray-500"
          />
        </div>

        {/* ── Charts row 1: Weight + Blood Pressure ── */}
        <div className="grid grid-cols-2 gap-5">
          <Section title="Evolución del Peso" subtitle="Octubre 2025 – Enero 2026">
            <LineChart
              height={120}
              series={[
                {
                  data: data.weightHistory,
                  color: '#16a34a',
                  label: 'Peso (kg)',
                  fillOpacity: 0.1,
                },
              ]}
              goalLine={{ value: 70, color: '#f59e0b', label: 'Meta: 70 kg' }}
            />
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-green-600 inline-block rounded" /> Peso (kg)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-400 inline-block rounded border-dashed" /> Zona
                meta
              </span>
            </div>
          </Section>

          <Section title="Evolución de Presión Arterial" subtitle="Sistólica y Diastólica (mmHg)">
            <LineChart
              height={120}
              series={[
                { data: data.systolicHistory, color: '#ef4444', label: 'Sistólica' },
                {
                  data: data.diastolicHistory,
                  color: '#f97316',
                  label: 'Diastólica',
                  dashed: false,
                },
              ]}
              goalLine={{ value: 120, color: '#22c55e', label: 'Normal' }}
            />
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-500 inline-block rounded" /> Sistólica
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-orange-400 inline-block rounded" /> Diastólica
              </span>
            </div>
          </Section>
        </div>

        {/* ── Charts row 2: Macros + Correlations ── */}
        <div className="grid grid-cols-2 gap-5">
          <Section
            title="Distribución de Macronutrientes"
            subtitle="Promedio consumido vs. recomendado (últimos 30 días)"
          >
            <MacroBarChart data={data.macros} height={130} />
          </Section>

          <Section title="Análisis de Correlación" subtitle="Relación entre variables clave">
            <div className="grid grid-cols-3 gap-3">
              {data.correlations.map((c, i) => (
                <CorrelCard key={i} card={c} />
              ))}
            </div>
          </Section>
        </div>

        {/* ── Activity frequency ── */}
        <Section
          title="Frecuencia de Actividad Física"
          subtitle="Últimas 4 semanas"
          action={
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>Meta: {data.activityGoal} días/sem</span>
            </div>
          }
        >
          <div className="space-y-3 mt-1">
            {data.weeklyActivity.map((w) => (
              <ActivityRow key={w.week} {...w} />
            ))}
          </div>
        </Section>
      </div>
    </NutritionistLayout>
  );
}
