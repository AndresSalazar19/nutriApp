// Guard para rutas protegidas.
// Si el usuario no está autenticado, redirige al login.
// Si no tiene el rol correcto, redirige a su vista correspondiente.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from './routes';
import { useAuth } from '../hooks/useAuth';

type Role = 'nutritionist' | 'admin';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role as Role)) {
    return <Navigate to={role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}