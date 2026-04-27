import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar } from '../../components/layout/AdminTopBar';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { ArticleCard, Article } from '../../components/ui/Articlecard';
import { ContentService, ContentItem } from '../../services/Content/ContentService';

const SECTION_TABS = ['Artículos', 'Recursos', 'Biblioteca'];

const STATUS_TABS = [
  { label: 'Todos',      count: 128 },
  { label: 'Publicados',  count: 96  },
  { label: 'Borradores',  count: 32  },
];

const SORT_OPTIONS = ['Más reciente', 'Más antiguo', 'A-Z', 'Z-A'];

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
  nutrition:    { color: 'bg-blue-500',   bg: 'bg-blue-50'   },
  hypertension: { color: 'bg-green-500',  bg: 'bg-green-50'  },
  recipes:      { color: 'bg-teal-500',   bg: 'bg-teal-50'   },
  exercise:     { color: 'bg-orange-500', bg: 'bg-orange-50' },
  lifestyle:    { color: 'bg-purple-500', bg: 'bg-purple-50' },
  tips:         { color: 'bg-red-500',    bg: 'bg-red-50'    },
};

function ContentPage() {
  // Estados de UI
  const [activeNav, setActiveNav]       = useState('Contenido');
  const [section, setSection]           = useState('Artículos');
  const [activeStatus, setActiveStatus] = useState('Todos');
  const [search, setSearch]             = useState('');
  const [sortOpen, setSortOpen]         = useState(false);
  const [sortBy, setSortBy]             = useState('Más reciente');

  // Estados de Datos
  const [items, setItems]               = useState<ContentItem[]>([]);
  const [loading, setLoading]           = useState(false);

  // Fetch de datos al cambiar la búsqueda
  useEffect(() => {
    setLoading(true);
    ContentService.getAll({ q: search || undefined })
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  // Mapeo y filtrado de datos para el componente UI
  const filtered: Article[] = items
    .filter((item) => {
      if (activeStatus === 'Publicados') return !!item.published_at;
      if (activeStatus === 'Borradores') return !item.published_at;
      return true;
    })
    .map((item) => {
      const style = CATEGORY_STYLES[item.category] ?? { color: 'bg-gray-500', bg: 'bg-gray-50' };
      return {
        id:            item.id,
        title:         item.title,
        description:   item.tags?.join(', ') ?? 'Sin descripción',
        category:      item.category,
        categoryColor: style.color,
        cardBg:        style.bg,
        status:        'active' as const, // Placeholder según lógica actual
        date:          item.published_at 
                       ? `Publicado: ${new Date(item.published_at).toLocaleDateString('es-EC')}` 
                       : 'Sin publicar',
      };
    });

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <AdminTopBar title="Biblioteca de Contenido" />

      <div className="px-8 pb-8 pt-4">
        
        {/* Tabs de Sección */}
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

        {/* Filtros y Búsqueda */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <SearchInput
              placeholder="Buscar artículos por título o categoría..."
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

          {/* Selector de Orden */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition"
            >
              Ordenar: {sortBy}
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

        {/* Contenido Principal */}
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-10 h-10 border-4 border-red-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No hay artículos"
            description="No se encontraron resultados para tu búsqueda o filtros seleccionados."
            accentColor="red"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onView={(a)  => console.log('Ver', a.id)}
                onEdit={(a)  => console.log('Editar', a.id)}
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