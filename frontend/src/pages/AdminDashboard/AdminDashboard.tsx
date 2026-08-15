import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar } from '../../components/layout/AdminTopBar';
import { StatCard } from '../../components/ui/StatCard';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { NutritionistService, NutritionistProfile } from '../../services/NutritionistService';
import { AdminService, AdminDashboardStats, AdminActivityItem } from '../../services/AdminService';
import { ROUTES } from '../../routes/routes';
import {
  MdEmojiEvents,
  MdPeople,
  MdDescription,
  MdLocalFlorist,
  MdPersonAdd,
  MdGroup,
  MdLibraryBooks,
  MdBarChart,
  MdLocalHospital,
} from 'react-icons/md';

type ChangeType = 'positive' | 'negative' | 'neutral';

function buildStatsCards(stats: AdminDashboardStats | null) {
  return [
    {
      icon: MdEmojiEvents,
      iconBg: 'bg-admin-light',
      label: 'Nutricionistas',
      value: stats ? String(stats.nutritionists_total) : '—',
      change: stats ? `↑ ${stats.nutritionists_new_this_month} este mes` : '',
      changeType: (stats && stats.nutritionists_new_this_month > 0
        ? 'positive'
        : 'neutral') as ChangeType,
      accentColor: 'text-gray-900',
    },
    {
      icon: MdPeople,
      iconBg: 'bg-admin-light',
      label: 'Clientes Totales',
      value: stats ? String(stats.patients_total) : '—',
      change: stats ? `↑ ${stats.patients_new_this_month} este mes` : '',
      changeType: (stats && stats.patients_new_this_month > 0
        ? 'positive'
        : 'neutral') as ChangeType,
      accentColor: 'text-gray-900',
    },
    {
      icon: MdDescription,
      iconBg: 'bg-admin-light',
      label: 'Suscripciones Activas',
      value: stats ? String(stats.subscriptions_active) : '—',
      change: stats ? `${stats.subscription_rate}% tasa` : '',
      changeType: 'neutral' as ChangeType,
      accentColor: 'text-gray-900',
    },
    {
      icon: MdLocalFlorist,
      iconBg: 'bg-admin-light',
      label: 'Artículos Publicados',
      value: stats ? String(stats.content_published_total) : '—',
      change: stats ? `↑ ${stats.content_published_this_week} esta semana` : '',
      changeType: (stats && stats.content_published_this_week > 0
        ? 'positive'
        : 'neutral') as ChangeType,
      accentColor: 'text-gray-900',
    },
  ];
}

function formatActivityTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (diffDays <= 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
}

interface Nutritionist {
  id: string;
  initials: string;
  color: string;
  name: string;
  email: string;
  specialty: string;
  status: 'active' | 'pending';
}

const RECENT_NUTRITIONISTS_LIMIT = 7;

function mapProfileToNutritionist(p: NutritionistProfile): Nutritionist {
  const firstName = p.user?.person?.first_name ?? '';
  const lastName = p.user?.person?.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '??';

  return {
    id: p.id,
    initials,
    color: 'bg-admin-light',
    name: fullName || p.user?.email || '—',
    email: p.user?.email ?? '—',
    specialty: p.specialty?.name ?? '—',
    status: p.status === 'verified' ? 'active' : 'pending',
  };
}

function buildQuickActions(navigate: (route: string) => void) {
  return [
    {
      icon: MdPersonAdd,
      title: 'Agregar Nutricionista',
      desc: 'Revisar solicitudes',
      iconBg: 'bg-admin-light',
      onClick: () => navigate(ROUTES.ADMIN_NUTRITIONISTS),
    },
    {
      icon: MdGroup,
      title: 'Gestionar Pacientes',
      desc: 'Ver todos los usuarios',
      iconBg: 'bg-admin-light',
      onClick: () => navigate(ROUTES.ADMIN_CLIENTS),
    },
    {
      icon: MdLibraryBooks,
      title: 'Publicar Contenido',
      desc: 'Artículos y recursos',
      iconBg: 'bg-admin-light',
      onClick: () => navigate(ROUTES.ADMIN_CONTENT),
    },
    {
      icon: MdBarChart,
      title: 'Ver Reportes',
      desc: 'Estadísticas del sistema',
      iconBg: 'bg-admin-light',
      onClick: () => navigate(ROUTES.ADMIN_REPORTS),
    },
  ];
}

const columns: Column<Nutritionist>[] = [
  {
    key: 'nombre',
    header: 'Nombre',
    render: (row) => (
      <div className="flex items-center gap-2">
        <Avatar initials={row.initials} color={row.color} size="sm" />
        <div>
          {/* Aquí estaban los colores admin, ahora son grises/negros */}
          <p className="font-semibold text-gray-900 text-xs leading-tight">{row.name}</p>
          <p className="text-gray-500 text-xs">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'especialidad',
    header: 'Especialidad',
    render: (row) => <span className="text-gray-500 text-xs">{row.specialty}</span>,
  },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => <Badge variant={row.status === 'active' ? 'active' : 'pending'} />,
  },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('Panel Principal');
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [loadingNutritionists, setLoadingNutritionists] = useState(true);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    let cancelled = false;

    NutritionistService.getAll()
      .then((profiles) => {
        if (cancelled) return;
        setNutritionists(
          profiles.slice(0, RECENT_NUTRITIONISTS_LIMIT).map(mapProfileToNutritionist),
        );
      })
      .catch(() => {
        if (!cancelled) setNutritionists([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingNutritionists(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    AdminService.getDashboard()
      .then((dashboard) => {
        if (cancelled) return;
        setStats(dashboard.stats);
        setActivity(dashboard.activity);
      })
      .catch(() => {
        if (!cancelled) {
          setStats(null);
          setActivity([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDashboard(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const statsCards = buildStatsCards(stats);
  const quickActions = buildQuickActions(navigate);

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      {/* Top bar */}
      <AdminTopBar title="Panel de Administración" />

      <div className="bg-admin-bg px-8 pb-8 pt-2">
        {/* Bienvenida */}
        <p className="text-admin-dark font-medium mb-0.5">Bienvenido al panel administrativo</p>
        <p className="text-gray-500 text-sm mb-6">
          Gestiona nutricionistas, pacientes y contenido de la plataforma
        </p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-7">
          {statsCards.map((card) => (
            <StatCard
              key={card.label}
              {...card}
              isLoading={loadingDashboard}
              icon={<card.icon className="text-xl text-admin-dark" />}
            />
          ))}
        </div>

        {/* Grid inferior */}
        <div className="grid grid-cols-5 gap-6">
          {/* Tabla nutricionistas — 3 columnas */}
          <div className="col-span-3 bg-white rounded-xl border-none shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-base">Nutricionistas Recientes</h2>
              <button
                onClick={() => navigate(ROUTES.ADMIN_NUTRITIONISTS)}
                className="text-gray-900 font-medium text-sm hover:underline"
              >
                Ver todos →
              </button>
            </div>
            <DataTable
              columns={columns}
              data={nutritionists}
              keyExtractor={(row) => row.id}
              isLoading={loadingNutritionists}
              emptyTitle="No hay nutricionistas"
              emptyIcon={<MdLocalHospital className="w-12 h-12" />}
            />
          </div>

          {/* Columna derecha — 2 columnas */}
          <div className="col-span-2 flex flex-col gap-5">
            {/* Acciones rápidas */}
            <div className="bg-white rounded-xl border-none shadow-sm p-5">
              <h2 className="font-bold text-gray-800 text-base mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    onClick={action.onClick}
                    className="flex items-start gap-3 p-3 rounded-lg bg-admin-bg hover:bg-admin-light transition text-left"
                  >
                    <div
                      className={`w-9 h-9 ${action.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      <action.icon className="text-xl text-admin-dark" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-xs leading-tight">
                        {action.title}
                      </p>
                      <p className="text-gray-500 text-xs">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actividad del sistema */}
            <div className="bg-white rounded-xl border-none shadow-sm p-5">
              <h2 className="font-bold text-gray-800 text-base mb-4">Actividad del Sistema</h2>
              {loadingDashboard ? (
                <p className="text-gray-400 text-xs">Cargando actividad...</p>
              ) : activity.length === 0 ? (
                <p className="text-gray-400 text-xs">Sin actividad reciente.</p>
              ) : (
                <ul className="space-y-3">
                  {activity.map((item, i) => (
                    <li key={i} className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-900 mt-0.5 text-xs">•</span>
                        <span className="text-gray-900 text-xs">{item.text}</span>
                      </div>
                      <span className="text-gray-400 text-xs whitespace-nowrap">
                        {formatActivityTime(item.time)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
