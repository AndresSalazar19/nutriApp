import React, { lazy, Suspense } from 'react';
// Unificamos las importaciones de react-router-dom
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from './routes';
import { PublicRoute } from './PublicRoute';
import { PrivateRoute } from './PrivateRoute';

// Lazy loading
const LoginPage         = lazy(() => import('../pages/Login/LoginPage'));
const RegisterPage      = lazy(() => import('../pages/Register/RegisterPage'));
const MainView          = lazy(() => import('../pages/MainView/MainView'));
const AdminDashboard    = lazy(() => import('../pages/AdminDashboard/AdminDashboard'));
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
function LoginWrapper() {
  const navigate = useNavigate();

  // Nueva lógica: Recibe el rol y decide a dónde enviar al usuario
  const handleSuccessfulLogin = (role) => {
    if (role === 'admin') {
      navigate(ROUTES.ADMIN);
    } else if (role === 'nutritionist' || role === 'patient') { 
      // Nota: Agregué 'patient' basado en tu primer mensaje, 
      // ajusta esto según cómo se llame el rol en tu base de datos final.
      navigate(ROUTES.DASHBOARD);
    } else {
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <LoginPage
      onLogin={handleSuccessfulLogin}
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
          <Route path={ROUTES.LOGIN} element={
            <PublicRoute>
              <LoginWrapper />
            </PublicRoute>
          } />
          
          <Route path={ROUTES.REGISTER} element={
            <PublicRoute>
              <RegisterWrapper />
            </PublicRoute>
          } />

          {/* ── Rutas protegidas (Nested Routes) ── */}
          
          {/* Dashboard (Nutricionistas / Pacientes) */}
          <Route element={<PrivateRoute allowedRoles={['nutritionist', 'patient']} />}>
            <Route path={ROUTES.DASHBOARD} element={<MainView />} />
            {/* Si agregas más vistas para este rol, simplemente ponlas aquí abajo */}
          </Route>

          {/* Administrador */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
            <Route path={ROUTES.ADMIN_NUTRITIONISTS} element={<NutritionistsPage />} />
          </Route>

          {/* Cualquier ruta desconocida → login */}
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}