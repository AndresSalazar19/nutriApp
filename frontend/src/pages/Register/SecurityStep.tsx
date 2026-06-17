import React, { useState } from 'react';
import { StepProps, FormErrors } from './types';
import { SectionTitle } from './SectionTitle';
import { InputField } from './InputField';
import {
  FaCheckCircle,
} from 'react-icons/fa';

import { FiCircle } from 'react-icons/fi';
import { PasswordVisibilityToggle } from '../../components/PasswordVisibilityToggle';

export interface SecurityStepProps extends StepProps {
  acceptTerms: boolean;
  setAcceptTerms: React.Dispatch<React.SetStateAction<boolean>>;
  errors: FormErrors;
}

export const SecurityStep: React.FC<SecurityStepProps> = ({ form, update, acceptTerms, setAcceptTerms, errors }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Funciones para evaluar las reglas de la contraseña
  const hasMinLength = form.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);

  return (
    <div className="animate-fade-in">
      <SectionTitle>Credenciales de Acceso</SectionTitle>

      <InputField
        label="Correo electrónico"
        field="email"
        type="email"
        form={form}
        update={update}
        placeholder="ejemplo@email.com"
        error={errors.email}
      />

      {/* --- REGLAS DE LA CONTRASEÑA --- */}
      <div className="mb-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
        <p className="text-xs text-gray-500 font-semibold mb-2">La contraseña debe contener:</p>
        <ul className="text-xs space-y-1">
          <li className={`flex items-center gap-2 ${hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
              {hasMinLength ? (
                <FaCheckCircle size={14} />
              ) : (
                <FiCircle size={14} />
              )} Mínimo 8 caracteres
          </li>
          <li className={`flex items-center gap-2 ${hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
            {hasUppercase ? (
              <FaCheckCircle size={14} />
            ) : (
              <FiCircle size={14} />
            )} Al menos una letra mayúscula
          </li>
          <li className={`flex items-center gap-2 ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
            {hasNumber ? (
              <FaCheckCircle size={14} />
            ) : (
              <FiCircle size={14} />
            )} Al menos un número
          </li>
          <li className={`flex items-center gap-2 ${hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
            {hasSpecialChar ? (
              <FaCheckCircle size={14} />
            ) : (
              <FiCircle size={14} />
            )} Un carácter especial (Ej: !@#$%)
          </li>
        </ul>
      </div>

      <div className="relative mt-2">
        <InputField
          label="Contraseña"
          field="password"
          type={showPassword ? 'text' : 'password'}
          form={form}
          update={update}
          placeholder="••••••••"
          error={errors.password}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
        >
          <PasswordVisibilityToggle
            visible={showPassword}
            onClick={() => setShowPassword(!showPassword)}
          />
        </button>
      </div>

      <div className="mb-4 relative">
        <InputField
          label="Confirmar contraseña"
          field="confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          form={form}
          update={update}
          placeholder="••••••••"
          error={errors.confirmPassword}
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
        >
          <PasswordVisibilityToggle
            visible={showPassword}
            onClick={() => setShowPassword(!showPassword)}
          />
        </button>
      </div>

      <SectionTitle>Términos Legales</SectionTitle>
      <div className="flex items-center gap-2 mt-4 mb-5">
        <input
          type="checkbox"
          id="terms"
          checked={acceptTerms}
          onChange={e => setAcceptTerms(e.target.checked)}
          className="accent-green-500 w-4 h-4 cursor-pointer"
        />
        <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer">
          Acepto los <button type="button" className="text-green-600 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer">Términos de Servicio</button> y <button type="button" className="text-green-600 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer">Política de Privacidad</button>
        </label>
      </div>
      {errors.acceptTerms && (
        <p className="text-red-500 text-xs mt-1 mb-4 pl-6">{errors.acceptTerms}</p>
      )}
    </div>
  );
};