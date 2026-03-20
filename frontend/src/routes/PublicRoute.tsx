import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  useAuth();

  // Si ya está autenticado, redirige según su rol
  // if (isAuthenticated) {
  //  return <Navigate to={role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD} replace />;
  //}

  return <>{children}</>;
}