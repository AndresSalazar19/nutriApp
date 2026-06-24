import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routes'; // Ajusta la ruta si es necesario
import { useAuth } from '../../hooks/useAuth'; // Ajusta la ruta a tu hook

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  // Si el usuario ya está logueado, lo sacamos de aquí
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to={ROUTES.ADMIN} replace />;
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Si no hay usuario, mostramos el componente (ej. el LoginWrapper)
  return <>{children}</>;
};
