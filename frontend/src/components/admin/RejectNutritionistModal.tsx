import React, { useState } from 'react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (reason: string) => void;
  isSubmitting: boolean;
}

export function RejectNutritionistModal({
  isOpen,
  onClose,
  onConfirmReject,
  isSubmitting,
}: RejectModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason.trim().length === 0) return;
    onConfirmReject(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-admin-dark/60 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-[fade-in_0.2s_ease-out]">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-admin-bg flex items-center justify-center mb-4 text-admin-accent text-xl">
            ⚠️
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Rechazar Solicitud</h3>
          <p className="text-sm text-gray-500 mb-6">
            Por favor, indica el motivo del rechazo. Este mensaje será enviado al profesional para
            que pueda corregir su solicitud.
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: El documento de la Senescyt no es legible..."
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent min-h-[100px] resize-none"
            disabled={isSubmitting}
          />
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || reason.trim().length === 0}
            className="px-4 py-2 text-sm font-semibold text-white bg-admin-accent hover:bg-red-700 rounded-lg transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Confirmar Rechazo
          </button>
        </div>
      </div>
    </div>
  );
}
