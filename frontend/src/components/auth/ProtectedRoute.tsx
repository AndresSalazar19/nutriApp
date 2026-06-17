import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../../routes/routes'; // Ajusta la ruta
import { useAuth } from '../../hooks/useAuth'; // Ajusta la ruta a tu hook

interface PrivateRouteProps {
  allowedRoles: ('admin' | 'nutritionist')[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  // 1. Si no hay usuario en lo absoluto -> al login
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // 2. Si hay usuario, pero su rol no coincide con el array permitido -> lo pateamos a su casa
  if (!allowedRoles.includes(user.role as 'admin' | 'nutritionist')) {
    if (user.role === 'admin') {
      return <Navigate to={ROUTES.ADMIN} replace />;
    } else {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  // 3. Si todo es correcto, renderizamos la ruta hija
  return <Outlet />;
};