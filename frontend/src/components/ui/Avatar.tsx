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

// 1. Movemos el text-white aquí al default
export function Avatar({ initials, color = 'bg-gray-400 text-white', size = 'md' }: AvatarProps) {
  return (
    <div
      // 2. Eliminamos text-white de esta línea
      className={`${sizeMap[size]} ${color} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
