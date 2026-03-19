import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from './routes';
import { useAuth } from '../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, role } = useAuth();

  // Si ya está autenticado, redirige según su rol
  // if (isAuthenticated) {
  //  return <Navigate to={role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD} replace />;
  //}

  return <>{children}</>;
}