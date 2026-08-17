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
  primary: 'bg-nutri-medium hover:bg-nutri-dark text-white shadow-sm',
  danger: 'bg-admin-dark hover:bg-admin-medium text-white shadow-sm',
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-800',
  'outline-danger': 'border border-admin-medium hover:bg-admin-light text-admin-dark',
  ghost: 'hover:bg-gray-100 text-gray-700',
  success: 'bg-nutri-dark hover:bg-nutri-medium text-white shadow-sm',
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
