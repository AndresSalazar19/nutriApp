import React from 'react';
import { SearchInput } from '../ui/SearchInput';

interface NutritionistTopBarProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function NutritionistTopBar({
  title,
  searchValue,
  onSearchChange,
}: NutritionistTopBarProps) {
  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center gap-3">
        {searchValue !== undefined && onSearchChange && (
          <SearchInput
            placeholder="Buscar pacientes..."
            value={searchValue}
            onChange={onSearchChange}
            className="w-56"
          />
        )}
      </div>
    </div>
  );
}
