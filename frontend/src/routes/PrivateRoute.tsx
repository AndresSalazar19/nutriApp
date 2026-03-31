import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from './routes';
import { useAuth } from '../hooks/useAuth';

// Añadí 'patient' basado en lo que me comentaste al inicio. 
// Si al final no lo usas, puedes quitarlo sin problema.
type Role = 'nutritionist' | 'admin' | 'patient';

interface PrivateRouteProps {
  allowedRoles?: Role[];
}

export function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const { isAuthenticated, role } = useAuth();

  // 1. Si no hay sesión, se va al login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

 if (allowedRoles && role && !allowedRoles.includes(role)) {
  switch (role) {
    case 'admin':
      return <Navigate to={ROUTES.ADMIN} replace />;

    case 'nutritionist':
      return <Navigate to={ROUTES.DASHBOARD} replace />;

    default:
      // fallback por si aparece otro rol
      return <Navigate to={ROUTES.LOGIN} replace />;
  }
}
  // 3. Si pasa todas las validaciones, Outlet renderiza la ruta anidada
  return <Outlet />;
}