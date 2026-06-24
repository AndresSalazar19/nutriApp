import { useEffect, useState } from 'react';

interface AccessDeniedModalProps {
  status: 'rejected' | 'suspended';
  onDone: () => void;
}

const COUNTDOWN = 5;

const MESSAGES: Record<'rejected' | 'suspended', { title: string; body: string }> = {
  rejected: {
    title: 'Cuenta rechazada',
    body: 'Tu solicitud de registro como nutricionista no fue aprobada. Si crees que es un error, contacta a soporte.',
  },
  suspended: {
    title: 'Cuenta suspendida',
    body: 'Tu cuenta ha sido suspendida temporalmente. Contacta al equipo de soporte para más información.',
  },
};

export function AccessDeniedModal({ status, onDone }: AccessDeniedModalProps) {
  const [seconds, setSeconds] = useState(COUNTDOWN);

  useEffect(() => {
    if (seconds <= 0) {
      onDone();
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, onDone]);

  const { title, body } = MESSAGES[status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 z-10 p-6 text-center">
        {/* Icono */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">{body}</p>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-400">
            Serás redirigido al inicio en <span className="font-bold text-red-500">{seconds}</span>{' '}
            segundo{seconds !== 1 ? 's' : ''}…
          </p>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-red-400 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${(seconds / COUNTDOWN) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
