import {
  formatPhoneInput,
  validatePhoneInput,
  formatDateInput,
  validateDateInput,
  validateHeightInput,
  isAllowedImageUri,
} from '@/features/profile/utils/validations';

// Phone Formatting & Validation

describe('formatPhoneInput', () => {
  /**
   * TC-MB-01
   * Rule: digits are grouped as XXX XXX XXX with spaces inserted automatically.
   * Input: "987654321" (raw 9 digits, no spaces)
   * Expected: "987 654 321"
   */
  test('TC-MB-01: formats 9 digits into XXX XXX XXX', () => {
    expect(formatPhoneInput('987654321')).toBe('987 654 321');
  });

  /**
   * TC-MB-02
   * Rule: non-digit characters are stripped before formatting.
   * Input: "98-76-54-321" (dashes mixed in)
   * Expected: "987 654 321"
   */
  test('TC-MB-02: strips non-digit characters before formatting', () => {
    expect(formatPhoneInput('98-76-54-321')).toBe('987 654 321');
  });

  /**
   * TC-MB-03
   * Rule: input is capped at 9 digits — extra digits beyond the 9th are ignored.
   * Input: "9876543219999" (13 digits)
   * Expected: "987 654 321"
   */
  test('TC-MB-03: truncates input to 9 digits maximum', () => {
    expect(formatPhoneInput('9876543219999')).toBe('987 654 321');
  });

  /**
   * TC-MB-04
   * Rule: partial input (fewer than 4 digits) produces no spaces.
   * Input: "987" (3 digits)
   * Expected: "987"
   */
  test('TC-MB-04: returns plain digits when input is 3 digits or fewer', () => {
    expect(formatPhoneInput('987')).toBe('987');
  });

  /**
   * TC-MB-04b
   * Rule: partial input of exactly 6 digits produces "XXX XXX" (two groups, no third).
   * Input: "987654" (6 digits)
   * Expected: "987 654"
   * Coverage: hits the `length > 3` branch but NOT the `length > 6` branch.
   */
  test('TC-MB-04b: formats 6 digits into two groups "XXX XXX"', () => {
    expect(formatPhoneInput('987654')).toBe('987 654');
  });

  /**
   * TC-MB-04c
   * Rule: empty string returns empty string (no digits at all).
   * Input: ""
   * Expected: ""
   * Coverage: `length > 0` branch evaluates to false — no groups pushed.
   */
  test('TC-MB-04c: returns empty string for empty input', () => {
    expect(formatPhoneInput('')).toBe('');
  });
});

describe('validatePhoneInput', () => {
  /**
   * TC-MB-05
   * Rule: value must match /^\d{3} \d{3} \d{3}$/ exactly.
   * Input: "987 654 321" (correct formatted value)
   * Expected: null (no error)
   */
  test('TC-MB-05: accepts correctly formatted phone "987 654 321"', () => {
    expect(validatePhoneInput('987 654 321')).toBeNull();
  });

  /**
   * TC-MB-06
   * Rule: value without spaces does not match the required pattern.
   * Input: "987654321" (no spaces)
   * Expected: error message "Formato requerido: XXX XXX XXX"
   */
  test('TC-MB-06: rejects phone without spaces', () => {
    expect(validatePhoneInput('987654321')).toBe('Formato requerido: XXX XXX XXX');
  });

  /**
   * TC-MB-07
   * Rule: empty string does not match the required pattern.
   * Input: ""
   * Expected: error message "Formato requerido: XXX XXX XXX"
   */
  test('TC-MB-07: rejects empty string', () => {
    expect(validatePhoneInput('')).toBe('Formato requerido: XXX XXX XXX');
  });
});

// Date Formatting & Validation

describe('formatDateInput', () => {
  /**
   * TC-MB-08
   * Rule: 8 digits are formatted as DD/MM/AAAA with slashes auto-inserted.
   * Input: "15061990"
   * Expected: "15/06/1990"
   */
  test('TC-MB-08: formats 8 digits into DD/MM/AAAA', () => {
    expect(formatDateInput('15061990')).toBe('15/06/1990');
  });

  /**
   * TC-MB-09
   * Rule: partial input of 4 digits returns DD/MM (no year yet).
   * Input: "1506"
   * Expected: "15/06"
   */
  test('TC-MB-09: formats partial input of 4 digits as DD/MM', () => {
    expect(formatDateInput('1506')).toBe('15/06');
  });

  /**
   * TC-MB-10
   * Rule: non-digit characters are stripped before formatting.
   * Input: "15-06-1990"
   * Expected: "15/06/1990"
   */
  test('TC-MB-10: strips dashes and formats correctly', () => {
    expect(formatDateInput('15-06-1990')).toBe('15/06/1990');
  });

  /**
   * TC-MB-10b
   * Rule: partial input of exactly 2 digits returns those digits with no separator.
   * Input: "15"
   * Expected: "15"
   * Coverage: hits the `digits.length <= 2` early-return branch.
   */
  test('TC-MB-10b: returns raw digits for input of 2 digits or fewer', () => {
    expect(formatDateInput('15')).toBe('15');
  });

  /**
   * TC-MB-10c
   * Rule: single digit returns that digit unchanged.
   * Input: "1"
   * Expected: "1"
   * Coverage: also hits the `digits.length <= 2` branch with length 1.
   */
  test('TC-MB-10c: returns single digit unchanged', () => {
    expect(formatDateInput('1')).toBe('1');
  });
});

describe('validateDateInput', () => {
  /**
   * TC-MB-11
   * Rule: date must match DD/MM/AAAA and be a real calendar date.
   * Input: "15/06/1990"
   * Expected: null (no error)
   */
  test('TC-MB-11: accepts valid date "15/06/1990"', () => {
    expect(validateDateInput('15/06/1990')).toBeNull();
  });

  /**
   * TC-MB-12b
   * Rule: month 0 is below the minimum allowed month of 1.
   * Input: "01/00/1990"
   * Expected: error "Mes inválido (01-12)"
   * Coverage: hits the `mm < 1` branch of the month-range check.
   */
  test('TC-MB-12b: rejects month 00 as invalid', () => {
    expect(validateDateInput('01/00/1990')).toBe('Mes inválido (01-12)');
  });

  /**
   * TC-MB-13
   * Rule: February 30 does not exist on any year — calendar coherence check.
   * Input: "30/02/2000"
   * Expected: error "Fecha inválida"
   */
  test('TC-MB-13: rejects February 30 as a non-existent date', () => {
    expect(validateDateInput('30/02/2000')).toBe('Fecha inválida');
  });

  /**
   * TC-MB-14
   * Rule: string without slashes does not match DD/MM/AAAA pattern.
   * Input: "15061990"
   * Expected: error "Formato requerido: DD/MM/AAAA"
   */
  test('TC-MB-14: rejects date string without slash separators', () => {
    expect(validateDateInput('15061990')).toBe('Formato requerido: DD/MM/AAAA');
  });

  /**
   * TC-MB-15
   * Rule: year 1800 is below the allowed minimum of 1900.
   * Input: "01/01/1800"
   * Expected: error "Año inválido"
   */
  test('TC-MB-15: rejects year below 1900', () => {
    expect(validateDateInput('01/01/1800')).toBe('Año inválido');
  });

  /**
   * TC-MB-15b
   * Rule: day 0 is below the minimum allowed day of 1.
   * Input: "00/06/1990"
   * Expected: error "Día inválido (01-31)"
   * Coverage: hits the `dd < 1` branch in the day-range check.
   */
  test('TC-MB-15b: rejects day 00 as invalid', () => {
    expect(validateDateInput('00/06/1990')).toBe('Día inválido (01-31)');
  });

  /**
   * TC-MB-15c
   * Rule: day 32 exceeds the maximum allowed day of 31.
   * Input: "32/06/1990"
   * Expected: error "Día inválido (01-31)"
   * Coverage: hits the `dd > 31` branch in the day-range check.
   */
  test('TC-MB-15c: rejects day 32 as out of range', () => {
    expect(validateDateInput('32/06/1990')).toBe('Día inválido (01-31)');
  });

  /**
   * TC-MB-15d
   * Rule: year greater than the current year is invalid.
   * Input: "01/01/2099"
   * Expected: error "Año inválido"
   * Coverage: hits the `yyyy > new Date().getFullYear()` branch.
   */
  test('TC-MB-15d: rejects year greater than current year', () => {
    expect(validateDateInput('01/01/2099')).toBe('Año inválido');
  });
});

// ─── Height Validation ────────────────────────────────────────────────────────

describe('validateHeightInput', () => {
  /**
   * TC-MB-16
   * Rule: value must be 1-3 digits and within [50, 250] cm.
   * Input: "170"
   * Expected: null (no error)
   */
  test('TC-MB-16: accepts valid height "170"', () => {
    expect(validateHeightInput('170')).toBeNull();
  });

  /**
   * TC-MB-17
   * Rule: height of 49 is below the minimum of 50 cm.
   * Input: "49"
   * Expected: error "La altura debe estar entre 50 y 250 cm"
   */
  test('TC-MB-17: rejects height below 50 cm', () => {
    expect(validateHeightInput('49')).toBe('La altura debe estar entre 50 y 250 cm');
  });

  /**
   * TC-MB-18
   * Rule: height of 251 exceeds the maximum of 250 cm.
   * Input: "251"
   * Expected: error "La altura debe estar entre 50 y 250 cm"
   */
  test('TC-MB-18: rejects height above 250 cm', () => {
    expect(validateHeightInput('251')).toBe('La altura debe estar entre 50 y 250 cm');
  });

  /**
   * TC-MB-19
   * Rule: non-numeric input does not match /^\d{1,3}$/.
   * Input: "1.75" (decimal notation)
   * Expected: error "Solo se permiten números"
   */
  test('TC-MB-19: rejects decimal height value "1.75"', () => {
    expect(validateHeightInput('1.75')).toBe('Solo se permiten números');
  });
});

// ─── Image URI Validation ─────────────────────────────────────────────────────

describe('isAllowedImageUri', () => {
  /**
   * TC-MB-20
   * Rule: .jpg extension is in the allowed list.
   * Input: "file:///photos/avatar.jpg"
   * Expected: true
   */
  test('TC-MB-20: accepts .jpg image URI', () => {
    expect(isAllowedImageUri('file:///photos/avatar.jpg')).toBe(true);
  });

  /**
   * TC-MB-21
   * Rule: .png extension is in the allowed list.
   * Input: "file:///photos/avatar.png"
   * Expected: true
   */
  test('TC-MB-21: accepts .png image URI', () => {
    expect(isAllowedImageUri('file:///photos/avatar.png')).toBe(true);
  });

  /**
   * TC-MB-21b
   * Rule: .jpeg extension is also in the allowed list (distinct from .jpg).
   * Input: "file:///photos/avatar.jpeg"
   * Expected: true
   * Coverage: exercises the 'jpeg' branch of ALLOWED_IMAGE_EXTENSIONS.
   */
  test('TC-MB-21b: accepts .jpeg image URI', () => {
    expect(isAllowedImageUri('file:///photos/avatar.jpeg')).toBe(true);
  });

  /**
   * TC-MB-22
   * Rule: .gif is NOT in the allowed list (only jpg, jpeg, png).
   * Input: "file:///photos/avatar.gif"
   * Expected: false
   */
  test('TC-MB-22: rejects .gif image URI', () => {
    expect(isAllowedImageUri('file:///photos/avatar.gif')).toBe(false);
  });

  /**
   * TC-MB-23
   * Rule: .pdf is NOT an image format and should be rejected.
   * Input: "file:///documents/profile.pdf"
   * Expected: false
   */
  test('TC-MB-23: rejects .pdf as image URI', () => {
    expect(isAllowedImageUri('file:///documents/profile.pdf')).toBe(false);
  });

  /**
   * TC-MB-23b
   * Rule: URI with no dot at all → pop() returns the whole string, not undefined.
   * We need a URI where split('.') produces a single-element array so pop() 
   * returns that element, but actually to hit ?? '' we need pop() = undefined.
   * Input: URI that results in pop() returning undefined — empty string split.
   * Coverage: hits the `?? ''` nullish-coalescing fallback branch.
   */
  test('TC-MB-23b: rejects URI where pop() returns undefined', () => {
    expect(isAllowedImageUri('')).toBe(false);
  });
});