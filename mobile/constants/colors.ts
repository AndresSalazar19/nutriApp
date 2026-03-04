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
} as const;
