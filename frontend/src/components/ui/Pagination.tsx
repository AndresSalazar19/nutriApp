import React from 'react';

interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ current, total, onChange }: PaginationProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="px-2 py-1 rounded text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition"
      >
        ‹
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`w-7 h-7 rounded text-sm font-medium transition ${
            page === current
              ? 'bg-red-500 text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="px-2 py-1 rounded text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition"
      >
        ›
      </button>
    </div>
  );
}