import React from 'react';
import { FormState, StepProps } from './types';

interface InputFieldProps extends StepProps {
  label: string;
  field: keyof FormState;
  type?: string;
  placeholder: string;
  className?: string;
}

export const InputField = ({
  label, field, type = 'text', placeholder, className = '', form, update,
}: InputFieldProps) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={form[field]}
      onChange={e => update(field, e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 transition bg-white"
    />
  </div>
);