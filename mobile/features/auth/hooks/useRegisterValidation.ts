import { useCallback, useMemo, useState } from 'react';

export interface RegisterFormValues {
  fullName: string;
  identification: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  password: string;
  confirmPassword: string;
}

export type RegisterField = keyof RegisterFormValues;

export type RegisterFieldErrors = Partial<Record<RegisterField, string>>;

/**
 * Validador asíncrono opcional (slot para José): recibe el campo, su valor
 * actual y el resto del formulario, y debe resolver con un mensaje de error
 * si el valor es inválido (p. ej. "Esta cédula ya está registrada") o con
 * null/undefined si está OK. Se dispara desde `runAsyncValidation`, pensado
 * para llamarse en el onBlur del campo una vez que la validación síncrona
 * ya pasó (no tiene sentido pegarle al backend si el formato ni siquiera
 * es válido).
 *
 * Ejemplo de implementación futura:
 *   const checkDuplicates: AsyncFieldValidator = async (field, value) => {
 *     if (field === 'identification') {
 *       const exists = await UserService.cedulaExists(value);
 *       return exists ? 'Esta cédula ya está registrada.' : null;
 *     }
 *     if (field === 'email') {
 *       const exists = await UserService.emailExists(value);
 *       return exists ? 'Este correo ya está registrado.' : null;
 *     }
 *     return null;
 *   };
 */
export type AsyncFieldValidator = (
  field: RegisterField,
  value: string,
  values: RegisterFormValues
) => Promise<string | null | undefined>;

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ]+(?:\s[A-Za-zÀ-ÖØ-öø-ÿÑñ]+)+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DIGITS_REGEX = /^\d+$/;

export const CEDULA_LENGTH = 10;
export const PHONE_LENGTH = 10;
export const MIN_PASSWORD_LENGTH = 8;

const FIELDS: RegisterField[] = [
  'fullName',
  'identification',
  'email',
  'phone',
  'birthDate',
  'gender',
  'password',
  'confirmPassword',
];

/**
 * Reglas síncronas de tipo/formato/longitud por campo. Devuelve el mensaje
 * de error (para mostrarlo en rojo bajo el input) o null si el valor es
 * válido.
 */
function validateField(field: RegisterField, values: RegisterFormValues): string | null {
  const value = values[field];

  switch (field) {
    case 'fullName': {
      const v = value.trim();
      if (!v) return 'El nombre es obligatorio.';
      if (!NAME_REGEX.test(v)) return 'Ingresa nombre y apellido, solo letras.';
      return null;
    }
    case 'identification': {
      const v = value.trim();
      if (!v) return 'La cédula es obligatoria.';
      if (!DIGITS_REGEX.test(v)) return 'La cédula solo puede contener números.';
      if (v.length !== CEDULA_LENGTH) return `La cédula debe tener ${CEDULA_LENGTH} dígitos.`;
      return null;
    }
    case 'email': {
      const v = value.trim();
      if (!v) return 'El correo es obligatorio.';
      if (!EMAIL_REGEX.test(v)) return 'Ingresa un correo electrónico válido.';
      return null;
    }
    case 'phone': {
      const v = value.trim();
      if (!v) return 'El teléfono es obligatorio.';
      if (!DIGITS_REGEX.test(v)) return 'El teléfono solo puede contener números.';
      if (v.length !== PHONE_LENGTH) return `El teléfono debe tener ${PHONE_LENGTH} dígitos.`;
      return null;
    }
    case 'birthDate': {
      if (!value.trim()) return 'Selecciona tu fecha de nacimiento.';
      return null;
    }
    case 'gender': {
      if (!value.trim()) return 'Selecciona tu género.';
      return null;
    }
    case 'password': {
      if (!value) return 'La contraseña es obligatoria.';
      if (value.length < MIN_PASSWORD_LENGTH) {
        return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
      }
      return null;
    }
    case 'confirmPassword': {
      if (!value) return 'Confirma tu contraseña.';
      if (value !== values.password) return 'Las contraseñas no coinciden.';
      return null;
    }
    default:
      return null;
  }
}

/**
 * Versión pura (sin estado) de la validación completa: recorre todos los
 * campos y devuelve el mapa de errores. Se usa para saber en cada render
 * si el formulario en su estado actual es válido (p. ej. para deshabilitar
 * el botón de continuar) sin depender de qué campos ya se "tocaron".
 */
export function getValidationErrors(values: RegisterFormValues): RegisterFieldErrors {
  const next: RegisterFieldErrors = {};
  FIELDS.forEach((field) => {
    const message = validateField(field, values);
    if (message) next[field] = message;
  });
  return next;
}

/**
 * Hook de validación del formulario de registro. Expone los errores por
 * campo (para pintarlos en rojo debajo del input, nunca en un Alert), un
 * flag `isValid` para bloquear el botón de continuar, y un slot
 * (`runAsyncValidation` / el parámetro `asyncValidator`) donde José
 * enchufará más adelante la verificación de duplicados contra el backend.
 */
export function useRegisterValidation(asyncValidator?: AsyncFieldValidator) {
  const [errors, setErrors] = useState<RegisterFieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<RegisterField, boolean>>>({});
  const [validating, setValidating] = useState<Partial<Record<RegisterField, boolean>>>({});

  const validateOne = useCallback((field: RegisterField, values: RegisterFormValues) => {
    const message = validateField(field, values);
    setErrors((prev) => ({ ...prev, [field]: message ?? undefined }));
    return message;
  }, []);

  const validateAll = useCallback((values: RegisterFormValues) => {
    const nextErrors: RegisterFieldErrors = {};
    FIELDS.forEach((field) => {
      const message = validateField(field, values);
      if (message) nextErrors[field] = message;
    });
    setErrors(nextErrors);
    setTouched((prev) => {
      const next = { ...prev };
      FIELDS.forEach((f) => { next[f] = true; });
      return next;
    });
    return Object.keys(nextErrors).length === 0;
  }, []);

  const markTouched = useCallback((field: RegisterField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Se llama, típicamente, en el onBlur del campo, después de que la
  // validación síncrona ya pasó. No hace nada si aún no hay un
  // `asyncValidator` provisto (queda listo para cuando José lo agregue).
  const runAsyncValidation = useCallback(
    async (field: RegisterField, values: RegisterFormValues) => {
      if (!asyncValidator) return;
      if (validateField(field, values)) return; // no llamar al backend si el formato ya es inválido

      setValidating((prev) => ({ ...prev, [field]: true }));
      try {
        const message = await asyncValidator(field, values[field], values);
        setErrors((prev) => ({ ...prev, [field]: message ?? undefined }));
      } finally {
        setValidating((prev) => ({ ...prev, [field]: false }));
      }
    },
    [asyncValidator]
  );

  // Para que el RegisterScreen pueda inyectar errores que vienen del
  // backend al hacer submit (p. ej. cédula/email ya registrados),
  // reusando el mismo slot visual que los errores de cliente.
  const setFieldError = useCallback((field: RegisterField, message: string | null) => {
    setErrors((prev) => ({ ...prev, [field]: message ?? undefined }));
  }, []);

  const clearErrors = useCallback(() => setErrors({}), []);

  const isValid = useMemo(() => FIELDS.every((f) => !errors[f]), [errors]);

  return {
    errors,
    touched,
    validating,
    isValid,
    validateField: validateOne,
    validateAll,
    markTouched,
    runAsyncValidation,
    setFieldError,
    clearErrors,
  };
}
