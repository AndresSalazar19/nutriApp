import React, { useState, useRef, useEffect } from 'react';
import { SearchInput } from '../ui/SearchInput';

interface NutritionistTopBarProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function NutritionistTopBar({ title, searchValue, onSearchChange }: NutritionistTopBarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center gap-3">
        
        {/* Renderiza el input de búsqueda solo si se pasan las props */}
        {searchValue !== undefined && onSearchChange && (
          <SearchInput
            placeholder="Buscar pacientes..."
            value={searchValue}
            onChange={onSearchChange}
            className="w-56"
          />
        )}

        {/* Campana de notificaciones con su Ref */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            <span className="text-lg">🔔</span>
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Menú desplegable */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-5 z-50">
              <p className="text-sm text-gray-500 text-center font-medium">
                No hay notificaciones actualmente
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}