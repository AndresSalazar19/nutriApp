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
  label, field, type = 'text', placeholder, className = '', form, update, error, inputProps,
}: InputFieldProps) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={form[field]}
      onChange={e => update(field, e.target.value)}
      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition bg-white ${
        error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-green-500'
      }`}
      {...inputProps}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
