import { useState, useEffect, useCallback } from 'react';
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
import { NutritionistService, NutritionistProfile } from '../../services/NutritionistService';
import { useAuth } from '../../hooks/useAuth';

// ─── View model ───────────────────────────────────────────────────────────────

type RowStatus = 'active' | 'pending' | 'rejected';

interface NutritionistRow {
  id: string;
  profileId: string;
  initials: string;
  color: string;
  name: string;
  email: string;
  specialty: string;
  credential: string;
  credentialStatus: 'verified' | 'pending';
  status: RowStatus;
  fullName: string;
  licenseNumber: string;
  phone: string;
  yearsExperience: string;
  education: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-admin-light'
];

function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function mapProfileToRow(p: NutritionistProfile): NutritionistRow {
  const firstName = p.user?.person?.first_name ?? '';
  const lastName  = p.user?.person?.last_name  ?? '';
  const fullName  = `${firstName} ${lastName}`.trim();
  const initials  = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '??';

  const rowStatus: RowStatus =
    p.status === 'verified' ? 'active' :
    p.status === 'rejected' ? 'rejected' : 'pending';

  return {
    id:               p.id,
    profileId:        p.id,
    initials,
    color:            getAvatarColor(fullName || p.id),
    name:             fullName || p.user?.email,
    email:            p.user?.email ?? '—',
    specialty:        p.specialty?.name ?? '—',
    credential:       p.license_number ?? '—',
    credentialStatus: p.status === 'verified' ? 'verified' : 'pending',
    status:           rowStatus,
    fullName,
    licenseNumber:    p.license_number ?? '—',
    phone:            p.user?.person?.phone ?? '—',
    yearsExperience:  p.years_experience != null ? `${p.years_experience} años` : '—',
    education:        p.education ?? '—',
  };
}

const PAGE_SIZE = 10;

// ─── CredentialCell ───────────────────────────────────────────────────────────

function CredentialCell({ status, text }: { status: 'verified' | 'pending'; text: string }) {
  return (
    <div className="flex items-start gap-1">
      <span className={status === 'verified' ? 'text-nutri-medium' : 'text-gray-400'}>
        {status === 'verified' ? '✓' : '⏳'}
      </span>
      <div>
        <p className={`text-xs font-medium ${status === 'verified' ? 'text-nutri-dark' : 'text-gray-600'}`}>
          {status === 'verified' ? 'Verificado' : 'Pendiente'}
        </p>
        <p className="text-xs text-gray-500 truncate max-w-[120px]">{text}</p>
      </div>
    </div>
  );
}

// ─── StatusBadge (tabla) ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RowStatus }) {
  if (status === 'active')   return <Badge variant="active" />;
  if (status === 'rejected') return <Badge variant="rejected" />;
  return <Badge variant="pending" />;
}

// ─── ActionButtons ────────────────────────────────────────────────────────────

function ActionButtons({
  row,
  onView,
  onQuickAction,
  loadingId,
}: {
  row: NutritionistRow;
  onView: (r: NutritionistRow) => void;
  onQuickAction: (profileId: string, action: 'verified' | 'rejected') => Promise<void>;
  loadingId: string | null;
}) {
  const busy = loadingId === row.id;

  return (
    <div className="flex items-center gap-1">
      {/* Ver detalles */}
      <button
        onClick={() => onView(row)}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        title="Ver detalles"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* PENDIENTE: botones de aprobar y rechazar */}
      {row.status === 'pending' && (
        <>
          <button
            disabled={busy}
            onClick={() => onQuickAction(row.id, 'rejected')}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-admin-light hover:bg-admin-medium/20 text-admin-accent disabled:opacity-40 transition"
            title="Rechazar"
          >
            {busy ? <span className="text-[10px]">…</span> : (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button
            disabled={busy}
            onClick={() => onQuickAction(row.id, 'verified')}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-nutri-light hover:bg-nutri-medium/20 text-nutri-dark disabled:opacity-40 transition"
            title="Aprobar"
          >
            {busy ? <span className="text-[10px]">…</span> : (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </>
      )}

    </div>
  );
}

// ─── ReviewModal ──────────────────────────────────────────────────────────────

interface ReviewModalProps {
  row: NutritionistRow;
  onClose: () => void;
  onAction: (profileId: string, action: 'verified' | 'rejected') => Promise<void>;
}

function ReviewModal({ row, onClose, onAction }: ReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleAction = async (action: 'verified' | 'rejected') => {
    setLoading(true);
    setError(null);
    try {
      await onAction(row.id, action);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-gray-50">
        {value}
      </div>
    </div>
  );

  const statusBadge = row.status === 'active'
    ? <Badge variant="active" />
    : row.status === 'rejected'
    ? <Badge variant="rejected" />
    : <Badge variant="pending" />;

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 -mt-1">
        <div className="flex items-center gap-3">
          <Avatar initials={row.initials} color={row.color} size="lg" />
          <div>
            <h3 className="font-bold text-gray-800 text-lg leading-tight">{row.fullName || row.name}</h3>
            <div className="mt-1">{statusBadge}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold text-sm transition"
        >
          ×
        </button>
      </div>

      {/* Datos */}
      <div className="space-y-3">
        <InfoField label="Nombre Completo"    value={row.fullName || '—'} />
        <InfoField label="Número de Licencia" value={row.licenseNumber} />
        <div className="grid grid-cols-2 gap-3">
          <InfoField label="Teléfono"            value={row.phone} />
          <InfoField label="Años de Experiencia" value={row.yearsExperience} />
        </div>
        <InfoField label="Especialidad"       value={row.specialty} />
        <InfoField label="Educación"          value={row.education} />
        <InfoField label="Correo Electrónico" value={row.email} />
      </div>

      {/* Error del backend */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Acciones según estado */}
      <div className="mt-6">
        {row.status === 'pending' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={loading}
              onClick={() => handleAction('rejected')}
              className="w-full py-3 rounded-xl bg-admin-dark hover:bg-admin-medium disabled:opacity-50 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? 'Procesando...' : <><span>✕</span> Rechazar</>}
            </button>
            <button
              disabled={loading}
              onClick={() => handleAction('verified')}
              className="w-full py-3 rounded-xl bg-nutri-medium hover:bg-nutri-dark disabled:opacity-50 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? 'Procesando...' : <><span>✓</span> Aprobar</>}
            </button>
          </div>
        )}

        {(row.status === 'active' || row.status === 'rejected') && (
          <p className="text-center text-xs text-gray-400 py-2">
            Solo se pueden revisar nutricionistas en estado pendiente.
          </p>
        )}
      </div>
    </Modal>
  );
}

// ─── NutritionistsPage ────────────────────────────────────────────────────────

function NutritionistsPage() {
  const { user } = useAuth();

  const [activeNav, setActiveNav]     = useState('Nutricionistas');
  const [activeTab, setActiveTab]     = useState('Todos');
  const [search, setSearch]           = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected]       = useState<NutritionistRow | null>(null);
  const [loadingId, setLoadingId]     = useState<string | null>(null);

  const [rows, setRows]       = useState<NutritionistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── Carga: incluye todos los estados ───────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // El endpoint sin filtro devuelve verified + pending.
      // Con status=rejected devuelve los rechazados.
      const [main, rejected] = await Promise.all([
        NutritionistService.getAll(),
        NutritionistService.getAll('rejected'),
      ]);

      // Deduplica por id por si acaso
      const seen = new Set<string>();
      const all  = [...main, ...rejected].filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      setRows(all.map(mapProfileToRow));
    } catch {
      setError('No se pudo cargar la lista de nutricionistas. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Tabs dinámicos ─────────────────────────────────────────────────────────

  const totalCount    = rows.length;
  const activeCount   = rows.filter(r => r.status === 'active').length;
  const pendingCount  = rows.filter(r => r.status === 'pending').length;
  const rejectedCount = rows.filter(r => r.status === 'rejected').length;

  const TABS = [
    { label: 'Todos',      count: totalCount    },
    { label: 'Activos',    count: activeCount   },
    { label: 'Pendientes', count: pendingCount  },
    { label: 'Rechazados', count: rejectedCount },
  ];

  // ── Filtrado ───────────────────────────────────────────────────────────────

  const filtered = rows.filter((r) => {
    const matchTab =
      activeTab === 'Activos'    ? r.status === 'active'   :
      activeTab === 'Pendientes' ? r.status === 'pending'  :
      activeTab === 'Rechazados' ? r.status === 'rejected' : true;

    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.specialty.toLowerCase().includes(q);

    return matchTab && matchSearch;
  });

  // ── Paginación ─────────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to   = Math.min(currentPage * PAGE_SIZE, filtered.length);

  // ── Acción: actualiza estado en la lista sin recargar ─────────────────────

  const handleAction = async (profileId: string, action: 'verified' | 'rejected') => {
    if (!user?.userId) throw new Error('Sin sesión activa');
    await NutritionistService.review(profileId, action, user.userId);

    setRows(prev => prev.map(r => {
      if (r.id !== profileId) return r;
      const newStatus: RowStatus = action === 'verified' ? 'active' : 'rejected';
      return {
        ...r,
        status:           newStatus,
        credentialStatus: action === 'verified' ? 'verified' : 'pending',
      };
    }));
  };

  // handleAction rápido (botones inline de la tabla)
  const handleQuickAction = async (profileId: string, action: 'verified' | 'rejected') => {
    setLoadingId(profileId);
    try {
      await handleAction(profileId, action);
    } catch {
      // error silencioso en botón rápido — el modal sí muestra errores
    } finally {
      setLoadingId(null);
    }
  };

  // ── Columnas ───────────────────────────────────────────────────────────────

  const columns: Column<NutritionistRow>[] = [
    {
      key: 'nutricionista',
      header: 'Nutricionista',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar initials={r.initials} color={r.color} size="md" />
          <div>
            <p className="font-semibold text-gray-900 text-xs leading-tight">{r.name}</p>
            <p className="text-gray-500 text-xs">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'especialidad',
      header: 'Especialidad',
      render: (r) => <span className="text-xs font-medium text-gray-900">{r.specialty}</span>,
    },
    {
      key: 'credenciales',
      header: 'Credenciales',
      render: (r) => <CredentialCell status={r.credentialStatus} text={r.credential} />,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (r) => (
        <ActionButtons
          row={r}
          onView={setSelected}
          onQuickAction={handleQuickAction}
          loadingId={loadingId}
        />
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <AdminTopBar title="Gestión de Nutricionistas" />

      <div className="px-8 pb-8 pt-4 bg-admin-bg">

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchData}
              className="text-xs font-semibold underline ml-4 hover:text-red-800"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Barra de herramientas */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <SearchInput
              placeholder="Buscar por nombre, email o especialidad..."
              value={search}
              onChange={(v) => { setSearch(v); setCurrentPage(1); }}
              className="w-72"
            />
            <span className="text-sm text-gray-500 font-medium">Filtrar por:</span>
            <FilterTabs
              tabs={TABS}
              active={activeTab}
              onChange={(tab) => { setActiveTab(tab); setCurrentPage(1); }}
              accentColor="admin"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Excel
            </button>
            <Button variant="danger">+ Agregar Nutricionista</Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <DataTable
            columns={columns}
            data={paginated}
            keyExtractor={(r) => r.id}
            isLoading={loading}
            emptyIcon="🏥"
            emptyTitle="No hay nutricionistas"
            emptyDescription="No se encontraron resultados para tu búsqueda."
          />

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-500">
              Mostrando {from}–{to} de {filtered.length} nutricionistas
            </p>
            <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
          </div>
        </div>

      </div>

      {/* Modal de detalle / acción */}
      {selected && (
        <ReviewModal
          row={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
        />
      )}
    </AdminLayout>
  );
}

export default NutritionistsPage;
