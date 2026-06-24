import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  iconBg?: string;
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  accentColor?: string;
}

const changeColors = {
  positive: 'text-nutri-medium',
  negative: 'text-admin-accent',
  neutral: 'text-orange-400',
};

export function StatCard({
  icon,
  iconBg = 'bg-gray-100',
  label,
  value,
  change,
  changeType = 'positive',
  accentColor = 'text-gray-800',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center text-xl flex-shrink-0`}
        >
          {icon}
        </div>
        <span className="text-gray-500 text-sm">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${accentColor} mb-1`}>{value}</p>
      {change && <p className={`text-xs ${changeColors[changeType]}`}>{change}</p>}
    </div>
  );
}
