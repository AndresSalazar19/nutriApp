import React from 'react';
import { MdSearch } from 'react-icons/md';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchInput({
  placeholder = 'Buscar...',
  value,
  onChange,
  className = '',
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 transition bg-white"
      />
    </div>
  );
}
