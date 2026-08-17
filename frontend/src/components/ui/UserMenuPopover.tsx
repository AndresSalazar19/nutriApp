import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES, buildRoute } from '../../routes/routes';

// ─── Íconos inline ────────────────────────────────────────────────────────────

const IconProfile = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
      clipRule="evenodd"
    />
  </svg>
);

const IconLogout = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserMenuPopoverProps {
  /** Posicionamiento del popover: 'up' abre hacia arriba (sidebar), 'down' hacia abajo (topbar) */
  direction?: 'up' | 'down';
  /** Alineación horizontal: 'left' o 'right' */
  align?: 'left' | 'right';
  /** Render del trigger (el botón que abre el menú) */
  trigger: React.ReactNode;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function UserMenuPopover({
  direction = 'up',
  align = 'left',
  trigger,
}: UserMenuPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Cierra al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Cierra con Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const positionClass = [
    direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2',
    align === 'right' ? 'right-0' : 'left-0',
  ].join(' ');

  return (
    <div className="relative w-full block" ref={ref}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        role="button"
        tabIndex={0}
        className="w-full block items-center justify-center rounded-full transition focus:outline-none cursor-pointer"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </div>

      {/* Popover */}
      {open && (
        <div
          className={`absolute ${positionClass} z-50 w-52 bg-white rounded-xl shadow-xl border border-gray-100
            animate-[fadeIn_0.15s_ease-out]`}
        >
          {/* Cabecera con email del usuario */}
          {user?.email && (
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          )}

          <ul className="py-1">
            {/* Mi Perfil */}
            {user?.role === 'nutritionist' && (
              <li>
                <button
                  onClick={() => {
                    setOpen(false);
                    if (user?.role === 'nutritionist') {
                      navigate(ROUTES.NUTRITIONIST_PROFILE);
                    } else if (user) {
                      navigate(buildRoute(ROUTES.PATIENT_PROFILE, { id: user.userId }));
                    } else {
                      navigate(ROUTES.LOGIN);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                  hover:bg-gray-50 transition text-left"
                >
                  <span className="text-gray-400">
                    <IconProfile />
                  </span>
                  Mi Perfil
                </button>
              </li>
            )}
            {/* Divisor */}
            <li className="my-1 border-t border-gray-100" />

            {/* Cerrar sesión */}
            <li>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600
                  hover:bg-red-50 transition text-left font-medium"
              >
                <span>
                  <IconLogout />
                </span>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
