import React, { useEffect, useState } from 'react';
import {
  NutritionistProfile,
  NutritionistService,
  NutritionistDocuments,
} from '../../services/NutritionistService';
import { API_URL } from '../../config/api';
import { Avatar } from '../../components/ui/Avatar';

interface ReviewPanelProps {
  nutritionist: NutritionistProfile | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onRejectClick: () => void;
}

export function NutritionistReviewPanel({
  nutritionist,
  onClose,
  onApprove,
  onRejectClick,
}: ReviewPanelProps) {
  const [documents, setDocuments] = useState<NutritionistDocuments | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  useEffect(() => {
    if (nutritionist) {
      setIsLoadingDocs(true);
      NutritionistService.getDocuments(nutritionist.id)
        .then(setDocuments)
        .catch((err) => console.error('Error cargando documentos:', err))
        .finally(() => setIsLoadingDocs(false));
    } else {
      setDocuments(null);
    }
  }, [nutritionist]);

  if (!nutritionist) return null;

  const { user, specialty } = nutritionist;
  const getDocUrl = (path?: string | null) =>
    path ? `${API_URL.replace('/api/v1', '')}/${path}` : '#';

  const avatarUrl = user.avatar_url ? `${API_URL.replace('/api/v1', '')}/${user.avatar_url}` : null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-admin-dark/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out] z-50">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Revisión de Perfil</h2>
            <p className="text-xs text-gray-500">
              Estado actual: <span className="uppercase font-semibold">{nutritionist.status}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={avatarUrl}
              initials={`${user.person.first_name[0]}${user.person.last_name[0]}`.toUpperCase()}
              color="bg-admin-light"
              size="lg"
            />
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {user.person.first_name} {user.person.last_name}
              </h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Datos Personales
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Cédula:</span>
                <span className="text-sm font-semibold text-gray-900">{user.person.cedula}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Teléfono:</span>
                <span className="text-sm font-semibold text-gray-900">{user.person.phone}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Datos Profesionales
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Especialidad:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {specialty?.name || 'No especificada'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Experiencia:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {nutritionist.years_experience ?? 0} años
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Documentos Adjuntos
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📄</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Curriculum Vitae</p>
                  </div>
                </div>
                {isLoadingDocs ? (
                  <span className="text-xs text-gray-400">Cargando...</span>
                ) : documents?.cv_url ? (
                  <a
                    href={getDocUrl(documents.cv_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-admin-dark hover:text-admin-accent hover:underline"
                  >
                    Ver PDF ↗
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">No disponible</span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎓</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Registro Senescyt</p>
                  </div>
                </div>
                {isLoadingDocs ? (
                  <span className="text-xs text-gray-400">Cargando...</span>
                ) : documents?.senescyt_url ? (
                  <a
                    href={getDocUrl(documents.senescyt_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-admin-dark hover:text-admin-accent hover:underline"
                  >
                    Ver Archivo ↗
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">No disponible</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {nutritionist.status === 'pending' && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex gap-3">
            <button
              onClick={onRejectClick}
              className="flex-1 py-2.5 border border-admin-accent text-admin-accent font-semibold rounded-lg hover:bg-admin-bg transition text-sm"
            >
              Rechazar Solicitud
            </button>
            <button
              onClick={() => onApprove(nutritionist.id)}
              className="flex-1 py-2.5 bg-admin-medium hover:bg-admin-dark text-white font-semibold rounded-lg transition shadow-sm text-sm"
            >
              Aprobar e Invitar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
