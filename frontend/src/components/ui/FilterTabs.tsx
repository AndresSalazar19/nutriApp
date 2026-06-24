import React from 'react';

interface Tab {
  label: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (label: string) => void;
  accentColor?: 'green' | 'red' | 'admin';
}

export function FilterTabs({ tabs, active, onChange, accentColor = 'green' }: FilterTabsProps) {
  const activeClasses =
    accentColor === 'red'
      ? 'bg-red-500 text-white'
      : accentColor === 'admin'
        ? 'bg-admin-medium text-white'
        : 'bg-green-500 text-white';

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          onClick={() => onChange(tab.label)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            active === tab.label ? activeClasses : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-1.5 opacity-80">({tab.count})</span>}
        </button>
      ))}
    </div>
  );
}
