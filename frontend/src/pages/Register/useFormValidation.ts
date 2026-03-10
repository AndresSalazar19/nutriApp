import { useMemo } from 'react';
import { FormState, FormErrors } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getToday(): string {
  const now = new Date();
  const ecuadorOffset = -5 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ecuadorDate = new Date(utc + ecuadorOffset * 60000);
  const yyyy = ecuadorDate.getFullYear();
  const mm = String(ecuadorDate.getMonth() + 1).padStart(2, '0');
  const dd = String(ecuadorDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
}

function validateStep1(form: FormState): FormErrors {
  const errors: FormErrors = {};
  const today = getToday();

  if (!form.fullName.trim()) {
    errors.fullName = 'El nombre completo es requerido.';
  }

  const cedulaRegex = /^(0[1-9]|[1-2][0-9]|30)\d{8}$/;
  if (!form.cedula) {
    errors.cedula = 'La cédula es requerida.';
  } else if (!cedulaRegex.test(form.cedula)) {
    errors.cedula = 'La cédula no tiene un formato válido o el código de provincia es incorrecto.';
  }

  if (!form.birthDate) {
    errors.birthDate = 'La fecha de nacimiento es requerida.';
  } else if (form.birthDate > today) {
    errors.birthDate = 'La fecha no puede ser mayor al día actual.';
  }

  if (!form.phone) {
    errors.phone = 'El teléfono es requerido.';
  } else if (!/^09\d{8}$/.test(form.phone)) {
    errors.phone = 'El teléfono debe tener exactamente 10 dígitos numéricos.';
  }

  return errors;
}

function validateStep3(form: FormState, acceptTerms: boolean): FormErrors {
  const errors: FormErrors = {};

  if (!form.email.trim()) {
    errors.email = 'El correo electrónico es requerido.';
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = 'Ingresa un correo electrónico válido (ej: usuario@dominio.com).';
  }

  if (!form.password) {
    errors.password = 'La contraseña es requerida.';
  } else if (!isStrongPassword(form.password)) {
    errors.password = 'La contraseña no cumple con los requisitos de seguridad.';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Debes confirmar tu contraseña.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  if (!acceptTerms) {
    errors.acceptTerms = 'Debes aceptar los Términos de Servicio y Política de Privacidad.';
  }

  return errors;
}

export function useFormValidation(form: FormState, step: number, acceptTerms: boolean = false) {
  const errors = useMemo(() => {
    if (step === 1) return validateStep1(form);
    if (step === 3) return validateStep3(form, acceptTerms);
    return {} as FormErrors;
  }, [form, step, acceptTerms]);

  const isStepValid = Object.keys(errors).length === 0;

  return { errors, isStepValid };
}
