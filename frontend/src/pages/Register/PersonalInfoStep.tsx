import React from 'react';
import { StepProps, FormErrors } from './types';
import { SectionTitle } from './SectionTitle';
import { InputField } from './InputField';

interface PersonalInfoStepProps extends StepProps {
  errors: FormErrors;
  avatarFile?: File | null;
  setAvatarFile?: React.Dispatch<React.SetStateAction<File | null>>;
  avatarPreview?: string | null;
  setAvatarPreview?: React.Dispatch<React.SetStateAction<string | null>>;
}

const today = new Date().toISOString().split('T')[0];

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  form,
  update,
  errors,
  avatarFile,
  setAvatarFile,
  avatarPreview,
  setAvatarPreview,
}) => {
  const handleDigitsOnly = (field: 'cedula' | 'phone', value: string) => {
    update(field, value.replace(/\D/g, '').slice(0, 10));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile?.(null);
      setAvatarPreview?.(null);
      event.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('El archivo debe ser una imagen válida.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe pesar menos de 2 MB.');
      event.target.value = '';
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile?.(file);
    setAvatarPreview?.(URL.createObjectURL(file));
    event.target.value = '';
  };

  return (
    <div className="animate-fade-in">
      <SectionTitle>Información Personal</SectionTitle>

      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          {/* Contenedor del Avatar */}
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden shadow-sm">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-xs text-center px-2">Subir foto</span>
            )}
          </div>

          {/* Botón flotante circular con icono de lápiz */}
          <label className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-600 shadow-md cursor-pointer hover:bg-gray-50 hover:scale-105 transition-all">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            {/* Icono de lápiz en SVG para no depender de librerías externas */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </label>
        </div>

        <p className="text-xs text-gray-400 mt-3">Sube una foto opcional. Máximo 2 MB.</p>
      </div>

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
