import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from './routes';
import { PublicRoute } from './PublicRoute';
import { PrivateRoute } from './PrivateRoute';
import { NutritionistStatusGuard } from './NutritionistStatusGuard';
import { AuthProvider, useAuth, AuthUser } from '../hooks/useAuth';


const LoginPage         = lazy(() => import('../pages/Login/LoginPage'));
const RegisterPage      = lazy(() => import('../pages/Register/RegisterPage'));
//NUTRIONIST
const MainView          = lazy(() => import('../pages/MainView/MainView'));
const HomePage          = lazy(() => import('../pages/MainView/HomePage'));
const PatientsPage      = lazy(() => import('../pages/MainView/PatientsPage'));
const AgendaPage        = lazy(() => import('../pages/MainView/AgendaPage'));
const ReportsPage       = lazy(() => import('../pages/MainView/ReportsPage'));
const ResourcesPage     = lazy(() => import('../pages/MainView/ResourcesPage'));

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
  const { login } = useAuth();
 
  const handleLogin = (userData: { userId: string; email: string; role: string; token: string }) => {
    login(userData as AuthUser, userData.token);
    if (userData.role === 'admin') {
      navigate(ROUTES.ADMIN, { replace: true });
    } else {
      navigate(ROUTES.DASHBOARD, { replace: true });
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
  const { login } = useAuth();
 
  const handleRegistered = (userData: { userId: string; email: string; role: string; token?: string }) => {
    login(userData as AuthUser, userData.token ?? '');
    navigate(ROUTES.DASHBOARD, { replace: true });
  };
 
  return (
    <RegisterPage
      onGoToLogin={() => navigate(ROUTES.LOGIN)}
      onRegistered={handleRegistered}
    />
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
 
        {/* ── Públicas ── */}
        <Route path={ROUTES.LOGIN}    element={<PublicRoute><LoginWrapper /></PublicRoute>} />
        <Route path={ROUTES.REGISTER} element={<PublicRoute><RegisterWrapper /></PublicRoute>} />
 
        {/* ── Nutricionista (requiere rol + guard de estado) ── */}
        <Route element={<PrivateRoute allowedRoles={['nutritionist']} />}>
          <Route element={<NutritionistStatusGuard />}>
            {/* pending → MainView (pantalla de verificación) */}
            <Route path={ROUTES.DASHBOARD}  element={<MainView />} />
            {/* verified → acceso completo */}
            <Route path={ROUTES.HOME}       element={<HomePage />} />
            <Route path={ROUTES.PATIENTS} element={<PatientsPage />} />
            <Route path={ROUTES.AGENDA}     element={<AgendaPage />} />
            <Route path={ROUTES.REPORTS}    element={<ReportsPage />} />
            <Route path={ROUTES.RESOURCES}  element={<ResourcesPage />} />
          </Route>
        </Route>
 
        {/* ── Admin ── */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path={ROUTES.ADMIN}               element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN_NUTRITIONISTS} element={<NutritionistsPage />} />
          <Route path={ROUTES.ADMIN_CONTENT}       element={<ContentPage />} />
          <Route path={ROUTES.ADMIN_CLIENTS}       element={<ClientPage />} />
        </Route>
 
        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
 
      </Routes>
    </Suspense>
  );
}
 
// ─── Root: BrowserRouter → AuthProvider → Rutas ──────────────────────────────
// AuthProvider debe estar DENTRO de BrowserRouter para poder usar useNavigate.
 
export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}