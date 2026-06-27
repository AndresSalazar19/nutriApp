import { renderHook } from '@testing-library/react';
import { useFormValidation } from '../pages/Register/useFormValidation';
import { FormState } from '../pages/Register/types';
import {
  getWeekStart,
  getWeekDays,
  formatMonthYear,
  isSameDay,
  pad,
} from '../pages/Appoinment/agendaUtils';
import { buildRoute, ROUTES } from '../routes/routes';

const baseForm: FormState = {
  fullName: '',
  cedula: '',
  birthDate: '',
  gender: '',
  phone: '',
  specialties: '',
  yearsExperience: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const makeStep1 = (overrides: Partial<FormState> = {}): FormState => ({
  ...baseForm,
  ...overrides,
});

const makeStep3 = (overrides: Partial<FormState> = {}): FormState => ({
  ...baseForm,
  email: 'test@nutria.com',
  password: 'Password1!',
  confirmPassword: 'Password1!',
  ...overrides,
});

const pdfFile = (name = 'file.pdf') => new File(['content'], name, { type: 'application/pdf' });

// Personal Information

describe('Step 1 – Personal Information', () => {
  test('TC-FE-01: shows error when fullName is empty', () => {
    const { result } = renderHook(() => useFormValidation(makeStep1(), 1));

    expect(result.current.errors.fullName).toBe('El nombre completo es requerido.');
    expect(result.current.isStepValid).toBe(false);
  });

  test('TC-FE-02: rejects cédula with invalid province code', () => {
    const { result } = renderHook(() => useFormValidation(makeStep1({ cedula: '3112345678' }), 1));

    expect(result.current.errors.cedula).toBe(
      'La cédula no tiene un formato válido o el código de provincia es incorrecto.',
    );
  });

  test('TC-FE-03: accepts valid cédula with correct province prefix', () => {
    const form = makeStep1({
      fullName: 'Ana Torres',
      cedula: '0912345678',
      birthDate: '1990-06-15',
      phone: '0991234567',
    });
    const { result } = renderHook(() => useFormValidation(form, 1));

    expect(result.current.errors.cedula).toBeUndefined();
  });

  test('TC-FE-04: rejects future birthDate', () => {
    const { result } = renderHook(() =>
      useFormValidation(makeStep1({ birthDate: '2099-12-31' }), 1),
    );

    expect(result.current.errors.birthDate).toBe('La fecha no puede ser mayor al día actual.');
  });

  test('TC-FE-05: rejects phone not starting with 09', () => {
    const { result } = renderHook(() => useFormValidation(makeStep1({ phone: '0812345678' }), 1));

    expect(result.current.errors.phone).toBe(
      'El teléfono debe tener exactamente 10 dígitos numéricos.',
    );
  });

  test('TC-FE-05b: shows required error when cédula is empty', () => {
    const { result } = renderHook(() =>
      useFormValidation(makeStep1({ cedula: '' }), 1),
    );

    expect(result.current.errors.cedula).toBe('La cédula es requerida.');
  });

  test('TC-FE-05c: shows required error when birthDate is empty', () => {
    const { result } = renderHook(() =>
      useFormValidation(makeStep1({ birthDate: '' }), 1),
    );

    expect(result.current.errors.birthDate).toBe('La fecha de nacimiento es requerida.');
  });

  test('TC-FE-05d: shows required error when phone is empty', () => {
    const { result } = renderHook(() =>
      useFormValidation(makeStep1({ phone: '' }), 1),
    );

    expect(result.current.errors.phone).toBe('El teléfono es requerido.');
  });

  test('TC-FE-05e: accepts valid phone starting with 09', () => {
    const form = makeStep1({
      fullName: 'Ana Torres',
      cedula: '0912345678',
      birthDate: '1990-06-15',
      phone: '0991234567',
    });
    const { result } = renderHook(() => useFormValidation(form, 1));

    expect(result.current.errors.phone).toBeUndefined();
  });
});

// Professional Information

describe('Step 2 – Professional Information', () => {
  test('TC-FE-06: shows error when no specialty is selected', () => {
    const { result } = renderHook(() =>
      useFormValidation(makeStep1({ specialties: '' }), 2, false, null, null),
    );

    expect(result.current.errors.specialties).toBe('Debes seleccionar una especialidad.');
  });

  test('TC-FE-07: rejects negative yearsExperience', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        makeStep1({ specialties: '1', yearsExperience: '-1' }),
        2,
        false,
        pdfFile('cv.pdf'),
        pdfFile('sene.pdf'),
      ),
    );

    expect(result.current.errors.yearsExperience).toBe(
      'Los años de experiencia no pueden ser negativos.',
    );
  });

  test('TC-FE-08: rejects non-PDF CV file', () => {
    const badCv = new File(['content'], 'cv.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const { result } = renderHook(() =>
      useFormValidation(
        makeStep1({ specialties: '1', yearsExperience: '3' }),
        2,
        false,
        badCv,
        pdfFile('senescyt.pdf'),
      ),
    );

    expect(result.current.errors.cvFile).toBe('El Curriculum Vitae debe ser un archivo PDF.');
  });

  test('TC-FE-08b: shows required error when yearsExperience is empty', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        makeStep1({ specialties: '1', yearsExperience: '' }),
        2,
        false,
        pdfFile('cv.pdf'),
        pdfFile('sene.pdf'),
      ),
    );

    expect(result.current.errors.yearsExperience).toBe(
      'Los años de experiencia son requeridos.',
    );
  });

  test('TC-FE-08c: shows required error when yearsExperience is whitespace only', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        makeStep1({ specialties: '1', yearsExperience: '   ' }),
        2,
        false,
        pdfFile('cv.pdf'),
        pdfFile('sene.pdf'),
      ),
    );

    expect(result.current.errors.yearsExperience).toBe(
      'Los años de experiencia son requeridos.',
    );
  });

  test('TC-FE-08d: shows required error when cvFile is null', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        makeStep1({ specialties: '1', yearsExperience: '3' }),
        2,
        false,
        null,
        pdfFile('sene.pdf'),
      ),
    );

    expect(result.current.errors.cvFile).toBe('El Curriculum Vitae es requerido.');
  });

  test('TC-FE-08e: shows required error when senescytFile is null', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        makeStep1({ specialties: '1', yearsExperience: '3' }),
        2,
        false,
        pdfFile('cv.pdf'),
        null,
      ),
    );

    expect(result.current.errors.senescytFile).toBe('El Registro Senescyt es requerido.');
  });

  test('TC-FE-08f: rejects senescytFile with invalid type and extension', () => {
    const badSenescyt = new File(['content'], 'registro.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const { result } = renderHook(() =>
      useFormValidation(
        makeStep1({ specialties: '1', yearsExperience: '3' }),
        2,
        false,
        pdfFile('cv.pdf'),
        badSenescyt,
      ),
    );

    expect(result.current.errors.senescytFile).toBe(
      'El Registro Senescyt debe ser PDF, JPG o PNG.',
    );
  });

  test('TC-FE-08g: accepts senescytFile with .jpg extension', () => {
    const jpgSenescyt = new File(['content'], 'registro.jpg', { type: 'image/jpeg' });
    const { result } = renderHook(() =>
      useFormValidation(
        makeStep1({ specialties: '1', yearsExperience: '3' }),
        2,
        false,
        pdfFile('cv.pdf'),
        jpgSenescyt,
      ),
    );

    expect(result.current.errors.senescytFile).toBeUndefined();
  });

  test('TC-FE-08h: step 2 is valid with all correct fields', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        makeStep1({ specialties: '1', yearsExperience: '5' }),
        2,
        false,
        pdfFile('cv.pdf'),
        pdfFile('senescyt.pdf'),
      ),
    );

    expect(result.current.isStepValid).toBe(true);
  });
});

// Security Credentials

describe('Step 3 – Security Credentials', () => {
  test('TC-FE-09: rejects weak password missing uppercase, number and special char', () => {
    const { result } = renderHook(() =>
      useFormValidation(makeStep3({ password: 'password', confirmPassword: 'password' }), 3, true),
    );

    expect(result.current.errors.password).toBe(
      'La contraseña no cumple con los requisitos de seguridad.',
    );
  });

  test('TC-FE-10: rejects mismatched confirmPassword', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        makeStep3({ password: 'Password1!', confirmPassword: 'Password2!' }),
        3,
        true,
      ),
    );

    expect(result.current.errors.confirmPassword).toBe('Las contraseñas no coinciden.');
    expect(result.current.isStepValid).toBe(false);
  });

  test('TC-FE-10b: shows required error when email is empty', () => {
    const { result } = renderHook(() =>
      useFormValidation(makeStep3({ email: '' }), 3, true),
    );

    expect(result.current.errors.email).toBe('El correo electrónico es requerido.');
  });

  test('TC-FE-10c: rejects email with invalid format', () => {
    const { result } = renderHook(() =>
      useFormValidation(makeStep3({ email: 'not-an-email' }), 3, true),
    );

    expect(result.current.errors.email).toBe(
      'Ingresa un correo electrónico válido (ej: usuario@dominio.com).',
    );
  });

  test('TC-FE-10d: shows required error when password is empty', () => {
    const { result } = renderHook(() =>
      useFormValidation(makeStep3({ password: '', confirmPassword: '' }), 3, true),
    );

    expect(result.current.errors.password).toBe('La contraseña es requerida.');
  });

  test('TC-FE-10e: shows required error when confirmPassword is empty', () => {
    const { result } = renderHook(() =>
      useFormValidation(makeStep3({ confirmPassword: '' }), 3, true),
    );

    expect(result.current.errors.confirmPassword).toBe('Debes confirmar tu contraseña.');
  });

  test('TC-FE-10f: shows error when terms are not accepted', () => {
    const { result } = renderHook(() =>
      useFormValidation(makeStep3(), 3, false),
    );

    expect(result.current.errors.acceptTerms).toBe(
      'Debes aceptar los Términos de Servicio y Política de Privacidad.',
    );
  });

  test('TC-FE-10g: step 3 is valid with strong password, matching confirm, and terms accepted', () => {
    const { result } = renderHook(() =>
      useFormValidation(makeStep3(), 3, true),
    );

    expect(result.current.isStepValid).toBe(true);
  });
});

// useFormValidation – step fallback

describe('useFormValidation – step fallback', () => {

  test('TC-FE-10h: returns empty errors and isStepValid true for unknown step', () => {
    const { result } = renderHook(() => useFormValidation(baseForm, 99));

    expect(result.current.errors).toEqual({});
    expect(result.current.isStepValid).toBe(true);
  });
});

// pad()

describe('pad', () => {
  test('TC-FE-11: pads single digit with leading zero', () => {
    expect(pad(7)).toBe('07');
  });

  test('TC-FE-12: returns two-digit number unchanged', () => {
    expect(pad(12)).toBe('12');
  });

  test('TC-FE-13: pads zero to "00"', () => {
    expect(pad(0)).toBe('00');
  });
});

// isSameDay()

describe('isSameDay', () => {
  test('TC-FE-14: returns true for same calendar day at different times', () => {
    expect(isSameDay(new Date('2026-06-15T08:00:00'), new Date('2026-06-15T23:59:59'))).toBe(true);
  });

  test('TC-FE-15: returns false for consecutive days', () => {
    expect(isSameDay(new Date('2026-06-15'), new Date('2026-06-16'))).toBe(false);
  });

  test('TC-FE-16: returns false for same day in different months', () => {
    expect(isSameDay(new Date('2026-05-15'), new Date('2026-06-15'))).toBe(false);
  });
});

// getWeekStart()

describe('getWeekStart', () => {
  test('TC-FE-17: returns Monday when given a Wednesday', () => {
    const result = getWeekStart(new Date(2026, 5, 17));

    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(15);
    expect(result.getMonth()).toBe(5);
  });

  test('TC-FE-18: returns previous Monday when given a Sunday', () => {
    const result = getWeekStart(new Date(2026, 5, 21));

    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(15);
  });

  test('TC-FE-19: returns same day when input is already Monday', () => {
    const result = getWeekStart(new Date(2026, 5, 15));

    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(15);
  });

  test('TC-FE-20: resets time to midnight on the returned Monday', () => {
    const result = getWeekStart(new Date('2026-06-17T14:35:22'));

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});

// getWeekDays()

describe('getWeekDays', () => {
  const MONDAY = new Date(2026, 5, 15);

  test('TC-FE-21: returns exactly 7 days', () => {
    expect(getWeekDays(MONDAY)).toHaveLength(7);
  });

  test('TC-FE-22: first element is the Monday passed in', () => {
    expect(isSameDay(getWeekDays(MONDAY)[0], MONDAY)).toBe(true);
  });

  test('TC-FE-23: last element is the Sunday 6 days after Monday', () => {
    expect(isSameDay(getWeekDays(MONDAY)[6], new Date(2026, 5, 21))).toBe(true);
  });

  test('TC-FE-24: each consecutive day is exactly 1 day apart', () => {
    const days = getWeekDays(MONDAY);
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    for (let i = 0; i < 6; i++) {
      expect((days[i + 1].getTime() - days[i].getTime()) / MS_PER_DAY).toBe(1);
    }
  });
});

// formatMonthYear()

describe('formatMonthYear', () => {
  test('TC-FE-25: returns Spanish month name and year', () => {
    const result = formatMonthYear(new Date(2026, 5, 15));

    expect(result.toLowerCase()).toContain('junio');
    expect(result).toContain('2026');
  });

  test('TC-FE-26: formats January as "enero" in es-EC locale', () => {
    expect(formatMonthYear(new Date(2026, 0, 1)).toLowerCase()).toContain('enero');
  });
});

// buildRoute()

describe('buildRoute', () => {
  test('TC-FE-27: replaces :id param with provided value', () => {
    expect(buildRoute(ROUTES.PATIENT_PROFILE, { id: '42' })).toBe('/patients/42');
  });

  test('TC-FE-28: returns route unchanged when no params provided', () => {
    expect(buildRoute(ROUTES.LOGIN)).toBe('/login');
  });

  test('TC-FE-29: all ROUTES values are non-empty strings starting with "/"', () => {
    Object.values(ROUTES).forEach((route) => {
      expect(typeof route).toBe('string');
      expect(route.length).toBeGreaterThan(0);
      expect(route.startsWith('/')).toBe(true);
    });
  });

  test('TC-FE-30: admin route does not collide with nutritionist routes', () => {
    expect(ROUTES.ADMIN).not.toBe(ROUTES.HOME);
    expect(ROUTES.ADMIN).not.toBe(ROUTES.DASHBOARD);
    expect(ROUTES.ADMIN_NUTRITIONISTS).not.toBe(ROUTES.PATIENTS);
  });
});
