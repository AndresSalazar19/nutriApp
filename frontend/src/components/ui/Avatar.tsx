import React from 'react';

interface AvatarProps {
  initials: string;
  src?: string | null;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

export function Avatar({
  initials,
  src,
  color = 'bg-gray-400 text-white',
  size = 'md',
}: AvatarProps) {
  if (src)
    return (
      <img
        src={src}
        alt={initials}
        className={`${sizeMap[size]} rounded-full object-cover flex-shrink-0`}
      />
    );

  return (
    <div
      className={`${sizeMap[size]} ${color} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
