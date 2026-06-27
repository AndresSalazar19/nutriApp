import React, { useState, useMemo, useEffect } from 'react';
import { MdMoreVert, MdSearch } from 'react-icons/md';
import { NutritionistLayout } from '../../components/layout/NutritionistLayout';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { PatientProfile } from '../../components/ui/PatientProfile';
import { useAuth } from '../../hooks/useAuth';
import { NutritionistService } from '../../services/NutritionistService';
import { Patient } from '../../components/mock/patientsMock';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

// ─── Row component ────────────────────────────────────────────────────────────

function PatientRow({ patient, onView }: { patient: Patient; onView: (p: Patient) => void }) {
  const statusVariant =
    patient.status === 'active' ? 'active' : patient.status === 'inactive' ? 'inactive' : 'pending';

  const adherenceColor =
    patient.adherence >= 80
      ? 'text-nutri-dark'
      : patient.adherence >= 60
        ? 'text-nutri-medium'
        : 'text-admin-accent';

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition group">
      {/* Paciente */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <Avatar
            initials={patient.initials}
            color="bg-nutri-light text-nutri-dark font-bold"
            size="md"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-nutri-medium transition">
              {patient.firstName} {patient.lastName}
            </p>
            <p className="text-xs text-gray-500">{patient.email}</p>
          </div>
        </div>
      </td>

      {/* ID */}
      {/* Estado */}
      <td className="py-3.5 px-4">
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
      </td>

      {/* Plan */}
      <td className="py-3.5 px-4">
        <Badge variant={patient.plan === 'Premium' ? 'premium' : 'basic'} label={patient.plan} />
      </td>

      {/* Adherencia */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                patient.adherence >= 80
                  ? 'bg-nutri-dark'
                  : patient.adherence >= 60
                    ? 'bg-nutri-medium'
                    : 'bg-admin-accent'
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
            className="px-3 py-1.5 bg-nutri-light text-nutri-dark text-xs font-semibold rounded-lg hover:bg-nutri-medium/20 transition"
          >
            Ver perfil
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition text-base">
            <MdMoreVert className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Filter + search
  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return patients.filter((p) => {
      const matchesSearch =
        !q ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.id.includes(q);

      return matchesSearch;
    });
  }, [patients, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    let isMounted = true;

    const fetchPatients = async () => {
      if (!user?.userId) {
        setPatients([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await NutritionistService.getAssignedPatients(user.userId);
        const mappedPatients: Patient[] = Array.isArray(response)
          ? response.map((item: any) => {
              const firstName = item.patient?.person?.first_name ?? '';
              const lastName = item.patient?.person?.last_name ?? '';
              const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

              return {
                id: String(item.patient?.id ?? ''),
                initials,
                color: 'bg-nutri-light text-nutri-dark font-bold',
                firstName,
                lastName,
                age: 0,
                gender: 'Masculino',
                email: item.patient?.email ?? '',
                phone: item.patient?.phone ?? '',
                status: item.is_active ? 'active' : 'inactive',
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
                nutritionalPlan: {
                  id: '',
                  name: '',
                  startDate: '',
                  calories: 0,
                  sodium: 0,
                  compliance: 0,
                },
              };
            })
          : [];

        if (isMounted) {
          setPatients(mappedPatients);
        }
      } catch (error) {
        console.error('Error cargando pacientes:', error);
        if (isMounted) {
          setPatients([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPatients();

    return () => {
      isMounted = false;
    };
  }, [user?.userId]);

  // ── Patient profile view ──
  if (selectedPatient) {
    return (
      <NutritionistLayout>
        <PatientProfile patient={selectedPatient} onBack={() => setSelectedPatient(null)} />
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
            onChange={(v) => {
              setSearch(v);
              setCurrentPage(1);
            }}
            className="w-64"
          />
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          {/* Table header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700">
              {loading
                ? 'Actualizando lista...'
                : `Total: ${filtered.length} paciente${filtered.length !== 1 ? 's' : ''}`}
            </h3>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-gray-400">
              {/* Spinner animado usando Tailwind */}
              <svg
                className="animate-spin h-8 w-8 mb-4 text-nutri-medium"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-sm font-medium text-gray-500">Cargando pacientes...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-gray-50">
                    {[
                      'Paciente',
                      'Estado',
                      'Plan',
                      'Adherencia',
                      'Última Consulta',
                      'Próxima Cita',
                      '',
                    ].map((h) => (
                      <th key={h} className="text-left pb-3 pt-3 px-4 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState
                          icon={<MdSearch className="w-12 h-12" />}
                          title="Sin resultados"
                          description="No se encontraron pacientes con los filtros aplicados."
                        />
                      </td>
                    </tr>
                  ) : (
                    paginated.map((p) => (
                      <PatientRow key={p.id} patient={p} onView={setSelectedPatient} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>
    </NutritionistLayout>
  );
}
