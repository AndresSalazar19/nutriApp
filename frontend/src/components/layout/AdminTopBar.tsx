import React from 'react';

interface AdminTopBarProps {
  title: string;
  subtitle?: string;
}

export function AdminTopBar({ title, subtitle }: AdminTopBarProps) {
  return (
    <div className="flex items-center justify-between px-8 pt-6 pb-2">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-admin-medium text-sm mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
