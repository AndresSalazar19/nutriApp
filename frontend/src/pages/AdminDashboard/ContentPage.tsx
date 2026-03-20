import React, { useState } from 'react';
import { AdminLayout }  from '../../components/layout/AdminLayout';
import { AdminTopBar }  from '../../components/layout/AdminTopBar';
import { SearchInput }  from '../../components/ui/SearchInput';
import { FilterTabs }   from '../../components/ui/FilterTabs';
import { Button }       from '../../components/ui/Button';
import { EmptyState }   from '../../components/ui/EmptyState';
import { ArticleCard, Article } from '../../components/ui/Articlecard';

const articlesMock: Article[] = [
  {
    id: '1', title: 'Control de Sodio en la Dieta',
    description: 'Guía completa sobre cómo reducir el consumo de sodio...',
    category: 'Hipertensión', categoryColor: 'bg-green-500', cardBg: 'bg-green-50',
    status: 'active', date: 'Publicado: 5 Nov 2025',
  },
  {
    id: '2', title: 'Alimentos Ecuatorianos Saludables',
    description: 'Descubre los mejores alimentos locales para una dieta...',
    category: 'Nutrición', categoryColor: 'bg-blue-500', cardBg: 'bg-blue-50',
    status: 'active', date: 'Publicado: 3 Nov 2025',
  },
  {
    id: '3', title: 'Actividad Física y Presión Arterial',
    description: 'Cómo el ejercicio ayuda a controlar la hipertensión...',
    category: 'Ejercicio', categoryColor: 'bg-orange-500', cardBg: 'bg-orange-50',
    status: 'active', date: 'Publicado: 1 Nov 2025',
  },
  {
    id: '4', title: 'Índice Glucémico de Alimentos',
    description: 'Tabla completa de índice glucémico para personas con diabetes...',
    category: 'Diabetes', categoryColor: 'bg-purple-500', cardBg: 'bg-purple-50',
    status: 'draft', date: 'Última edición: Hoy',
  },
  {
    id: '5', title: '5 Desayunos Hiposódicos',
    description: 'Recetas deliciosas bajas en sodio para comenzar el día...',
    category: 'Recetas', categoryColor: 'bg-teal-500', cardBg: 'bg-teal-50',
    status: 'active', date: 'Publicado: 28 Oct 2025',
  },
  {
    id: '6', title: 'Factores de Riesgo Cardiovascular',
    description: 'Identifica y previene los principales factores de riesgo...',
    category: 'Prevención', categoryColor: 'bg-red-500', cardBg: 'bg-red-50',
    status: 'draft', date: 'Última edición: Ayer',
  },
];

const SECTION_TABS = ['Artículos', 'Recursos', 'Biblioteca'];

const STATUS_TABS = [
  { label: 'Todos',       count: 128 },
  { label: 'Publicados',  count: 96  },
  { label: 'Borradores',  count: 32  },
];

const SORT_OPTIONS = ['Más reciente', 'Más antiguo', 'A-Z', 'Z-A'];

function ContentPage() {
  const [activeNav, setActiveNav]     = useState('Contenido');
  const [section, setSection]         = useState('Artículos');
  const [activeStatus, setActiveStatus] = useState('Todos');
  const [search, setSearch]           = useState('');
  const [sortOpen, setSortOpen]       = useState(false);
  const [sortBy, setSortBy]           = useState('Más reciente');

  const filtered = articlesMock.filter((a) => {
    const matchesStatus =
      activeStatus === 'Todos'      ? true :
      activeStatus === 'Publicados' ? a.status === 'active' :
      activeStatus === 'Borradores' ? a.status === 'draft'  : true;

    const q = search.toLowerCase();
    const matchesSearch =
      search === '' ||
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <AdminTopBar title="Biblioteca de Contenido" />

      <div className="px-8 pb-8 pt-4">

        <div className="flex gap-6 border-b border-gray-200 mb-6">
          {SECTION_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setSection(tab)}
              className={`pb-2 text-sm font-semibold transition border-b-2 -mb-px ${
                section === tab
                  ? 'border-red-500 text-red-500'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <SearchInput
              placeholder="Buscar artículos por título, autor o categoría..."
              value={search}
              onChange={setSearch}
              className="w-72"
            />
            <FilterTabs
              tabs={STATUS_TABS}
              active={activeStatus}
              onChange={(t) => { setActiveStatus(t); }}
              accentColor="red"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition"
            >
              Ordenar
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </button>
            {sortOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSortBy(opt); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs transition ${
                      sortBy === opt ? 'text-red-500 font-semibold bg-red-50' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No hay artículos"
            description="No se encontraron resultados para tu búsqueda."
            accentColor="red"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onView={(a)     => console.log('Ver', a.id)}
                onEdit={(a)     => console.log('Editar', a.id)}
                onDownload={(a) => console.log('Descargar', a.id)}
              />
            ))}
          </div>
        )}

      </div>

    </AdminLayout>
  );
}

export default ContentPage;