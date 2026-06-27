import React, { useState, useEffect } from 'react';
import {
  MdArticle,
  MdBarChart,
  MdLightbulb,
  MdRestaurant,
  MdVideocam,
  MdWorkspacePremium,
} from 'react-icons/md';
import { NutritionistLayout } from '../../components/layout/NutritionistLayout';
import {
  ContentService,
  ContentItem,
  CONTENT_TYPES,
  CONTENT_CATEGORIES,
} from '../../services/Content/ContentService';

// ── Estado visual de cada envío ──────────────────────────────────────────────

type SubmissionStatus = 'approved' | 'waiting';

function getStatus(item: ContentItem): SubmissionStatus {
  if (item.is_approved && item.is_published) return 'approved';
  return 'waiting';
}

const STATUS_CONFIG: Record<SubmissionStatus, { text: string; dot: string; badge: string }> = {
  approved: {
    text: 'Aprobado',
    dot: 'bg-nutri-medium',
    badge: 'bg-nutri-light text-nutri-dark border border-nutri-medium/30',
  },
  waiting: {
    text: 'En espera',
    dot: 'bg-gray-400',
    badge: 'bg-transparent text-gray-600 border border-gray-400',
  },
};

const CATEGORY_ACCENT: Record<string, string> = {
  nutrition: 'border-l-nutri-medium',
  hypertension: 'border-l-nutri-medium',
  recipes: 'border-l-nutri-medium',
  exercise: 'border-l-nutri-medium',
  lifestyle: 'border-l-nutri-medium',
  tips: 'border-l-nutri-medium',
};

const CONTENT_TYPE_ICON: Record<string, React.ReactNode> = {
  article: <MdArticle className="w-6 h-6" />,
  video: <MdVideocam className="w-6 h-6" />,
  infographic: <MdBarChart className="w-6 h-6" />,
  recipe: <MdRestaurant className="w-6 h-6" />,
  tip: <MdLightbulb className="w-6 h-6" />,
};

// ── Formulario vacío ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: '',
  body: '',
  category: '',
  content_type: '',
  tags: '',
  media_url: '',
  is_premium: false,
};

// ── Página ───────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    ContentService.getMy()
      .then((data) => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title || !form.body || !form.category || !form.content_type) {
      setError('Título, contenido, categoría y tipo son obligatorios.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await ContentService.create({
        title: form.title,
        body: form.body,
        category: form.category,
        content_type: form.content_type,
        tags: form.tags
          ? form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        media_url: form.media_url || undefined,
        is_premium: form.is_premium,
      });
      // Insertar el nuevo item al inicio de la lista sin recargar
      setItems((prev) => [created, ...prev]);
      setSuccess('Contenido enviado. Quedará en espera de aprobación del administrador.');
      setForm(EMPTY_FORM);
    } catch (err: any) {
      setError(err?.message ?? 'Error al crear el contenido.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <NutritionistLayout>
      <div className="px-8 py-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Recursos Educativos</h1>
        <p className="text-gray-500 text-sm mb-8">
          Crea contenido educativo para los pacientes. Cada envío quedará en espera de revisión por
          un administrador.
        </p>

        {/* ── Formulario ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10">
          <h2 className="text-base font-bold text-gray-700 mb-5">Nuevo contenido</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo</label>
                <select
                  name="content_type"
                  value={form.content_type}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-nutri-medium focus:border-nutri-medium"
                >
                  <option value="">Seleccionar…</option>
                  {CONTENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Categoría</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-nutri-medium focus:border-nutri-medium"
                >
                  <option value="">Seleccionar…</option>
                  {CONTENT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Título</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ej: Alimentación para hipertensión"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-nutri-medium focus:border-nutri-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Contenido</label>
              <textarea
                name="body"
                value={form.body}
                onChange={handleChange}
                rows={5}
                placeholder="Escribe el contenido educativo aquí…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-nutri-medium focus:border-nutri-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Tags <span className="font-normal text-gray-500">(separados por coma)</span>
                </label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="nutrición, hipertensión, tips"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-nutri-medium focus:border-nutri-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  URL de media
                </label>
                <input
                  name="media_url"
                  value={form.media_url}
                  onChange={handleChange}
                  placeholder="https://…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-nutri-medium focus:border-nutri-medium"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_premium"
                checked={form.is_premium}
                onChange={handleChange}
                className="w-4 h-4 accent-nutri-medium"
              />
              Contenido Premium
            </label>

            {error && <p className="text-red-500 text-xs">{error}</p>}
            {success && <p className="text-nutri-dark font-medium text-xs">{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-nutri-medium hover:bg-nutri-dark text-white text-sm font-semibold rounded-lg transition disabled:opacity-60"
            >
              {submitting ? 'Enviando…' : 'Enviar para revisión'}
            </button>
          </form>
        </div>

        {/* ── Mis envíos ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-700">Mis envíos</h2>
          {items.length > 0 && (
            <span className="text-xs text-gray-500">
              {items.length} recurso{items.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="w-8 h-8 border-4 border-nutri-medium border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            Aún no has enviado contenido.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => {
              const st = getStatus(item);
              const config = STATUS_CONFIG[st];
              const accent = CATEGORY_ACCENT[item.category] ?? 'border-l-gray-300';
              const icon = CONTENT_TYPE_ICON[item.content_type] ?? (
                <MdArticle className="w-6 h-6" />
              );
              const catLabel =
                CONTENT_CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category;
              const typeL =
                CONTENT_TYPES.find((t) => t.value === item.content_type)?.label ??
                item.content_type;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border border-gray-100 shadow-sm border-l-4 ${accent} p-5 flex flex-col gap-3 hover:shadow-md transition`}
                >
                  {/* Cabecera */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-nutri-dark shrink-0">{icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {typeL} · {catLabel}
                        </p>
                      </div>
                    </div>
                    {/* Badge de estado */}
                    <div
                      className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      {config.text}
                    </div>
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                    <span className="text-xs text-gray-500">
                      {item.created_at
                        ? `Enviado el ${new Date(item.created_at).toLocaleDateString('es-EC')}`
                        : '—'}
                    </span>
                    {item.is_premium && (
                      <span className="text-xs bg-nutri-light text-nutri-dark font-semibold border border-nutri-medium/30 px-2 py-0.5 rounded-full">
                        <MdWorkspacePremium className="w-3.5 h-3.5" />
                        Premium
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </NutritionistLayout>
  );
}
