import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useConsentStatus } from '../hooks/useConsentStatus';
import { ConsentService } from '../services/Consent/ConsentService';
import { Button } from '../components/ui/Button';

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
 * Wraps every authenticated route. Blocks access (no dismiss, no backdrop
 * click-through) until the current user has an accepted consent record for
 * the current version — the DB row is the source of truth, not local state.
 */
export function ConsentGate() {
  const { status, loading, error, refetch } = useConsentStatus();
  const [signatureName, setSignatureName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm text-center">
          <p className="text-sm text-gray-600 mb-4">
            No se pudo verificar tu consentimiento: {error}
          </p>
          <Button variant="primary" onClick={refetch}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!status || !status.required || status.accepted) {
    return <Outlet />;
  }

  async function handleAccept() {
    if (!signatureName.trim()) {
      setSubmitError('Escribe tu nombre completo como firma.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await ConsentService.accept(signatureName.trim());
      refetch();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

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
            {status.required_items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-nutri-dark mt-0.5">✓</span>
                {ITEM_LABELS[item] ?? item}
              </li>
            ))}
          </ul>

          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-4">
            Toda la información registrada en esta plataforma es confidencial y de uso
            exclusivo del profesional de salud autorizado. El nutricionista es responsable
            del manejo ético y profesional de los datos del paciente.
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
          <Button variant="success" onClick={handleAccept} disabled={submitting}>
            {submitting ? 'Guardando...' : 'Aceptar y continuar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
