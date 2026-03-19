import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routes';
import { PublicRoute } from './PublicRoute';
import { PrivateRoute } from './PrivateRoute';
import { useNavigate } from 'react-router-dom';

// Lazy loading
// Cada página se carga solo cuando el usuario la visita.
// Mejora el tiempo de carga inicial del bundle.
const LoginPage          = lazy(() => import('../pages/Login/LoginPage'));
const RegisterPage       = lazy(() => import('../pages/Register/RegisterPage'));
const MainView           = lazy(() => import('../pages/MainView/MainView'));
const AdminDashboard     = lazy(() => import('../pages/AdminDashboard/AdminDashboard'));
const NutritionistsPage = lazy(() => import('../pages/AdminDashboard/NutritionistsPage'));

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    </div>
  );
}

// Wrappers de navegación
// Conecta los props onLogin/onGoToRegister con React Router.

function LoginWrapper() {
  const navigate = useNavigate();
  return (
    <LoginPage
      onLogin={() => navigate(ROUTES.DASHBOARD)}
      onGoToRegister={() => navigate(ROUTES.REGISTER)}
    />
  );
}

function RegisterWrapper() {
  const navigate = useNavigate();
  return (
    <RegisterPage
      onGoToLogin={() => navigate(ROUTES.LOGIN)}
    />
  );
}

// ── Router principal ───────────────────────────────────────
export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ── Rutas públicas ── */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicRoute>
                <LoginWrapper />
              </PublicRoute>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <PublicRoute>
                <RegisterWrapper />
              </PublicRoute>
            }
          />

          {/* ── Rutas nutricionista ── */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <PrivateRoute allowedRoles={['nutritionist']}>
                <MainView />
              </PrivateRoute>
            }
          />

          {/* ── Rutas admin ── */}
          <Route
            path={ROUTES.ADMIN}
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN_NUTRITIONISTS}
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <NutritionistsPage />
              </PrivateRoute>
            }
          />

          {/* Cualquier ruta desconocida → login */}
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}