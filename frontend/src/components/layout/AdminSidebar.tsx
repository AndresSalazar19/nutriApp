import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserMenuPopover } from '../ui/UserMenuPopover';
import { ROUTES } from '../../routes/routes'; // Asegúrate de que la ruta de importación sea la correcta
import {
  MdDashboard,
  MdPeople,
  MdPerson,
  MdArticle,
  MdStorage,
  MdSettings,
  MdBarChart,
} from 'react-icons/md';
import { FaLeaf } from "react-icons/fa";

const navItems = [
  { label: 'Panel Principal', icon: MdDashboard },
  { label: 'Nutricionistas',  icon: MdPerson },
  { label: 'Clientes',        icon: MdPeople },
  { label: 'Contenido',       icon: MdArticle },
  { label: 'Bases de Datos',  icon: MdStorage },
  { label: 'Configuración',   icon: MdSettings },
  { label: 'Reportes',        icon: MdBarChart },
];

interface AdminSidebarProps {
  activeNav: string;
  onNavChange: (label: string) => void;
}

export function AdminSidebar({ activeNav, onNavChange }: AdminSidebarProps) {
  const navigate = useNavigate();

  const handleNavClick = (label: string) => {
    const routeMap: Record<string, string> = {
      'Panel Principal': ROUTES.ADMIN,
      'Nutricionistas':  ROUTES.ADMIN_NUTRITIONISTS,
      'Clientes':        ROUTES.ADMIN_CLIENTS,
      'Contenido':       ROUTES.ADMIN_CONTENT,
      'Bases de Datos':  ROUTES.ADMIN_DATABASES,
      'Configuración':   ROUTES.ADMIN_SETTINGS,
      'Reportes':        ROUTES.ADMIN_REPORTS,
    };

    const routeToNavigate = routeMap[label];
    
    if (routeToNavigate) {
      navigate(routeToNavigate);
    }
    
    onNavChange(label);
  };

  return (
    <aside className="w-52 bg-red-600 flex flex-col justify-between py-5 px-3 flex-shrink-0">
      <div>
        {/* Logo */}
        <div
          onClick={() => {
            navigate(ROUTES.ADMIN);
            onNavChange('Panel Principal');
          }}
          className="flex items-center gap-2 px-2 mb-7 cursor-pointer select-none hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            {/* Reemplazar por imagen/logo */}
            <FaLeaf className="text-white text-sm" />
          </div>
          <div>
            <span className="text-white font-bold text-base leading-none">NutrIA</span>
            <p className="text-red-200 text-xs leading-none">Admin</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="space-y-1">
          {navItems.map(({ label, icon: Icon }) => {
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
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-red-100'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Usuario admin */}
      <UserMenuPopover
        direction="up"
        align="left"
        trigger={
          <button className="w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-red-700 transition">
            <div className="w-9 h-9 bg-red-800 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              AD
            </div>
            <div>
              <p className="text-white text-xs font-semibold leading-tight">Administrador</p>
              <p className="text-red-300 text-xs">Sistema NutrIA</p>
            </div>
          </button>
        }
      />
    </aside>
  );
}