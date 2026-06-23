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
            className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-nutri-light transition"
            aria-label="Notificaciones"
          >
            <svg className="w-5 h-5 text-nutri-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z" />
            </svg>
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-nutri-accent border-2 border-white rounded-full" />
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