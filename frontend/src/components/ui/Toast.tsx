import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error';

export interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, type = 'success', isVisible, onClose }: ToastProps) {
  // Auto-cerrar después de 3 segundos
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed top-6 right-6 z-[100] animate-[slideInRight_0.3s_ease-out]">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border ${
          isSuccess
            ? 'bg-white border-nutri-medium/30 text-gray-800'
            : 'bg-white border-admin-accent/30 text-gray-800'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
            isSuccess ? 'bg-nutri-light/30 text-nutri-dark' : 'bg-admin-bg text-admin-accent'
          }`}
        >
          {isSuccess ? '✓' : '✕'}
        </div>
        <p className="text-sm font-semibold">{message}</p>
        <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600 transition p-1">
          ✕
        </button>
      </div>
    </div>
  );
}
