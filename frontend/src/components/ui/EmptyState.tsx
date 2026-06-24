import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  accentColor?: 'green' | 'red' | 'admin';
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  accentColor = 'green',
}: EmptyStateProps) {
  const btnColor =
    accentColor === 'red'
      ? 'bg-red-500 hover:bg-red-600'
      : accentColor === 'admin'
        ? 'bg-admin-dark hover:bg-admin-medium'
        : 'bg-green-500 hover:bg-green-600';

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-gray-700 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={`px-5 py-2 rounded-lg text-white text-sm font-semibold transition ${btnColor}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
