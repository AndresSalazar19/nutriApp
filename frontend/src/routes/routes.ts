export const ROUTES = {
  // Públicas (sin autenticación)
  LOGIN:           '/login',
  REGISTER:        '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Nutricionista
  DASHBOARD:       '/dashboard',
  HOME:            '/home',
  PATIENTS:        '/patients',
  PATIENT_PROFILE: '/patients/:id',
  PLANS:           '/plans',
  AGENDA:          '/agenda',
  REPORTS:         '/reports',
  MESSAGES:        '/messages',
  RESOURCES:       '/resources',

  // Admin
  ADMIN:                '/admin',
  ADMIN_NUTRITIONISTS:  '/admin/nutritionists',
  ADMIN_CLIENTS:        '/admin/clients',
  ADMIN_CONTENT:        '/admin/content',
  ADMIN_DATABASES:      '/admin/databases',
  ADMIN_REPORTS:        '/admin/reports',
  ADMIN_SETTINGS:       '/admin/settings',
  ADMIN_PROFILE:        '/admin/profile',
} as const;

export function buildRoute(
  route: string,
  params: Record<string, string> = {}
): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    route
  );
}