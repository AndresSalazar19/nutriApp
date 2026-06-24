import React from 'react';
import { StepProps, FormErrors } from './types';
import { SectionTitle } from './SectionTitle';
import { InputField } from './InputField';

interface PersonalInfoStepProps extends StepProps {
  errors: FormErrors;
}

const today = new Date().toISOString().split('T')[0];

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ form, update, errors }) => {
  const handleDigitsOnly = (field: 'cedula' | 'phone', value: string) => {
    update(field, value.replace(/\D/g, '').slice(0, 10));
  };

  return (
    <div className="animate-fade-in">
      <SectionTitle>Información Personal</SectionTitle>

      <InputField
        label="Nombre completo"
        field="fullName"
        form={form}
        update={update}
        placeholder="Ingresa tu nombre completo"
        error={errors.fullName}
        inputProps={{ maxLength: 50 }}
      />

      <div className="flex flex-col md:flex-row gap-3 mb-3">
        <div className="flex-1">
          <InputField
            label="Cédula de identidad"
            field="cedula"
            type="text"
            form={form}
            update={update}
            placeholder="Ej: 0912345678"
            error={errors.cedula}
            inputProps={{
              inputMode: 'numeric',
              maxLength: 10,
              onChange: (e) => handleDigitsOnly('cedula', e.target.value),
            }}
          />
        </div>
        <div className="flex-1">
          <InputField
            label="Fecha de nacimiento"
            field="birthDate"
            type="date"
            form={form}
            update={update}
            placeholder="DD/MM/AAAA"
            error={errors.birthDate}
            inputProps={{ max: today }}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-3">
        <div className="flex-1 mb-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Género</label>
          <div className="relative">
            <select
              value={form.gender || ''}
              onChange={(e) => update('gender', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nutri-medium focus:border-nutri-medium transition bg-white appearance-none"
            >
              <option value="" disabled>
                Selecciona tu género
              </option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <InputField
            label="Teléfono"
            field="phone"
            type="tel"
            form={form}
            update={update}
            placeholder="0999 123 456"
            error={errors.phone}
            inputProps={{
              inputMode: 'numeric',
              maxLength: 10,
              onChange: (e) => handleDigitsOnly('phone', e.target.value),
            }}
          />
        </div>
      </div>
    </div>
  );
};
