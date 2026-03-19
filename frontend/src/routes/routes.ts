export const ROUTES = {
  // Públicas (sin autenticación)
  LOGIN:    '/login',
  REGISTER: '/register',

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
  ADMIN_REPORTS:        '/admin/reports',
  ADMIN_SETTINGS:       '/admin/settings',
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