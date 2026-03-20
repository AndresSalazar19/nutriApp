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

  // 2. Si hay sesión pero el rol no está en la lista de permitidos
  if (allowedRoles && role && !allowedRoles.includes(role as Role)) {
    // Redirigimos al usuario a su panel principal correspondiente
    if (role === 'admin') {
      return <Navigate to={ROUTES.ADMIN} replace />;
    }
    // Si es nutricionista o paciente, lo mandamos al dashboard general
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // 3. Si pasa todas las validaciones, Outlet renderiza la ruta anidada
  return <Outlet />;
}