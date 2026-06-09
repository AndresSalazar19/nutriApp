/**
 * Centralized color palette for the NutrIA app.
 * All color usage must reference this file — no hardcoded hex strings in components.
 */
export const COLORS = {
  /** Primary brand green. Use for buttons, accents, active states. */
  primary: '#4CAF50',

  /** Dark variant. Use for text and icons on light backgrounds. */
  primaryDark: '#388E3C',

  /** Light tint. Use for card backgrounds and selected state fills. */
  primaryLight: '#E8F5E9',

  /** Ultra-light tint. Use for subtle surface backgrounds. */
  primaryUltraLight: '#F1F8E9',

  /** Alias for primary — use when explicitly describing a background. */
  backgroundPrimary: '#4CAF50',

  accent: '#FF6B6B',
  accentBlue: '#4A90D9',
  accentOrange: '#FF9800',
  accentPurple: '#9C6FD6',
  success: '#4CAF82',
  warning: '#FF9800',
  danger: '#FF6B6B',
  background: '#F7FAF8',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F7F3',
  border: '#E0EDE6',
  textPrimary: '#1A2E25',
  textSecondary: '#6B8C7A',
  textMuted: '#9BB5A8',
  white: '#FFFFFF',
} as const;
