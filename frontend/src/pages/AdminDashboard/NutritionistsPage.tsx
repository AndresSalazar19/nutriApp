import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar } from '../../components/layout/AdminTopBar';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';

interface Nutritionist {
  id: string;
  initials: string;
  color: string;
  name: string;
  email: string;
  specialty: string;
  subSpecialty: string;
  clients: number;
  credential: string;
  credentialStatus: 'verified' | 'pending';
  status: 'active' | 'pending';
  // Datos extra para el modal
  fullName: string;
  licenseNumber: string;
  phone: string;
  yearsExperience: string;
  university: string;
}

const nutritionistsMock: Nutritionist[] = [
  {
    id: '1', initials: 'AS', color: 'bg-green-500',
    name: 'Dr. Alfonso Silva',    email: 'alfonso.silva@nutria.com',
    specialty: 'Hipertensión',    subSpecialty: 'Nutrición clínica',
    clients: 24, credential: 'Lic. MSP-2021-4567', credentialStatus: 'verified',
    status: 'active',
    fullName: 'Alfonso Javier Silva Mora', licenseNumber: 'LIC-NUT-2021-4567',
    phone: '+593 99 111 2222', yearsExperience: '12 años',
    university: 'Escuela Superior Politécnica del Litoral',
  },
  {
    id: '2', initials: 'MG', color: 'bg-pink-500',
    name: 'Dra. María García',    email: 'maria.garcia@nutria.com',
    specialty: 'Diabetes',        subSpecialty: 'Endocrinología',
    clients: 31, credential: 'Lic. MSP-2022-8901', credentialStatus: 'verified',
    status: 'active',
    fullName: 'María Elena García Ruiz', licenseNumber: 'LIC-NUT-2022-8901',
    phone: '+593 98 222 3333', yearsExperience: '9 años',
    university: 'Universidad San Francisco de Quito',
  },
  {
    id: '3', initials: 'JR', color: 'bg-orange-500',
    name: 'Dr. Juan Rodríguez',   email: 'juan.rodriguez@nutria.com',
    specialty: 'Obesidad',        subSpecialty: 'Nutrición deportiva',
    clients: 18, credential: 'Lic. MSP-2023-1234', credentialStatus: 'verified',
    status: 'active',
    fullName: 'Juan Pablo Rodríguez Vega', licenseNumber: 'LIC-NUT-2023-1234',
    phone: '+593 97 333 4444', yearsExperience: '6 años',
    university: 'Escuela Superior Politécnica del Litoral',
  },
  {
    id: '4', initials: 'LC', color: 'bg-teal-500',
    name: 'Dra. Laura Castro',    email: 'laura.castro@nutria.com',
    specialty: 'Deportiva',       subSpecialty: 'Nutrición deportiva',
    clients: 0,  credential: 'Documentos en revisión', credentialStatus: 'pending',
    status: 'pending',
    fullName: 'Laura María Castro Rodríguez', licenseNumber: 'LIC-NUT-2023-4567',
    phone: '+593 99 123 4567', yearsExperience: '8 años',
    university: 'Universidad Central del Ecuador',
  },
  {
    id: '5', initials: 'PM', color: 'bg-indigo-500',
    name: 'Dr. Pedro Morales',    email: 'pedro.morales@nutria.com',
    specialty: 'Cardiología',     subSpecialty: 'Nutrición cardiovascular',
    clients: 27, credential: 'Lic. MSP-2021-5678', credentialStatus: 'verified',
    status: 'active',
    fullName: 'Pedro Antonio Morales León', licenseNumber: 'LIC-NUT-2021-5678',
    phone: '+593 96 444 5555', yearsExperience: '15 años',
    university: 'Universidad de Guayaquil',
  },
  {
    id: '6', initials: 'ST', color: 'bg-purple-500',
    name: 'Dra. Sara Torres',     email: 'sara.torres@nutria.com',
    specialty: 'Pediatría',       subSpecialty: 'Nutrición infantil',
    clients: 22, credential: 'Lic. MSP-2022-3456', credentialStatus: 'verified',
    status: 'active',
    fullName: 'Sara Patricia Torres Salinas', licenseNumber: 'LIC-NUT-2022-3456',
    phone: '+593 95 555 6666', yearsExperience: '7 años',
    university: 'Escuela Superior Politécnica del Litoral',
  },
  {
    id: '7', initials: 'DF', color: 'bg-blue-700',
    name: 'Dr. Daniel Fernández', email: 'daniel.fernandez@nutria.com',
    specialty: 'Renal',           subSpecialty: 'Nefrología nutricional',
    clients: 0,  credential: 'Esperando aprobación', credentialStatus: 'pending',
    status: 'pending',
    fullName: 'Daniel Esteban Fernández Cruz', licenseNumber: 'LIC-NUT-2023-7890',
    phone: '+593 94 666 7777', yearsExperience: '3 años',
    university: 'Universidad Técnica Particular de Loja',
  },
];

function CredentialCell({ status, text }: { status: 'verified' | 'pending'; text: string }) {
  return (
    <div className="flex items-start gap-1">
      <span className={status === 'verified' ? 'text-green-500' : 'text-orange-400'}>
        {status === 'verified' ? '✓' : '⏳'}
      </span>
      <div>
        <p className={`text-xs font-medium ${status === 'verified' ? 'text-green-600' : 'text-orange-500'}`}>
          {status === 'verified' ? 'Verificado' : 'Pendiente'}
        </p>
        <p className="text-xs text-gray-400">{text}</p>
      </div>
    </div>
  );
}

function ActionButtons({
  nutritionist,
  onView,
}: {
  nutritionist: Nutritionist;
  onView: (n: Nutritionist) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {/* Ver */}
      <button
        onClick={() => onView(nutritionist)}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        title="Ver detalles"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Editar */}
      <button
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        title="Editar"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>

      {/* Acción según estado */}
      {nutritionist.status === 'pending' ? (
        <button
          onClick={() => onView(nutritionist)}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition"
          title="Revisar"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      ) : (
        <button
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition"
          title="Eliminar"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}

function ReviewModal({
  nutritionist,
  onClose,
}: {
  nutritionist: Nutritionist;
  onClose: () => void;
}) {
  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-gray-50">
        {value}
      </div>
    </div>
  );

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      {/* Header del modal */}
      <div className="flex items-center justify-between mb-6 -mt-1">
        <div className="flex items-center gap-3">
          <Avatar initials={nutritionist.initials} color={nutritionist.color} size="lg" />
          <div>
            <h3 className="font-bold text-gray-800 text-lg leading-tight">{nutritionist.fullName}</h3>
            <div className="mt-1">
              <Badge variant="pending" />
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition"
        >
          ×
        </button>
      </div>

      {/* Campos de información */}
      <div className="space-y-3">
        <InfoField label="Nombre Completo"    value={nutritionist.fullName} />
        <InfoField label="Número de Licencia" value={nutritionist.licenseNumber} />

        <div className="grid grid-cols-2 gap-3">
          <InfoField label="Teléfono"           value={nutritionist.phone} />
          <InfoField label="Años de Experiencia" value={nutritionist.yearsExperience} />
        </div>

        <InfoField label="Especialidad"  value={`${nutritionist.specialty} · ${nutritionist.subSpecialty}`} />
        <InfoField label="Universidad"   value={nutritionist.university} />
        <InfoField label="Correo Electrónico" value={nutritionist.email} />
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition flex items-center justify-center gap-2">
          <span>✕</span> Rechazar
        </button>
        <button className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition flex items-center justify-center gap-2">
          <span>✓</span> Aprobar
        </button>
      </div>
    </Modal>
  );
}

const TABS = [
  { label: 'Todos',      count: 15 },
  { label: 'Activos',    count: 13 },
  { label: 'Pendientes', count: 2  },
];

function NutritionistsPage() {
  const [activeNav, setActiveNav]         = useState('Nutricionistas');
  const [activeTab, setActiveTab]         = useState('Todos');
  const [search, setSearch]               = useState('');
  const [currentPage, setCurrentPage]     = useState(1);
  const [selectedNutritionist, setSelected] = useState<Nutritionist | null>(null);

  // Filtrado local
  const filtered = nutritionistsMock.filter((n) => {
    const matchesTab =
      activeTab === 'Todos'      ? true :
      activeTab === 'Activos'    ? n.status === 'active' :
      activeTab === 'Pendientes' ? n.status === 'pending' : true;

    const matchesSearch =
      search === '' ||
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.email.toLowerCase().includes(search.toLowerCase()) ||
      n.specialty.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Columnas de la tabla
  const columns: Column<Nutritionist>[] = [
    {
      key: 'nutricionista',
      header: 'Nutricionista',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar initials={row.initials} color={row.color} size="md" />
          <div>
            <p className="font-semibold text-gray-700 text-xs leading-tight">{row.name}</p>
            <p className="text-gray-400 text-xs">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'especialidad',
      header: 'Especialidad',
      render: (row) => (
        <div>
          <p className="text-xs font-medium text-gray-700">{row.specialty}</p>
          <p className="text-xs text-gray-400">{row.subSpecialty}</p>
        </div>
      ),
    },
    {
      key: 'clientes',
      header: 'Clientes',
      render: (row) => (
        <span className={`text-sm font-bold ${row.clients > 0 ? 'text-red-500' : 'text-gray-400'}`}>
          {row.clients}
        </span>
      ),
    },
    {
      key: 'credenciales',
      header: 'Credenciales',
      render: (row) => (
        <CredentialCell status={row.credentialStatus} text={row.credential} />
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => <Badge variant={row.status === 'active' ? 'active' : 'pending'} />,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (row) => (
        <ActionButtons nutritionist={row} onView={setSelected} />
      ),
    },
  ];

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      {/* TopBar */}
      <AdminTopBar title="Gestión de Nutricionistas" />

      <div className="px-8 pb-8 pt-4">

        {/* Barra de herramientas */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <SearchInput
              placeholder="Buscar por nombre, email o especialidad..."
              value={search}
              onChange={setSearch}
              className="w-72"
            />
            <span className="text-sm text-gray-400 font-medium">Filtrar por:</span>
            <FilterTabs
              tabs={TABS}
              active={activeTab}
              onChange={(tab) => { setActiveTab(tab); setCurrentPage(1); }}
              accentColor="red"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Exportar Excel */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Excel
            </button>
            {/* Agregar */}
            <Button variant="danger">
              + Agregar Nutricionista
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <DataTable
            columns={columns}
            data={filtered}
            keyExtractor={(row) => row.id}
            emptyIcon="🏥"
            emptyTitle="No hay nutricionistas"
            emptyDescription="No se encontraron resultados para tu búsqueda."
          />

          {/* Footer: total + paginación */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              Mostrando 1-{filtered.length} de {filtered.length} nutricionistas
            </p>
            <Pagination current={currentPage} total={3} onChange={setCurrentPage} />
          </div>
        </div>

      </div>

      {/* Modal de revisión */}
      {selectedNutritionist && (
        <ReviewModal
          nutritionist={selectedNutritionist}
          onClose={() => setSelected(null)}
        />
      )}
    </AdminLayout>
  );
}

export default NutritionistsPage;