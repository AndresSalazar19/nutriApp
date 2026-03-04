import React from 'react';

type ButtonVariant = 'primary' | 'danger' | 'outline' | 'outline-danger' | 'ghost' | 'success';

interface ButtonProps {
  variant?: ButtonVariant;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:       'bg-green-500 hover:bg-green-600 text-white shadow-sm',
  danger:        'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  outline:       'border border-gray-300 hover:bg-gray-50 text-gray-700',
  'outline-danger': 'border border-red-400 hover:bg-red-50 text-red-500',
  ghost:         'hover:bg-gray-100 text-gray-600',
  success:       'bg-green-600 hover:bg-green-700 text-white shadow-sm',
};

export function Button({
  variant = 'primary',
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  icon,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
