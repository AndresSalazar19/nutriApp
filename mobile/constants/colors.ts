/**
 * Centralized color palette for the NutrIA mobile app.
 * Source of truth: frontend nutritionist profile (green theme).
 *
 * All color usage must reference this file — no hardcoded hex strings in components.
 */
export const COLORS = {
  // ── Brand identity (from frontend tailwind: nutri-*) ──
  primary: '#2D6A4F',
  primaryDark: '#1B4332',
  primaryMedium: '#40916C',
  primaryAccent: '#52B788',
  primaryLight: '#D8F3DC',

  // ── Surfaces ──
  background: '#F7F8F3',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F7F3',

  // ── Text ──
  textPrimary: '#1A2E25',
  textSecondary: '#5F7A6E',
  textMuted: '#9BB5A8',
  textOnPrimary: '#FFFFFF',

  // ── Borders & dividers ──
  border: '#E0EDE6',
  divider: '#F0F5F2',

  // ── Inputs ──
  inputBg: '#FAFBF9',
  placeholder: '#9BB5A8',

  // ── Semantic ──
  error: '#C0392B',
  errorLight: '#FEF2F2',
  errorBorder: '#F5C2C2',
  warning: '#D97706',
  warningLight: '#FFFDE7',
  warningBorder: '#FDD835',
  success: '#40916C',

  // ── Data visualization (semantic health metrics) ──
  danger: '#E53935',
  chartBlue: '#4A90D9',
  chartOrange: '#FB8C00',
  chartPurple: '#9C6FD6',

  // ── Premium ──
  premium: '#D97706',
  premiumLight: '#FFF8E1',

  // ── Common ──
  white: '#FFFFFF',
  black: '#000000',

  // ── Overlays (for use on primary-colored headers) ──
  backdrop: 'rgba(0,0,0,0.4)',
  overlay: 'rgba(255,255,255,0.25)',
  overlayMedium: 'rgba(255,255,255,0.85)',
  overlaySubtle: 'rgba(255,255,255,0.2)',
} as const;
