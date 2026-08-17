// ─── Phone ────────────────────────────────────────────────────────────────────
// Stored format: "+593 XXX XXX XXX"   Input format: "XXX XXX XXX"

/** Formats the 9-digit part as XXX XXX XXX (removes non-digits, max 9 digits) */
export function formatPhoneInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 9);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 6));
  if (digits.length > 6) parts.push(digits.slice(6, 9));
  return parts.join(' ');
}

/** Validates the 9-digit input part (without +593 prefix) */
export function validatePhoneInput(value: string): string | null {
  if (!/^\d{3} \d{3} \d{3}$/.test(value)) {
    return 'Formato requerido: XXX XXX XXX';
  }
  return null;
}

// ─── Date ─────────────────────────────────────────────────────────────────────
// Stored & input format: "DD/MM/AAAA"

/** Auto-inserts / separators as the user types (strips non-digits first) */
export function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Validates DD/MM/AAAA including calendar coherence */
export function validateDateInput(value: string): string | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return 'Formato requerido: DD/MM/AAAA';
  }
  const [dd, mm, yyyy] = value.split('/').map(Number);
  if (mm < 1 || mm > 12) return 'Mes inválido (01-12)';
  if (dd < 1 || dd > 31) return 'Día inválido (01-31)';
  const date = new Date(yyyy, mm - 1, dd);
  if (date.getDate() !== dd || date.getMonth() !== mm - 1) return 'Fecha inválida';
  if (yyyy < 1900 || yyyy > new Date().getFullYear()) return 'Año inválido';
  return null;
}

// ─── Height ───────────────────────────────────────────────────────────────────
// Stored format: "XXX cm"   Input format: "XXX" (digits only)

/** Validates that value is 1-3 digits and within a reasonable range */
export function validateHeightInput(value: string): string | null {
  if (!/^\d{1,3}$/.test(value)) return 'Solo se permiten números';
  const h = parseInt(value, 10);
  if (h < 50 || h > 250) return 'La altura debe estar entre 50 y 250 cm';
  return null;
}

// ─── Image ────────────────────────────────────────────────────────────────────
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png'];

export function isAllowedImageUri(uri: string): boolean {
  // istanbul ignore next
  const ext = uri.split('.').pop()?.toLowerCase() ?? '';
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext);
}
