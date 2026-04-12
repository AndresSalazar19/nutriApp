import { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useNutritionistStatus } from '../hooks/useNutritionistStatus';
import { AccessDeniedModal } from '../components/ui/AccessDeniedModal';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from './routes';

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * Wraps all nutritionist routes.
 *
 * - loading         → spinner
 * - pending         → allows the matched route to render (MainView pending screen)
 * - verified        → if on /dashboard, redirects to /home; otherwise renders Outlet
 * - rejected/suspended → AccessDeniedModal for 5 s, then logout + redirect to login
 */
export function NutritionistStatusGuard() {
  const { status, loading } = useNutritionistStatus();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && status === 'verified' && location.pathname === ROUTES.DASHBOARD) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [loading, status, location.pathname, navigate]);

  if (loading) return <PageLoader />;

  if (status === 'rejected' || status === 'suspended') {
    const handleDone = () => {
      logout();
      navigate(ROUTES.LOGIN, { replace: true });
    };
    return <AccessDeniedModal status={status} onDone={handleDone} />;
  }

  // pending → renders matched child (MainView)
  // verified → renders matched child (HomePage or other routes)
  return <Outlet />;
}
