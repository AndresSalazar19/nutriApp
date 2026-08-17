import { useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdBarChart, MdCalendarMonth, MdDescription, MdGroup, MdSms } from 'react-icons/md';
import { NutritionistLayout } from '../../components/layout/NutritionistLayout';
import { NutritionistTopBar } from '../../components/layout/NutritionistTopBar';
import { StatCard } from '../../components/ui/StatCard';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BarChart } from '../../components/charts/BarChart';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../routes/routes';
import { NutritionPlanService } from '../../services/NutritionPlans/NutritionPlanService';
import {
  NutritionistService,
  NutritionistDashboardData,
  NutritionistRecentPatient,
  NutritionistRecentPatientStatus,
} from '../../services/NutritionistService';

// ─── Config estática (sin datos) ───────────────────────────────────────────────

const weeklyBars = [
  { dataKey: 'adherencia', label: 'Adherencia', color: '#2D6A4F' },
  { dataKey: 'peso', label: 'Peso', color: '#52B788' },
  { dataKey: 'presion', label: 'Presión', color: '#9CA3AF' },
];

const statusLabel: Record<NutritionistRecentPatientStatus, string> = {
  active: 'Activo',
  at_risk: 'En riesgo',
  inactive: 'Inactivo',
};

const statusBadgeVariant: Record<
  NutritionistRecentPatientStatus,
  'active' | 'pending' | 'inactive' | 'revision'
> = {
  active: 'active',
  at_risk: 'revision',
  inactive: 'inactive',
};

function formatLastConsult(iso: string | null): string {
  if (!iso) return 'Sin consultas';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Sin consultas';

  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  const time = date.toLocaleTimeString('es-EC', { hour: 'numeric', minute: '2-digit' });

  if (diffDays <= 0) return `Hoy, ${time}`;
  if (diffDays === 1) return `Ayer, ${time}`;
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || '??';
}

type ChangeType = 'positive' | 'negative' | 'neutral';

interface StatsCardData {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string;
  change: string;
  changeType: ChangeType;
}

function buildStatsCards(stats: NutritionistDashboardData['stats'] | null): StatsCardData[] {
  return [
    {
      icon: <MdGroup className="w-5 h-5 text-nutri-dark" />,
      iconBg: 'bg-nutri-light text-nutri-dark',
      label: 'Pacientes Activos',
      value: stats ? String(stats.patients_active_total) : '—',
      change: stats ? `↑ ${stats.patients_new_this_month} este mes` : '',
      changeType: stats && stats.patients_new_this_month > 0 ? 'positive' : 'neutral',
    },
    {
      icon: <MdCalendarMonth className="w-5 h-5 text-nutri-dark" />,
      iconBg: 'bg-nutri-light text-nutri-dark',
      label: 'Citas de Hoy',
      value: stats ? String(stats.appointments_today_total) : '—',
      change: stats ? `${stats.appointments_today_pending} pendientes` : '',
      changeType: 'neutral',
    },
    {
      icon: <MdSms className="w-5 h-5 text-nutri-dark" />,
      iconBg: 'bg-nutri-light text-nutri-dark',
      label: 'Mensajes Nuevos',
      value: stats ? String(stats.unread_messages) : '—',
      change: stats ? `${stats.unread_messages} sin leer` : '',
      changeType: 'neutral',
    },
    {
      icon: <MdBarChart className="w-5 h-5 text-nutri-dark" />,
      iconBg: 'bg-nutri-light text-nutri-dark',
      label: 'Adherencia Media',
      value: stats && stats.average_adherence !== null ? `${stats.average_adherence}%` : '—',
      change:
        stats && stats.adherence_delta_vs_last_month !== null
          ? `${stats.adherence_delta_vs_last_month >= 0 ? '↑' : '↓'} ${Math.abs(stats.adherence_delta_vs_last_month)}% vs mes anterior`
          : '',
      changeType:
        stats && (stats.adherence_delta_vs_last_month ?? 0) >= 0 ? 'positive' : 'negative',
    },
  ];
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [pendingPlansCount, setPendingPlansCount] = useState<number | null>(null);
  const [dashboard, setDashboard] = useState<NutritionistDashboardData | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const greeting = user?.email ? `Bienvenido, ${user.email.split('@')[0]}` : 'Bienvenido';

  useEffect(() => {
    NutritionPlanService.listPending()
      .then((plans) => setPendingPlansCount(plans.length))
      .catch(() => setPendingPlansCount(null));
  }, []);

  useEffect(() => {
    let cancelled = false;

    NutritionistService.getDashboard()
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch(() => {
        if (!cancelled) setDashboard(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingDashboard(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const statsCards = buildStatsCards(dashboard?.stats ?? null);
  const recentPatients: NutritionistRecentPatient[] = dashboard?.recent_patients ?? [];
  const filteredPatients = recentPatients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <NutritionistLayout>
      {/* ── TopBar ── */}
      <NutritionistTopBar title="Panel Principal" searchValue={search} onSearchChange={setSearch} />

      <div className="px-8 py-6">
        {/* ── Saludo ── */}
        <div className="mb-5">
          <h2 className="text-base font-semibold text-gray-800">{greeting}</h2>
          <p className="text-gray-400 text-xs">Aquí está el resumen de tu práctica hoy</p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {statsCards.map((card) => (
            <StatCard key={card.label} {...card} isLoading={loadingDashboard} />
          ))}
        </div>

        {/* ── Gráfico + Pacientes recientes ── */}
        <div className="grid grid-cols-5 gap-5 mb-6">
          {/* Gráfico semanal */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Progreso Semanal de Pacientes</h3>
            {loadingDashboard ? (
              <div className="h-[200px] flex items-center justify-center text-gray-400 text-xs">
                Cargando...
              </div>
            ) : (
              <BarChart
                data={dashboard?.weekly_progress ?? []}
                bars={weeklyBars}
                xKey="dia"
                height={200}
                showLegend
              />
            )}
          </div>

          {/* Pacientes recientes */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Pacientes Recientes</h3>
              <button
                onClick={() => navigate(ROUTES.PATIENTS)}
                className="text-gray-900 font-medium text-xs hover:underline"
              >
                Ver todos →
              </button>
            </div>
            {loadingDashboard ? (
              <p className="text-center text-gray-400 text-xs py-4">Cargando pacientes...</p>
            ) : (
              <ul className="space-y-4">
                {filteredPatients.map((patient) => (
                  <li key={patient.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        initials={initialsOf(patient.name)}
                        color="bg-nutri-light text-nutri-dark font-bold"
                        size="md"
                      />
                      <div>
                        <p className="text-xs font-semibold text-gray-900 leading-tight">
                          {patient.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatLastConsult(patient.last_consult)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={statusBadgeVariant[patient.status]}
                      label={statusLabel[patient.status]}
                    />
                  </li>
                ))}
                {filteredPatients.length === 0 && (
                  <li className="text-center text-gray-400 text-xs py-4">Sin resultados</li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* ── Acciones rápidas ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Acciones Rápidas</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="primary" onClick={() => navigate(ROUTES.PATIENTS)}>
              Ver Pacientes
            </Button>
            <Button
              variant="outline"
              icon={<MdCalendarMonth className="w-4 h-4" />}
              onClick={() => navigate(ROUTES.AGENDA)}
            >
              Agendar Cita
            </Button>
            <Button
              variant="outline"
              icon={<MdDescription className="w-4 h-4" />}
              onClick={() => navigate(ROUTES.PLANS)}
            >
              Revisar Planes{pendingPlansCount ? ` (${pendingPlansCount})` : ''}
            </Button>
            <Button
              variant="outline"
              icon={<MdBarChart className="w-4 h-4" />}
              onClick={() => navigate(ROUTES.REPORTS)}
            >
              Ver Reportes
            </Button>
          </div>
        </div>
      </div>
    </NutritionistLayout>
  );
}
