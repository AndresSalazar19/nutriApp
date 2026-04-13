import React from 'react';
import { UserMenuPopover } from '../ui/UserMenuPopover';
 
interface AdminTopBarProps {
  title: string;
  subtitle?: string;
}
 
const IconBell = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
  </svg>
);
 
const IconSettings = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);
 
export function AdminTopBar({ title, subtitle }: AdminTopBarProps) {
  return (
    <div className="flex items-center justify-between px-8 pt-8 pb-2">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-red-600">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
 
      {/* Acciones */}
      <div className="flex items-center gap-1">
        {/* Campana de notificaciones */}
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition relative">
          <IconBell />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
 
        {/* Tuerca → UserMenuPopover */}
        <UserMenuPopover
          direction="down"
          align="right"
          trigger={
            <span className="p-2 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition">
              <IconSettings />
            </span>
          }
        />
      </div>
    </div>
  );
}