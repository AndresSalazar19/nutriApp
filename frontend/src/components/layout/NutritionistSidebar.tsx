import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../routes/routes';
import { useAuth } from '../../hooks/useAuth';
import { UserMenuPopover } from '../ui/UserMenuPopover';
 
// ─── Ítem de navegación ───────────────────────────────────────────────────────
 
interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}
 
const NAV_ITEMS: NavItem[] = [
  { label: 'Panel Principal',      icon: 'dashboard', route: ROUTES.HOME      },
  { label: 'Mis Pacientes',        icon: 'users',     route: ROUTES.PATIENTS  },
  { label: 'Planes Nutricionales', icon: 'plan',      route: ROUTES.PLANS     },
  { label: 'Agenda',               icon: 'agenda',    route: ROUTES.AGENDA    },
  { label: 'Análisis y Reportes',  icon: 'chart',     route: ROUTES.REPORTS   },
  { label: 'Mensajes',             icon: 'message',   route: ROUTES.MESSAGES, badge: 3 },
  { label: 'Recursos',             icon: 'book',      route: ROUTES.RESOURCES },
];
 
// ─── Íconos ───────────────────────────────────────────────────────────────────
 
const ICONS: Record<string, React.ReactNode> = {
  dashboard: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm8-8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
  users:     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
  plan:      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>,
  agenda:    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
  chart:     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>,
  message:   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>,
  book:      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>,
  lock:      <svg className="w-4 h-4 text-green-600 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>,
  settings:  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
};
 
// ─── Props ────────────────────────────────────────────────────────────────────
 
interface NutritionistSidebarProps {
  /** true = modo pendiente: todos los ítems bloqueados excepto "Panel Principal" */
  locked?: boolean;
}
 
// ─── Componente ───────────────────────────────────────────────────────────────
 
export function NutritionistSidebar({ locked = false }: NutritionistSidebarProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
 
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'NT';
  const display  = user?.email ?? 'Nutricionista';
 
  // En modo locked, solo el primer ítem (Panel Principal) es navegable
  const isItemLocked = (index: number) => locked && index !== 0;
 
  return (
    <aside className="w-52 bg-green-800 flex flex-col justify-between py-5 px-3 flex-shrink-0">
 
      {/* ── Logo ── */}
      <div>
        <div className="flex items-center gap-2 px-2 mb-7">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-base">🥗</span>
          </div>
          <span className="text-white font-bold text-base leading-none">NutrIA</span>
        </div>
 
        {/* ── Navegación ── */}
        <nav className="space-y-0.5">
          {NAV_ITEMS.map(({ label, icon, route, badge }, index) => {
            const itemLocked = isItemLocked(index);
            const isActive   = location.pathname === route && !itemLocked;
 
            return (
              <button
                key={label}
                onClick={() => !itemLocked && navigate(route)}
                disabled={itemLocked}
                title={itemLocked ? 'Disponible una vez verificada tu cuenta' : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition text-left
                  ${isActive
                    ? 'bg-green-600 text-white font-semibold'
                    : itemLocked
                      ? 'text-green-300 opacity-50 cursor-not-allowed'
                      : 'text-green-100 hover:bg-green-700 cursor-pointer'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {ICONS[icon]}
                  <span>{label}</span>
                </div>
 
                {/* Derecha: badge de mensajes O candado si está bloqueado */}
                {itemLocked ? (
                  ICONS.lock
                ) : badge && badge > 0 ? (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
 
      {/* ── Usuario + menú de configuración ── */}
      <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-green-700 transition">
        {/* Avatar + info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold leading-tight truncate max-w-[90px]">{display}</p>
            <p className="text-green-300 text-xs">Nutricionista</p>
          </div>
        </div>
 
        {/* Tuerca → abre UserMenuPopover */}
        <UserMenuPopover
          direction="up"
          align="right"
          trigger={
            <span className="text-green-300 hover:text-white transition p-1 rounded-full hover:bg-green-600">
              {ICONS.settings}
            </span>
          }
        />
      </div>
 
    </aside>
  );
}