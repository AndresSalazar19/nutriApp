import React from 'react';

export interface HorizontalBarItem {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

interface HorizontalBarProps {
  items: HorizontalBarItem[];
  showValues?: boolean;
  color?: string;
  height?: string;
}

export function HorizontalBar({
  items,
  showValues = true,
  color = 'bg-red-400',
  height = 'h-2',
}: HorizontalBarProps) {
  const globalMax = Math.max(...items.map((i) => i.value));

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const max = item.max ?? globalMax;
        const pct = max > 0 ? Math.round((item.value / max) * 100) : 0;
        const barColor = item.color ?? color;

        return (
          <div key={item.label}>
            {/* Label + valor */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 font-medium">{item.label}</span>
              {showValues && (
                <span className="text-xs text-gray-400 font-semibold">
                  {item.value.toLocaleString()}
                </span>
              )}
            </div>

            {/* Barra */}
            <div className={`w-full bg-gray-100 rounded-full ${height}`}>
              <div
                className={`${barColor} ${height} rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
