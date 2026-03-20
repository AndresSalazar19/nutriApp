import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar }  from '../../components/layout/AdminTopBar';
import { StatCard }     from '../../components/ui/StatCard';
import { Avatar }       from '../../components/ui/Avatar';
import { Badge }        from '../../components/ui/Badge';
import { Button }       from '../../components/ui/Button';
import { SearchInput }  from '../../components/ui/SearchInput';
import { FilterTabs }   from '../../components/ui/FilterTabs';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Pagination }   from '../../components/ui/Pagination';

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
  registrationDate: string;
}

const clientsMock: Client[] = [
  {
    id: '1', initials: 'MR', color: 'bg-green-500',
    name: 'María Rodríguez',   email: 'maria.r@email.com',
    nutritionist: { initials: 'AS', color: 'bg-green-500',  name: 'Dr. Alfonso Silva'   },
    subscription: 'premium', registrationDate: '05 Mar 2025',
  },
  {
    id: '2', initials: 'JG', color: 'bg-blue-500',
    name: 'Jorge Gutiérrez',   email: 'jorge.g@email.com',
    nutritionist: { initials: 'AS', color: 'bg-green-500',  name: 'Dr. Alfonso Silva'   },
    subscription: 'basic',   registrationDate: '12 Feb 2025',
  },
  {
    id: '3', initials: 'LC', color: 'bg-orange-400',
    name: 'Lucía Castro',      email: 'lucia.c@email.com',
    nutritionist: { initials: 'MG', color: 'bg-pink-500',   name: 'Dra. María García'   },
    subscription: 'premium', registrationDate: '28 Ene 2025',
  },
  {
    id: '4', initials: 'AP', color: 'bg-purple-500',
    name: 'Ana Pérez',         email: 'ana.p@email.com',
    nutritionist: null,
    subscription: 'basic',   registrationDate: '08 Nov 2025',
  },
  {
    id: '5', initials: 'RM', color: 'bg-red-500',
    name: 'Roberto Morales',   email: 'roberto.m@email.com',
    nutritionist: { initials: 'JR', color: 'bg-orange-500', name: 'Dr. Juan Rodríguez'  },
    subscription: 'premium', registrationDate: '15 Oct 2024',
  },
  {
    id: '6', initials: 'PS', color: 'bg-pink-500',
    name: 'Patricia Sánchez',  email: 'patricia.s@email.com',
    nutritionist: { initials: 'PM', color: 'bg-indigo-500', name: 'Dr. Pedro Morales'   },
    subscription: 'basic',   registrationDate: '22 Sep 2024',
  },
  {
    id: '7', initials: 'CF', color: 'bg-teal-500',
    name: 'Carlos Fernández',  email: 'carlos.f@email.com',
    nutritionist: { initials: 'ST', color: 'bg-purple-500', name: 'Dra. Sara Torres'    },
    subscription: 'premium', registrationDate: '07 Ago 2024',
  },
];

const statsCards = [
  {
    icon: '👥', iconBg: 'bg-blue-100',   label: 'Total Clientes',
    value: '347', change: '↑ 23 este mes',     changeType: 'positive' as const, accentColor: 'text-red-500',
  },
  {
    icon: '📋', iconBg: 'bg-purple-100', label: 'Suscripciones Activas',
    value: '289', change: '33% del total',      changeType: 'neutral'  as const, accentColor: 'text-red-500',
  },
  {
    icon: '🆕', iconBg: 'bg-green-100',  label: 'Nuevos este mes',
    value: '23',  change: '↑ 12% vs mes anterior', changeType: 'positive' as const, accentColor: 'text-red-500',
  },
  {
    icon: '🏅', iconBg: 'bg-yellow-100', label: 'Con Nutricionista',
    value: '334', change: '96% asignados',      changeType: 'positive' as const, accentColor: 'text-red-500',
  },
];

const STATUS_TABS = [
  { label: 'Todos'       },
  { label: 'Activos'     },
  { label: 'Sin asignar' },
];

function NutritionistCell({ nutritionist }: { nutritionist: Client['nutritionist'] }) {
  if (!nutritionist) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-orange-400 text-sm">⚠</span>
        <span className="text-orange-400 text-xs font-medium">Sin asignar</span>
        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">!</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Avatar initials={nutritionist.initials} color={nutritionist.color} size="sm" />
      <span className="text-gray-600 text-xs">{nutritionist.name}</span>
    </div>
  );
}

function ActionButtons({ client }: { client: Client }) {
  return (
    <div className="flex items-center gap-1">
      <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition" title="Ver">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
        </svg>
      </button>

      {client.nutritionist === null ? (
        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition" title="Asignar nutricionista">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
          </svg>
        </button>
      ) : (
        <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition" title="Editar">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          </svg>
        </button>
      )}

      <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition" title="Ver historial">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
        </svg>
      </button>
    </div>
  );
}

function ClientsPage() {
  const [activeNav, setActiveNav]       = useState('Clientes');
  const [activeTab, setActiveTab]       = useState('Todos');
  const [search, setSearch]             = useState('');
  const [currentPage, setCurrentPage]   = useState(1);

  const filtered = clientsMock.filter((c) => {
    const matchesTab =
      activeTab === 'Todos'        ? true :
      activeTab === 'Activos'      ? c.nutritionist !== null :
      activeTab === 'Sin asignar'  ? c.nutritionist === null : true;

    const q = search.toLowerCase();
    const matchesSearch =
      search === '' ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.nutritionist?.name.toLowerCase().includes(q) ?? false);

    return matchesTab && matchesSearch;
  });

  const columns: Column<Client>[] = [
    {
      key: 'cliente',
      header: 'Cliente',
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
      key: 'nutricionista',
      header: 'Nutricionista Asignado',
      render: (row) => <NutritionistCell nutritionist={row.nutritionist} />,
    },
    {
      key: 'suscripcion',
      header: 'Suscripción',
      render: (row) => (
        <Badge variant={row.subscription === 'premium' ? 'premium' : 'basic'} />
      ),
    },
    {
      key: 'registro',
      header: 'Registro',
      render: (row) => (
        <span className="text-gray-500 text-xs">{row.registrationDate}</span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (row) => <ActionButtons client={row} />,
    },
  ];

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <AdminTopBar title="Gestión de Clientes" />

      <div className="px-8 pb-8 pt-4">

        <div className="grid grid-cols-4 gap-4 mb-6">
          {statsCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <SearchInput
                placeholder="Buscar por nombre, email, nutricionista..."
                value={search}
                onChange={(v) => { setSearch(v); setCurrentPage(1); }}
                className="w-72"
              />
              <FilterTabs
                tabs={STATUS_TABS}
                active={activeTab}
                onChange={(t) => { setActiveTab(t); setCurrentPage(1); }}
                accentColor="red"
              />
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              Excel
            </button>
          </div>

          <DataTable
            columns={columns}
            data={filtered}
            keyExtractor={(row) => row.id}
            emptyIcon="👥"
            emptyTitle="No hay clientes"
            emptyDescription="No se encontraron resultados para tu búsqueda."
          />

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              Mostrando 1-{filtered.length} de 347 clientes
            </p>
            <Pagination current={currentPage} total={3} onChange={setCurrentPage} />
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default ClientsPage;