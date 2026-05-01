import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar } from '../../components/layout/AdminTopBar';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { ArticleCard, Article } from '../../components/ui/Articlecard';
import { ContentService, ContentItem, CONTENT_CATEGORIES, CONTENT_TYPES } from '../../services/Content/ContentService';

const SORT_OPTIONS = ['Más reciente', 'Más antiguo', 'A-Z', 'Z-A'];

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
  nutrition:    { color: 'bg-blue-500',   bg: 'bg-blue-50'   },
  hypertension: { color: 'bg-green-500',  bg: 'bg-green-50'  },
  recipes:      { color: 'bg-teal-500',   bg: 'bg-teal-50'   },
  exercise:     { color: 'bg-orange-500', bg: 'bg-orange-50' },
  lifestyle:    { color: 'bg-purple-500', bg: 'bg-purple-50' },
  tips:         { color: 'bg-red-500',    bg: 'bg-red-50'    },
};

function categoryLabel(value: string) {
  return CONTENT_CATEGORIES.find(c => c.value === value)?.label ?? value;
}

function typeLabel(value: string) {
  return CONTENT_TYPES.find(t => t.value === value)?.label ?? value;
}

// ── Modal de vista de contenido ──────────────────────────────────────────────

function ViewModal({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full text-white ${CATEGORY_STYLES[item.category]?.color ?? 'bg-gray-400'}`}>
                {categoryLabel(item.category)}
              </span>
              <span className="text-xs text-gray-400">{typeLabel(item.content_type)}</span>
              {item.is_premium && (
                <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⭐ Premium</span>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-800 leading-snug">{item.title}</h2>
          </div>
          <button onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition text-lg font-bold">
            ×
          </button>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 px-6 py-3 text-xs text-gray-400 border-b border-gray-50">
          <span>👁 {item.view_count} vistas</span>
          {item.tags && item.tags.length > 0 && (
            <span>🏷 {item.tags.join(', ')}</span>
          )}
          <span>📅 {item.created_at ? new Date(item.created_at).toLocaleDateString('es-EC') : '—'}</span>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          <p className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">{item.body}</p>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

function ContentPage() {
  const [activeNav, setActiveNav]         = useState('Contenido');
  const [activeStatus, setActiveStatus]   = useState('Todos');
  const [search, setSearch]               = useState('');
  const [sortOpen, setSortOpen]           = useState(false);
  const [sortBy, setSortBy]               = useState('Más reciente');
  const [items, setItems]                 = useState<ContentItem[]>([]);
  const [loading, setLoading]             = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewItem, setViewItem]           = useState<ContentItem | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    ContentService.getAllForAdmin({ q: search || undefined })
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (article: Article) => {
    setActionLoading(article.id);
    try { await ContentService.approve(article.id); load(); }
    catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (article: Article) => {
    setActionLoading(article.id);
    try { await ContentService.archive(article.id); load(); }
    catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  };

  const handleView = (article: Article) => {
    const raw = items.find(i => i.id === article.id) ?? null;
    setViewItem(raw);
  };

  // Filtrar
  let filtered = items.filter((item) => {
    if (activeStatus === 'Aprobados')  return item.is_approved && item.is_published;
    if (activeStatus === 'Pendientes') return !item.is_approved;
    return true;
  });

  // Ordenar por fecha de envío (created_at); A-Z/Z-A por título
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'A-Z')        return a.title.localeCompare(b.title);
    if (sortBy === 'Z-A')        return b.title.localeCompare(a.title);
    if (sortBy === 'Más antiguo') return (a.created_at ?? '').localeCompare(b.created_at ?? '');
    // "Más reciente" — orden de envío desc (ya viene así del backend, pero aplicamos igual)
    return (b.created_at ?? '').localeCompare(a.created_at ?? '');
  });

  const articles: Article[] = filtered.map((item) => {
    const style = CATEGORY_STYLES[item.category] ?? { color: 'bg-gray-500', bg: 'bg-gray-50' };
    return {
      id:            item.id,
      title:         item.title,
      body:          item.body,
      description:   item.tags?.join(', ') ?? categoryLabel(item.category),
      category:      categoryLabel(item.category),
      categoryColor: style.color,
      cardBg:        style.bg,
      status:        (item.is_published ? 'active' : 'draft') as 'active' | 'draft',
      date:          item.created_at
                     ? `Enviado: ${new Date(item.created_at).toLocaleDateString('es-EC')}`
                     : '—',
      is_approved:   item.is_approved,
      is_published:  item.is_published,
    };
  });

  const pendingCount  = items.filter(i => !i.is_approved).length;
  const approvedCount = items.filter(i => i.is_approved && i.is_published).length;

  const statusTabs = [
    { label: 'Todos',      count: items.length  },
    { label: 'Aprobados',  count: approvedCount  },
    { label: 'Pendientes', count: pendingCount    },
  ];

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <AdminTopBar title="Biblioteca de Contenido" />

      <div className="px-8 pb-8 pt-4">

        {/* Alerta pendientes */}
        {pendingCount > 0 && (
          <div className="mb-5 flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-xl px-4 py-3">
            <span className="text-lg">⏳</span>
            <span>
              Hay <strong>{pendingCount}</strong> contenido{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} de aprobación.
            </span>
          </div>
        )}

        {/* Filtros */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <SearchInput
              placeholder="Buscar por título…"
              value={search}
              onChange={setSearch}
              className="w-72"
            />
            <FilterTabs
              tabs={statusTabs}
              active={activeStatus}
              onChange={setActiveStatus}
              accentColor="red"
            />
          </div>

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

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-10 h-10 border-4 border-red-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No hay contenido"
            description="No se encontraron resultados para los filtros seleccionados."
            accentColor="red"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => (
              <div key={article.id} className={actionLoading === article.id ? 'opacity-60 pointer-events-none' : ''}>
                <ArticleCard
                  article={article}
                  onView={handleView}
                  onApprove={handleApprove}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de vista */}
      {viewItem && (
        <ViewModal item={viewItem} onClose={() => setViewItem(null)} />
      )}
    </AdminLayout>
  );
}

export default ContentPage;
