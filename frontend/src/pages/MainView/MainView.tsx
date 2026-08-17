import React from 'react';
import { NutritionistSidebar } from '../../components/layout/NutritionistSidebar';
import { Badge } from '../../components/ui/Badge';

const cardIcons = {
  clock: (
    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  clipboard: (
    <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  check: (
    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
};

export default function MainView() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar bloqueado — nutricionista no verificado */}
      <NutritionistSidebar locked={true} />

      <main className="flex-1 overflow-y-auto p-10">
        <h1 className="text-2xl font-bold text-nutri-dark mb-8">Panel Principal</h1>

        {/* Reloj decorativo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-36 h-36">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 144 144">
              <circle
                cx="72"
                cy="72"
                r="68"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="6 6"
                opacity="0.5"
              />
            </svg>
            <div className="absolute inset-4 bg-amber-50 border-4 border-amber-400 rounded-full flex items-center justify-center shadow-md">
              <svg
                className="w-12 h-12 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6l4 2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Badge de estado */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <Badge variant="revision" label="En revisión" />
        </div>

        {/* Mensaje principal */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Cuenta en Proceso de Verificación
          </h2>
          <p className="text-gray-600 text-sm max-w-lg mx-auto leading-relaxed">
            Tu registro ha sido recibido exitosamente. Un administrador está revisando tu
            información y documentación profesional para aprobar tu cuenta.
          </p>
        </div>

        {/* Tarjetas informativas */}
        <div className="grid grid-cols-3 gap-5 max-w-5xl mx-auto mb-8">
          <div className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex-shrink-0">{cardIcons.clock}</div>
            <div>
              <h3 className="text-left font-semibold text-gray-700 text-sm mb-1">
                Tiempo estimado
              </h3>
              <p className="text-left text-gray-400 text-xs">
                La verificación usualmente toma entre 24 y 48 horas hábiles
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex-shrink-0">{cardIcons.clipboard}</div>
            <div>
              <h3 className="text-left font-semibold text-gray-700 text-sm mb-1">
                Qué estamos revisando
              </h3>
              <ul className="text-left text-gray-400 text-xs space-y-1">
                <li>• Licencia profesional vigente</li>
                <li>• Información de contacto</li>
              </ul>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex-shrink-0">{cardIcons.check}</div>
            <div>
              <h3 className="text-left font-semibold text-gray-700 text-sm mb-1">
                Te notificaremos
              </h3>
              <p className="text-left text-gray-400 text-xs">
                Recibirás un correo electrónico cuando tu cuenta sea aprobada
              </p>
            </div>
          </div>
        </div>

        {/* Soporte */}
        <div className="text-center text-xs text-gray-400">
          ¿Tienes dudas? Contacta a soporte en{' '}
          <a
            href="mailto:soporte@nutria.com"
            className="text-nutri-medium font-semibold hover:underline"
          >
            soporte@nutria.com
          </a>
        </div>
      </main>
    </div>
  );
}
