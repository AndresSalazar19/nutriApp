import { useMemo } from 'react';
import { FormState, FormErrors } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getToday(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function validateStep1(form: FormState): FormErrors {
  const errors: FormErrors = {};
  const today = getToday();

  if (!form.fullName.trim()) {
    errors.fullName = 'El nombre completo es requerido.';
  }

  if (!form.cedula) {
    errors.cedula = 'La cédula es requerida.';
  } else if (!/^\d{10}$/.test(form.cedula)) {
    errors.cedula = 'La cédula debe tener exactamente 10 dígitos numéricos.';
  }

  if (!form.birthDate) {
    errors.birthDate = 'La fecha de nacimiento es requerida.';
  } else if (form.birthDate > today) {
    errors.birthDate = 'La fecha no puede ser mayor al día actual.';
  }

  if (!form.phone) {
    errors.phone = 'El teléfono es requerido.';
  } else if (!/^\d{10}$/.test(form.phone)) {
    errors.phone = 'El teléfono debe tener exactamente 10 dígitos numéricos.';
  }

  return errors;
}

function validateStep3(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.email.trim()) {
    errors.email = 'El correo electrónico es requerido.';
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = 'Ingresa un correo electrónico válido (ej: usuario@dominio.com).';
  }

  return errors;
}

export function useFormValidation(form: FormState, step: number) {
  const errors = useMemo(() => {
    if (step === 1) return validateStep1(form);
    if (step === 3) return validateStep3(form);
    return {} as FormErrors;
  }, [form, step]);

  const isStepValid = Object.keys(errors).length === 0;

  return { errors, isStepValid };
}
