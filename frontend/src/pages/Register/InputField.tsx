import React from 'react';
import { FormState, StepProps } from './types';

interface InputFieldProps extends StepProps {
  label: string;
  field: keyof FormState;
  type?: string;
  placeholder: string;
  className?: string;
  error?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export const InputField = ({
  label,
  field,
  type = 'text',
  placeholder,
  className = '',
  form,
  update,
  error,
  inputProps,
}: InputFieldProps) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={form[field]}
      onChange={(e) => update(field, e.target.value)}
      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition bg-white ${
        error
          ? 'border-admin-accent focus:ring-1 focus:ring-admin-accent focus:border-admin-accent text-admin-accent'
          : 'border-gray-200 focus:ring-1 focus:ring-nutri-medium focus:border-nutri-medium'
      }`}
      {...inputProps}
    />
    {error && <p className="text-admin-accent text-xs mt-1">{error}</p>}
  </div>
);
