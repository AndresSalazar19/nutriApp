import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar } from '../../components/layout/AdminTopBar';
import { StatCard } from '../../components/ui/StatCard';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { AssignNutritionistModal } from '../../components/admin/AssignNutritionistModal';
import { PatientProfile } from '../../components/ui/PatientProfile';
import { Toast } from '../../components/ui/Toast';
import { Patient } from '../../components/mock/patientsMock';
import {
  PatientResponse,
  PatientService,
} from '../../services/PatientNutritionist/patientNutritionistService';
import {
  MdVisibility,
  MdEdit,
  MdHistory,
  MdPersonAdd,
  MdPeople,
  MdNewReleases,
  MdEmojiEvents,
  MdWarningAmber,
} from 'react-icons/md';

type SubscriptionType = 'premium' | 'basic';

interface Client {
  id: string;
  initials: string;
  color: string;
  name: string;
  email: string;
  nutritionist: {
    initials: string;
    color: string;
    name: string;
  } | null;
  subscription: SubscriptionType;
  registered_at: string;
}

function mapPatientToClient(p: PatientResponse): Client {
  const firstName = p.first_name?.trim() ?? '';
  const lastName = p.last_name?.trim() ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName.charAt(0) ?? ''}${lastName.charAt(0) ?? ''}`.toUpperCase() || 'P';
  const nutritionistName = p.nutritionist_name?.trim();

  return {
    id: p.user_id,
    initials,
    color: 'bg-admin-light',
    name: fullName || p.email,
    email: p.email,
    nutritionist: nutritionistName
      ? {
          name: nutritionistName,
          initials: p.nutritionist_initials?.trim() || '??',
          color: 'bg-admin-light',
        }
      : null,
    subscription: 'basic',
    registered_at: p.registered_at
      ? `${new Date(p.registered_at).toLocaleDateString('es-EC')} ${new Date(
          p.registered_at,
        ).toLocaleTimeString('es-EC', {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      : 'N/A',
  };
}

// Same placeholder-field pattern PatientsPage.tsx uses for its own profile
// mapping — the real data (weight, plans, history) is fetched live inside
// PatientProfile itself via PatientService.getDetail, this only covers the
// header fields the profile needs before that fetch resolves.
function mapPatientResponseToProfilePatient(p: PatientResponse): Patient {
  const firstName = p.first_name?.trim() ?? '';
  const lastName = p.last_name?.trim() ?? '';
  const initials = `${firstName.charAt(0) ?? ''}${lastName.charAt(0) ?? ''}`.toUpperCase() || 'P';

  return {
    id: p.user_id,
    initials,
    color: 'bg-admin-light',
    firstName,
    lastName,
    age: 0,
    gender: 'Masculino',
    email: p.email,
    phone: p.phone ?? '',
    status: p.status as Patient['status'],
    plan: 'Basic',
    adherence: 0,
    lastConsult: '—',
    nextAppointment: '—',
    diagnosis: '',
    additionalConditions: [],
    allergies: '',
    weight: 0,
    weightGoal: 0,
    height: 0,
    bmi: 0,
    waist: 0,
    hip: 0,
    fatPercent: 0,
    weightChange: 0,
    weightHistory: [],
    appointments: [],
    nutritionalPlan: { id: '', name: '', startDate: '', calories: 0, sodium: 0, compliance: 0 },
  };
}

const PAGE_SIZE = 10;

const STATUS_TABS = [{ label: 'Todos' }, { label: 'Activos' }, { label: 'Sin asignar' }];

type ChangeType = 'positive' | 'negative' | 'neutral';

interface StatsCardData {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  label: string;
  value: string;
  change: string;
  changeType: ChangeType;
  accentColor: string;
}

function buildStatsCards(clients: Client[], rawPatients: PatientResponse[]): StatsCardData[] {
  const total = clients.length;
  const assigned = clients.filter((c) => c.nutritionist !== null).length;
  const unassigned = total - assigned;

  const now = new Date();
  const newThisMonth = rawPatients.filter((p) => {
    if (!p.registered_at) return false;
    const d = new Date(p.registered_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return [
    {
      icon: MdPeople,
      iconBg: 'bg-admin-light',
      label: 'Total Pacientes',
      value: String(total),
      change: `${newThisMonth} nuevos este mes`,
      changeType: newThisMonth > 0 ? 'positive' : 'neutral',
      accentColor: 'text-gray-900',
    },
    {
      icon: MdNewReleases,
      iconBg: 'bg-admin-light',
      label: 'Nuevos este mes',
      value: String(newThisMonth),
      change: 'Registrados en el mes actual',
      changeType: 'neutral',
      accentColor: 'text-gray-900',
    },
    {
      icon: MdEmojiEvents,
      iconBg: 'bg-admin-light',
      label: 'Con Nutricionista',
      value: String(assigned),
      change: `${pct(assigned)}% del total`,
      changeType: assigned > 0 ? 'positive' : 'neutral',
      accentColor: 'text-gray-900',
    },
    {
      icon: MdWarningAmber,
      iconBg: 'bg-admin-light',
      label: 'Sin Asignar',
      value: String(unassigned),
      change: `${pct(unassigned)}% del total`,
      changeType: unassigned > 0 ? 'negative' : 'positive',
      accentColor: 'text-gray-900',
    },
  ];
}

function NutritionistCell({ nutritionist }: { nutritionist: Client['nutritionist'] }) {
  if (!nutritionist) {
    return (
      <div className="flex items-center gap-2">
        <MdWarningAmber className="w-4 h-4 text-gray-500" />
        <span className="text-gray-500 text-xs font-medium">Sin asignar</span>
        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-admin-accent text-white text-xs font-bold">
          !
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Avatar initials={nutritionist.initials} color={nutritionist.color} size="sm" />
      <span className="text-gray-900 text-xs">{nutritionist.name}</span>
    </div>
  );
}

function ActionButtons({
  client,
  onAssign,
  onView,
}: {
  client: Client;
  onAssign?: () => void;
  onView?: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {/* View */}
      <button
        onClick={onView}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        title="Ver"
      >
        <MdVisibility className="w-4 h-4" />
      </button>

      {/* Assign / Edit */}
      {client.nutritionist === null ? (
        <button
          onClick={onAssign}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-admin-dark hover:bg-admin-medium text-white transition"
          title="Asignar nutricionista"
        >
          <MdPersonAdd className="w-4 h-4" />
        </button>
      ) : (
        <button
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          title="Editar"
        >
          <MdEdit className="w-4 h-4" />
        </button>
      )}

      {/* History */}
      <button
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        title="Ver historial"
      >
        <MdHistory className="w-4 h-4" />
      </button>
    </div>
  );
}

function ClientsPage() {
  const [activeNav, setActiveNav] = useState('Pacientes');
  const [activeTab, setActiveTab] = useState('Todos');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [rawPatients, setRawPatients] = useState<PatientResponse[]>([]);
  const [selectedClient, setSelectedClient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [patientToAssign, setPatientToAssign] = useState<{ id: string; name: string } | null>(null);
  const [toastConfig, setToastConfig] = useState({
    isVisible: false,
    message: '',
    type: 'success' as const,
  });

  const loadClients = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const patients = await PatientService.getAll();
      setRawPatients(patients);
      setClients(patients.map(mapPatientToClient));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los pacientes.');
      setRawPatients([]);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchClients = async () => {
      if (!isMounted) return;
      await loadClients();
    };

    fetchClients();

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = clients
    .filter((c) => {
      const matchesTab =
        activeTab === 'Todos'
          ? true
          : activeTab === 'Activos'
            ? c.nutritionist !== null
            : activeTab === 'Sin asignar'
              ? c.nutritionist === null
              : true;

      const q = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.nutritionist?.name.toLowerCase().includes(q) ?? false);

      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      if (a.nutritionist && !b.nutritionist) return -1;
      if (!a.nutritionist && b.nutritionist) return 1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const statsCards = buildStatsCards(clients, rawPatients);

  const columns: Column<Client>[] = [
    {
      key: 'cliente',
      header: 'Cliente',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar initials={row.initials} color={row.color} size="md" />
          <div>
            <p className="font-semibold text-gray-900 text-xs leading-tight">{row.name}</p>
            <p className="text-gray-500 text-xs">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'nutricionista',
      header: 'Nutricionista Asignado',
      render: (row) => <NutritionistCell nutritionist={row.nutritionist} />,
    },
    {
      key: 'suscripcion',
      header: 'Suscripción',
      render: (row) => <Badge variant={row.subscription === 'premium' ? 'premium' : 'basic'} />,
    },
    {
      key: 'registro',
      header: 'Registro',
      render: (row) => <span className="text-gray-500 text-xs">{row.registered_at}</span>,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (row) => (
        <ActionButtons
          client={row}
          onView={() => {
            const raw = rawPatients.find((p) => p.user_id === row.id);
            if (raw) setSelectedClient(mapPatientResponseToProfilePatient(raw));
          }}
          onAssign={() => {
            setPatientToAssign({ id: row.id, name: row.name });
            setIsAssignModalOpen(true);
          }}
        />
      ),
    },
  ];

  if (selectedClient) {
    return (
      <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
        <PatientProfile patient={selectedClient} onBack={() => setSelectedClient(null)} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <AdminTopBar title="Gestión de Pacientes" />

      <div className="px-8 pb-6 pt-3 bg-admin-bg">
        <div className="grid grid-cols-4 gap-4 mb-4">
          {statsCards.map((card) => {
            const Icon = card.icon;

            return (
              <StatCard
                key={card.label}
                icon={<Icon className="w-5 h-5 text-admin-dark" />}
                iconBg={card.iconBg}
                label={card.label}
                value={card.value}
                change={card.change}
                changeType={card.changeType}
                accentColor={card.accentColor}
              />
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <SearchInput
              placeholder="Buscar por nombre, email, nutricionista..."
              value={search}
              onChange={(v) => {
                setSearch(v);
                setCurrentPage(1);
              }}
              className="w-72"
            />
            <FilterTabs
              tabs={STATUS_TABS}
              active={activeTab}
              onChange={(t) => {
                setActiveTab(t);
                setCurrentPage(1);
              }}
              accentColor="admin"
            />
          </div>

          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <DataTable
            columns={columns}
            data={paginated}
            keyExtractor={(row) => row.id}
            emptyIcon={<MdPeople className="w-12 h-12" />}
            emptyTitle="No hay pacientes"
            emptyDescription="No se encontraron resultados para tu búsqueda."
            isLoading={isLoading}
          />

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              Mostrando {from}-{to} de {filtered.length} pacientes
            </p>
            <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
          </div>
        </div>
      </div>
      {patientToAssign && (
        <AssignNutritionistModal
          isOpen={isAssignModalOpen}
          patientId={patientToAssign.id}
          patientName={patientToAssign.name}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={() => {
            setToastConfig({
              isVisible: true,
              message: '¡Nutricionista asignado con éxito!',
              type: 'success',
            });
            loadClients();
          }}
        />
      )}
      <Toast
        isVisible={toastConfig.isVisible}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={() => setToastConfig((prev) => ({ ...prev, isVisible: false }))}
      />
    </AdminLayout>
  );
}

export default ClientsPage;
