import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from './routes';
import { PublicRoute } from './PublicRoute';
import { PrivateRoute } from './PrivateRoute';
import { useAuth, AuthUser } from '../hooks/useAuth';


const LoginPage         = lazy(() => import('../pages/Login/LoginPage'));
const RegisterPage      = lazy(() => import('../pages/Register/RegisterPage'));
//NUTRIONIST
const MainView          = lazy(() => import('../pages/MainView/MainView'));

//ADMIN
const AdminDashboard    = lazy(() => import('../pages/AdminDashboard/AdminDashboard'));
const NutritionistsPage = lazy(() => import('../pages/AdminDashboard/NutritionistsPage'));
const ContentPage       = lazy(() => import('../pages/AdminDashboard/ContentPage'));
const ClientPage        = lazy(() => import('../pages/AdminDashboard/ClientPage'));

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

// ── Wrappers de navegación ─────────────────────────────────

function LoginWrapper() {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogin = (userData: { userId: string; email: string; role: string }) => {
    auth.login(userData as AuthUser);
    if (userData.role === 'admin') {
      navigate(ROUTES.ADMIN);
    } else {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <LoginPage
      onLogin={handleLogin}
      onGoToRegister={() => navigate(ROUTES.REGISTER)}
    />
  );
}

function RegisterWrapper() {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleRegistered = (userData: { userId: string; email: string; role: string }) => {
    auth.login(userData as AuthUser);
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <RegisterPage
      onGoToLogin={() => navigate(ROUTES.LOGIN)}
      onRegistered={handleRegistered}
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
            <Route path={ROUTES.ADMIN_CONTENT} element={<ContentPage />} />
            <Route path={ROUTES.ADMIN_CLIENTS} element={<ClientPage />} />
          </Route>

          {/* Cualquier ruta desconocida → login */}
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}