import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routes';

const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm8-8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
  nutritionist: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
  clients: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  content: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  reports: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  ),
};

const navItems = [
  { label: 'Panel Principal', icon: 'dashboard' },
  { label: 'Nutricionistas',  icon: 'nutritionist' },
  { label: 'Clientes',        icon: 'clients' },
  { label: 'Contenido',       icon: 'content' },
  { label: 'Configuración',   icon: 'settings' },
  { label: 'Reportes',        icon: 'reports' },
  
] ;

interface AdminSidebarProps {
  activeNav: string;
  onNavChange: (label: string) => void;
}

export function AdminSidebar({ activeNav, onNavChange }: AdminSidebarProps) {

  const navigate = useNavigate();
  const handleNavClick = (label: string) => {
    if (label === 'Nutricionistas') {
      navigate(ROUTES.ADMIN_NUTRITIONISTS);
    } else if (label === 'Panel Principal') {
      navigate(ROUTES.ADMIN);
    } else if (label === 'Clientes') {
      navigate(ROUTES.ADMIN_CLIENTS);
    } else if (label === 'Contenido') {
      navigate(ROUTES.ADMIN_CONTENT);
    }
    onNavChange(label);
  };

  return (
    <aside className="w-52 bg-red-600 flex flex-col justify-between py-5 px-3 flex-shrink-0">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-7">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            {/* Reemplazar por imagen/logo */}
            <span className="text-base">🥗</span>
          </div>
          <div>
            <span className="text-white font-bold text-base leading-none">NutrIA</span>
            <p className="text-red-200 text-xs leading-none">Admin</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="space-y-1">
          {navItems.map(({ label, icon }) => {
            const isActive = activeNav === label;
            return (
              <button
                key={label}
                onClick={() => handleNavClick(label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition text-left
                  ${isActive
                    ? 'bg-red-800 text-white font-semibold'
                    : 'text-red-100 hover:bg-red-700'
                  }`}
              >
                {icons[icon]}
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Usuario admin */}
      <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer">
        <div className="w-9 h-9 bg-red-800 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          AD
        </div>
        <div>
          <p className="text-white text-xs font-semibold leading-tight">Administrador</p>
          <p className="text-red-300 text-xs">Sistema NutrIA</p>
        </div>
      </div>
    </aside>
  );
}