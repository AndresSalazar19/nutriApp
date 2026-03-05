import React from 'react';

interface AvatarProps {
  initials: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

export function Avatar({ initials, color = 'bg-gray-400', size = 'md' }: AvatarProps) {
  return (
    <div
      className={`${sizeMap[size]} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
