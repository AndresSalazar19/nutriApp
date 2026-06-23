import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NutritionistLayout } from '../../components/layout/NutritionistLayout';
import { NutritionistTopBar } from '../../components/layout/NutritionistTopBar';
import { StatCard }           from '../../components/ui/StatCard';
import { Avatar }             from '../../components/ui/Avatar';
import { Badge }              from '../../components/ui/Badge';
import { Button }             from '../../components/ui/Button';
import { BarChart }           from '../../components/charts/BarChart';
import { useAuth }            from '../../hooks/useAuth';
import { ROUTES }             from '../../routes/routes';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PatientStatus = 'Excelente' | 'Regular' | 'Bueno' | 'Necesita seguimiento';

interface RecentPatient {
  id: string;
  initials: string;
  color: string;
  name: string;
  lastConsult: string;
  status: PatientStatus;
}

// ─── Datos mock (se reemplazarán por llamadas al backend) ─────────────────────

const statsCards = [
  { icon: <span className="text-nutri-dark">👥</span>, iconBg: 'bg-nutri-light text-nutri-dark',   label: 'Pacientes Activos', value: '24', change: '↑ 3 este mes',       changeType: 'positive' as const },
  { icon: <span className="text-nutri-dark">📅</span>, iconBg: 'bg-nutri-light text-nutri-dark', label: 'Citas de Hoy',      value: '5',  change: '2 pendientes',       changeType: 'neutral'  as const },
  { icon: <span className="text-nutri-dark">💬</span>, iconBg: 'bg-nutri-light text-nutri-dark',  label: 'Mensajes Nuevos',   value: '8',  change: '3 sin leer',         changeType: 'neutral'  as const },
  { icon: <span className="text-nutri-dark">📊</span>, iconBg: 'bg-nutri-light text-nutri-dark', label: 'Adherencia Media',  value: '87%',change: '↑ 5% vs mes anterior', changeType: 'positive' as const },
];

const weeklyData = [
  { dia: 'Lun', adherencia: 72, peso: 68, presion: 74 },
  { dia: 'Mar', adherencia: 78, peso: 67, presion: 71 },
  { dia: 'Mié', adherencia: 75, peso: 67, presion: 73 },
  { dia: 'Jue', adherencia: 82, peso: 66, presion: 70 },
  { dia: 'Vie', adherencia: 85, peso: 66, presion: 69 },
  { dia: 'Sáb', adherencia: 88, peso: 65, presion: 68 },
  { dia: 'Dom', adherencia: 91, peso: 65, presion: 67 },
];

const weeklyBars = [
  { dataKey: 'adherencia', label: 'Adherencia', color: '#2D6A4F' }, // nutri-dark
  { dataKey: 'peso',       label: 'Peso',       color: '#52B788' }, // nutri-accent
  { dataKey: 'presion',    label: 'Presión',    color: '#9CA3AF' }, // gray-400
];

const recentPatients: RecentPatient[] = [
  { id: '1', initials: 'MR', color: 'bg-nutri-light text-nutri-dark font-bold',  name: 'María Rodríguez', lastConsult: 'Hoy, 10:00 AM',      status: 'Excelente'          },
  { id: '2', initials: 'JG', color: 'bg-nutri-light text-nutri-dark font-bold',   name: 'Jorge Gutiérrez', lastConsult: 'Ayer, 3:30 PM',      status: 'Regular'            },
  { id: '3', initials: 'LC', color: 'bg-nutri-light text-nutri-dark font-bold', name: 'Lucía Castro',    lastConsult: 'Hace 2 días',        status: 'Bueno'              },
  { id: '4', initials: 'AP', color: 'bg-nutri-light text-nutri-dark font-bold', name: 'Ana Pérez',       lastConsult: 'Hace 5 días',        status: 'Necesita seguimiento' },
];

const statusBadgeVariant: Record<PatientStatus, 'active' | 'pending' | 'inactive' | 'revision'> = {
  'Excelente':            'active',
  'Bueno':                'active',
  'Regular':              'pending',
  'Necesita seguimiento': 'revision',
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function HomePage() {
  const [search, setSearch] = useState('');
  const { user }            = useAuth();
  const navigate            = useNavigate();

  const greeting = user?.email
    ? `Bienvenido, ${user.email.split('@')[0]} 👋`
    : 'Bienvenido 👋';

  const filteredPatients = recentPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <NutritionistLayout>

      {/* ── TopBar ── */}
      <NutritionistTopBar 
        title="Panel Principal" 
        searchValue={search} 
        onSearchChange={setSearch} 
      />

      <div className="px-8 py-6">

        {/* ── Saludo ── */}
        <div className="mb-5">
          <h2 className="text-base font-semibold text-gray-800">{greeting}</h2>
          <p className="text-gray-400 text-xs">Aquí está el resumen de tu práctica hoy</p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {statsCards.map(card => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* ── Gráfico + Pacientes recientes ── */}
        <div className="grid grid-cols-5 gap-5 mb-6">

          {/* Gráfico semanal */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Progreso Semanal de Pacientes</h3>
            <BarChart
              data={weeklyData}
              bars={weeklyBars}
              xKey="dia"
              height={200}
              showLegend
            />
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
            <ul className="space-y-4">
              {filteredPatients.map(patient => (
                <li key={patient.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={patient.initials} color={patient.color} size="md" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 leading-tight">{patient.name}</p>
                      <p className="text-xs text-gray-500">{patient.lastConsult}</p>
                    </div>
                  </div>
                  <Badge variant={statusBadgeVariant[patient.status]} label={patient.status} />
                </li>
              ))}
              {filteredPatients.length === 0 && (
                <li className="text-center text-gray-400 text-xs py-4">Sin resultados</li>
              )}
            </ul>
          </div>
        </div>

        {/* ── Acciones rápidas ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Acciones Rápidas</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="primary" onClick={() => navigate(ROUTES.PATIENTS)}>
              + Nuevo Paciente
            </Button>
            <Button variant="outline" onClick={() => navigate(ROUTES.AGENDA)}>
              📅 Agendar Cita
            </Button>
            <Button variant="outline" onClick={() => navigate(ROUTES.PLANS)}>
              📋 Crear Plan
            </Button>
            <Button variant="outline" onClick={() => navigate(ROUTES.REPORTS)}>
              📊 Ver Reportes
            </Button>
          </div>
        </div>

      </div>
    </NutritionistLayout>
  );
}