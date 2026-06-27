import React, { useState, useEffect } from 'react';

interface AvatarProps {
  src?: string | null;
  initials: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_MAP = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

export function Avatar({
  src,
  initials,
  color = 'bg-nutri-medium text-white',
  size = 'md',
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const sizeClasses = SIZE_MAP[size];

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={initials}
        loading="lazy"
        onError={() => setImageError(true)}
        className={`${sizeClasses} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} ${color} rounded-full flex items-center justify-center font-bold flex-shrink-0 uppercase`}
    >
      {initials.slice(0, 2)}
    </div>
  );
}
