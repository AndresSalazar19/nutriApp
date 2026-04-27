import React, { useState, useMemo } from 'react';
import { NutritionistLayout } from '../../components/layout/NutritionistLayout';
import { Avatar }             from '../../components/ui/Avatar';
import { Badge }              from '../../components/ui/Badge';
import { Button }             from '../../components/ui/Button';
import { SearchInput }        from '../../components/ui/SearchInput';
import { FilterTabs }         from '../../components/ui/FilterTabs';
import { Pagination }         from '../../components/ui/Pagination';
import { EmptyState }         from '../../components/ui/EmptyState';
import { PatientProfile }     from '../../components/ui/PatientProfile';
import { MOCK_PATIENTS, Patient, PatientStatus } from '../../components/mock/patientsMock';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

const STATUS_TABS = [
  { label: 'Todos' },
  { label: 'Activos' },
  { label: 'Pendientes' },
  { label: 'Inactivos' },
];

const STATUS_MAP: Record<string, PatientStatus | undefined> = {
  Activos:    'active',
  Pendientes: 'pending',
  Inactivos:  'inactive',
};

// ─── Row component ────────────────────────────────────────────────────────────

function PatientRow({
  patient,
  onView,
}: {
  patient: Patient;
  onView: (p: Patient) => void;
}) {
  const statusVariant =
    patient.status === 'active'   ? 'active'   :
    patient.status === 'inactive' ? 'inactive'  : 'pending';

  const adherenceColor =
    patient.adherence >= 80 ? 'text-green-600' :
    patient.adherence >= 60 ? 'text-orange-500' : 'text-red-500';

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition group">

      {/* Paciente */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <Avatar initials={patient.initials} color={patient.color} size="md" />
          <div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition">
              {patient.firstName} {patient.lastName}
            </p>
            <p className="text-xs text-gray-400">{patient.email}</p>
          </div>
        </div>
      </td>

      {/* ID */}
      <td className="py-3.5 px-4">
        <span className="text-xs text-gray-400 font-mono">#{patient.id}</span>
      </td>

      {/* Estado */}
      <td className="py-3.5 px-4">
        <Badge
          variant={statusVariant}
          label={patient.status === 'active' ? 'Activo' :
                 patient.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
        />
      </td>

      {/* Plan */}
      <td className="py-3.5 px-4">
        <Badge
          variant={patient.plan === 'Premium' ? 'premium' : 'basic'}
          label={patient.plan}
        />
      </td>

      {/* Adherencia */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                patient.adherence >= 80 ? 'bg-green-500' :
                patient.adherence >= 60 ? 'bg-orange-400' : 'bg-red-400'
              }`}
              style={{ width: `${patient.adherence}%` }}
            />
          </div>
          <span className={`text-xs font-bold ${adherenceColor}`}>{patient.adherence}%</span>
        </div>
      </td>

      {/* Última consulta */}
      <td className="py-3.5 px-4">
        <p className="text-xs text-gray-600">{patient.lastConsult}</p>
      </td>

      {/* Próxima cita */}
      <td className="py-3.5 px-4">
        <p className="text-xs text-gray-600">{patient.nextAppointment}</p>
      </td>

      {/* Acciones */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onView(patient)}
            className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg
              hover:bg-green-100 transition"
          >
            Ver perfil
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100
            text-gray-400 hover:text-gray-600 transition text-base">
            ⋮
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PatientsPage() {
  const [search,          setSearch]          = useState('');
  const [activeFilter,    setActiveFilter]    = useState('Todos');
  const [currentPage,     setCurrentPage]     = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Filter + search
  const filtered = useMemo(() => {
    const statusFilter = STATUS_MAP[activeFilter];
    return MOCK_PATIENTS.filter(p => {
      const matchesStatus = !statusFilter || p.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.id.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Tab counts
  const tabs = STATUS_TABS.map(t => ({
    ...t,
    count: t.label === 'Todos'
      ? MOCK_PATIENTS.length
      : MOCK_PATIENTS.filter(p => p.status === STATUS_MAP[t.label]).length,
  }));

  // Handle filter change → reset page
  function handleFilter(label: string) {
    setActiveFilter(label);
    setCurrentPage(1);
  }

  // ── Patient profile view ──
  if (selectedPatient) {
    return (
      <NutritionistLayout>
        <PatientProfile
          patient={selectedPatient}
          onBack={() => setSelectedPatient(null)}
        />
      </NutritionistLayout>
    );
  }

  // ── Patients list ──
  return (
    <NutritionistLayout>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">Mis Pacientes</h1>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Buscar paciente..."
            value={search}
            onChange={v => { setSearch(v); setCurrentPage(1); }}
            className="w-64"
          />
          <Button variant="primary" icon={<span className="text-sm">+</span>}>
            Nuevo Paciente
          </Button>
        </div>
      </div>

      <div className="px-8 py-6">

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Pacientes', value: MOCK_PATIENTS.length, icon: '👥', color: 'bg-blue-50 text-blue-700' },
            { label: 'Activos',         value: MOCK_PATIENTS.filter(p => p.status === 'active').length,   icon: '✅', color: 'bg-green-50 text-green-700' },
            { label: 'Pendientes',      value: MOCK_PATIENTS.filter(p => p.status === 'pending').length,  icon: '⏳', color: 'bg-orange-50 text-orange-700' },
            { label: 'Adherencia Media',
              value: `${Math.round(MOCK_PATIENTS.reduce((s, p) => s + p.adherence, 0) / MOCK_PATIENTS.length)}%`,
              icon: '📊', color: 'bg-purple-50 text-purple-700' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

          {/* Table header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <FilterTabs tabs={tabs} active={activeFilter} onChange={handleFilter} />
            <span className="text-xs text-gray-400">{filtered.length} paciente{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase border-b border-gray-50">
                  {['Paciente', 'ID', 'Estado', 'Plan', 'Adherencia', 'Última Consulta', 'Próxima Cita', ''].map(h => (
                    <th key={h} className="text-left pb-3 pt-3 px-4 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        icon="🔍"
                        title="Sin resultados"
                        description="No se encontraron pacientes con los filtros aplicados."
                      />
                    </td>
                  </tr>
                ) : (
                  paginated.map(p => (
                    <PatientRow key={p.id} patient={p} onView={setSelectedPatient} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>
    </NutritionistLayout>
  );
}
