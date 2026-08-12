import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useConsentStatus } from '../hooks/useConsentStatus';
import { useNutritionistStatus } from '../hooks/useNutritionistStatus';
import { ConsentService } from '../services/Consent/ConsentService';
import { AccessDeniedModal } from '../components/ui/AccessDeniedModal';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { ROUTES } from './routes';

const ITEM_LABELS: Record<string, string> = {
  terms_and_conditions: 'Términos y condiciones',
  privacy_policy: 'Política de privacidad',
  responsible_clinical_data_use: 'Uso responsable de datos clínicos',
  professional_confidentiality_agreement: 'Acuerdo de confidencialidad profesional',
};

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * Wraps every nutritionist route. Combines the consent check and the
 * verification-status check (previously two nested guards, each with its own
 * loading spinner) into a single gate: both requests fire in parallel and
 * share one loading phase, instead of the status check only starting once
 * consent had already finished — that serial double-spinner, plus a one-frame
 * flash of the /dashboard "pending" screen for already-verified nutritionists
 * before bouncing to /home, is what showed up as flickering right after login.
 */
export function NutritionistAccessGate() {
  const consent = useConsentStatus();
  const nutritionistStatus = useNutritionistStatus();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [signatureName, setSignatureName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loading = consent.loading || nutritionistStatus.loading;
  const willRedirectHome =
    nutritionistStatus.status === 'verified' && location.pathname === ROUTES.DASHBOARD;

  useEffect(() => {
    if (!loading && willRedirectHome) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [loading, willRedirectHome, navigate]);

  async function handleAcceptConsent() {
    if (!signatureName.trim()) {
      setSubmitError('Escribe tu nombre completo como firma.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await ConsentService.accept(signatureName.trim());
      consent.refetch();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <PageLoader />;

  if (consent.error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm text-center">
          <p className="text-sm text-gray-600 mb-4">
            No se pudo verificar tu consentimiento: {consent.error}
          </p>
          <Button variant="primary" onClick={consent.refetch}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const consentPending = !!consent.status?.required && !consent.status.accepted;

  if (consentPending) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Antes de continuar</h2>
            <p className="text-sm text-gray-500 mt-1">
              Para usar la plataforma como nutricionista, debes aceptar lo siguiente.
            </p>
          </div>

          <div className="px-6 py-5">
            <ul className="space-y-2 mb-4">
              {consent.status!.required_items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-nutri-dark mt-0.5">✓</span>
                  {ITEM_LABELS[item] ?? item}
                </li>
              ))}
            </ul>

            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-4">
              Toda la información registrada en esta plataforma es confidencial y de uso exclusivo
              del profesional de salud autorizado. El nutricionista es responsable del manejo ético
              y profesional de los datos del paciente.
            </p>

            <label className="text-xs font-semibold text-gray-500 uppercase">
              Firma digital — escribe tu nombre completo
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Nombre completo"
              className="mt-1 w-full rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-nutri-medium"
            />

            {submitError && <p className="text-sm text-admin-accent mt-3">{submitError}</p>}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
            <Button variant="success" onClick={handleAcceptConsent} disabled={submitting}>
              {submitting ? 'Guardando...' : 'Aceptar y continuar'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (nutritionistStatus.status === 'rejected' || nutritionistStatus.status === 'suspended') {
    const handleDone = () => {
      logout();
      navigate(ROUTES.LOGIN, { replace: true });
    };
    return <AccessDeniedModal status={nutritionistStatus.status} onDone={handleDone} />;
  }

  if (willRedirectHome) {
    // Already know we're bouncing to /home in the effect above — render the
    // loader instead of the matched /dashboard route so it never flashes.
    return <PageLoader />;
  }

  // pending → renders matched child (MainView)
  // verified (not on /dashboard) → renders matched child (HomePage or other routes)
  return <Outlet />;
}
