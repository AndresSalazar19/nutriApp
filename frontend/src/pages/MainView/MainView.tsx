import React, { useState } from 'react';

// Íconos simples como SVG inline — reemplaza por tus SVGs importados cuando los tengas
const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm8-8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
  plan: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  ),
  message: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
    </svg>
  ),
  book: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    </svg>
  ),
  lock: (
    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5 text-gray-400 hover:text-white transition" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  clock: (
    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  check: (
    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
};

const navItems = [
  { label: 'Panel Principal', icon: 'dashboard', locked: false },
  { label: 'Mis Pacientes',   icon: 'users',     locked: true  },
  { label: 'Planes Nutricionales', icon: 'plan', locked: true  },
  { label: 'Agenda',          icon: 'calendar',  locked: true  },
  { label: 'Análisis y Reportes', icon: 'chart', locked: true  },
  { label: 'Mensajes',        icon: 'message',   locked: true  },
  { label: 'Recursos',        icon: 'book',      locked: true  },
];

function DashboardPage() {
  const [activeNav, setActiveNav] = useState('Panel Principal');

  return (
    <div className="flex h-screen bg-gray-50 font-sans">

      {/* ── SIDEBAR ── */}
      <aside className="w-56 bg-green-900 flex flex-col justify-between py-5 px-3 flex-shrink-0">
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 px-2 mb-8">
            {/* Reemplaza este div por tu SVG de logo */}
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🥗</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wide">NutrIA</span>
          </div>

          {/* Navegación */}
          <nav className="space-y-1">
            {navItems.map(({ label, icon, locked }) => {
              const isActive = activeNav === label;
              return (
                <button
                  key={label}
                  onClick={() => !locked && setActiveNav(label)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition
                    ${isActive
                      ? 'bg-green-500 text-white font-semibold'
                      : 'text-green-200 hover:bg-green-800'
                    }
                    ${locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    {icons[icon]}
                    <span>{label}</span>
                  </div>
                  {locked && icons.lock}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Usuario */}
        <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-green-800 transition cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              AS
            </div>
            <div>
              <p className="text-left text-white text-xs font-semibold leading-tight">Dr. Alfonso Silva</p>
              <p className="text-left text-green-300 text-xs">Nutricionista</p>
            </div>
          </div>
          {icons.settings}
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="flex-1 overflow-y-auto p-10">
        <h1 className="text-2xl font-bold text-green-800 mb-8">Panel Principal</h1>

        {/* Reloj grande animado */}
        <div className="flex justify-center mb-6">
          <div className="relative w-36 h-36">
            {/* Círculo exterior punteado */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 144 144">
              <circle
                cx="72" cy="72" r="68"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="6 6"
                opacity="0.5"
              />
            </svg>
            {/* Círculo interior */}
            <div className="absolute inset-4 bg-amber-50 border-4 border-amber-400 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Badge En Revisión */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <span className="border border-amber-400 text-amber-500 text-xs font-semibold px-4 py-1 rounded-full">
            En Revisión
          </span>
        </div>

        {/* Título y descripción */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Cuenta en Proceso de Verificación
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
            Tu registro ha sido recibido exitosamente. Un administrador está revisando
            tu información y documentación profesional para aprobar tu cuenta.
          </p>
        </div>

        {/* Tarjetas informativas */}
        <div className="grid grid-cols-3 gap-5 max-w-5xl mx-auto mb-8">
          {/* Tarjeta 1 */}
          <div className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex-shrink-0 mb-3">{icons.clock}</div>
            <div>
              <h3 className="text-left font-semibold text-gray-700 text-sm mb-1">Tiempo estimado</h3>
              <p className="text-left text-gray-400 text-xs space-y-1">
                La verificación usualmente toma entre 24 y 48 horas hábiles
              </p>
            </div>
          </div>

          {/* Tarjeta 2 */}
          <div className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex-shrink-0 mb-3">{icons.clipboard}</div>
            <div>
              <h3 className="text-left font-semibold text-gray-700 text-sm mb-1">Qué estamos revisando</h3>
              <ul className="text-left text-gray-400 text-xs space-y-1">
                <li>• Licencia profesional vigente</li>
                <li>• Información de contacto</li>
              </ul>
            </div>
          </div>

          {/* Tarjeta 3 */}
          <div className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex-shrink-0 mb-3">{icons.check}</div>
            <div>
              <h3 className="text-left font-semibold text-gray-700 text-sm mb-1">Te notificaremos</h3>
              <p className="text-left text-gray-400 text-xs space-y-1">
                Recibirás un correo electrónico cuando tu cuenta sea aprobada
              </p>
            </div>
          </div>
        </div>

        {/* Soporte */}
        <div className="text-center text-xs text-gray-400">
          ¿Tienes dudas? Contacta a soporte en{' '}
          <a href="mailto:soporte@nutria.com" className="text-green-600 font-semibold hover:underline">
            soporte@nutria.com
          </a>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;