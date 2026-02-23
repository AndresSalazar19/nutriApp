import React, { useState } from 'react';

const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm8-8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
  nutritionist: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
  clients: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  content: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  reports: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    </svg>
  ),
  settingsGear: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  arrowUp: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  ),
};

const navItems = [
  { label: 'Panel Principal', icon: 'dashboard' },
  { label: 'Nutricionistas', icon: 'nutritionist' },
  { label: 'Clientes', icon: 'clients' },
  { label: 'Contenido', icon: 'content' },
  { label: 'Configuración', icon: 'settings' },
  { label: 'Reportes', icon: 'reports' },
];

const statsCards = [
  {
    label: 'Nutricionistas',
    value: '15',
    change: '↑ 2 este mes',
    changeColor: 'text-green-500',
    icon: '🏅',
    iconBg: 'bg-yellow-100',
  },
  {
    label: 'Clientes Totales',
    value: '347',
    change: '↑ 23 este mes',
    changeColor: 'text-green-500',
    icon: '👥',
    iconBg: 'bg-blue-100',
  },
  {
    label: 'Suscripciones Activas',
    value: '289',
    change: '83% tasa',
    changeColor: 'text-orange-400',
    icon: '📋',
    iconBg: 'bg-purple-100',
  },
  {
    label: 'Artículos Publicados',
    value: '128',
    change: '↑ 8 esta semana',
    changeColor: 'text-green-500',
    icon: '🌸',
    iconBg: 'bg-pink-100',
  },
];

const nutritionists = [
  { initials: 'AS', color: 'bg-green-500', name: 'Dr. Alfonso Silva', email: 'alfonso.silva@nutria.com', specialty: 'Hipertensión', status: 'Activo', statusColor: 'text-green-600 bg-green-50' },
  { initials: 'MG', color: 'bg-pink-500', name: 'Dra. María García', email: 'maria.garcia@nutria.com', specialty: 'Diabetes', status: 'Activo', statusColor: 'text-green-600 bg-green-50' },
  { initials: 'JR', color: 'bg-blue-500', name: 'Dr. Juan Rodríguez', email: 'juan.rodriguez@nutria.com', specialty: 'Obesidad', status: 'Activo', statusColor: 'text-green-600 bg-green-50' },
  { initials: 'LC', color: 'bg-teal-500', name: 'Dra. Laura Castro', email: 'laura.castro@nutria.com', specialty: 'Deportiva', status: 'Pendiente', statusColor: 'text-orange-500 bg-orange-50' },
  { initials: 'PM', color: 'bg-indigo-500', name: 'Dr. Pedro Morales', email: 'pedro.morales@nutria.com', specialty: 'Cardiología', status: 'Activo', statusColor: 'text-green-600 bg-green-50' },
  { initials: 'ST', color: 'bg-orange-500', name: 'Dra. Sara Torres', email: 'sara.torres@nutria.com', specialty: 'Pediatría', status: 'Activo', statusColor: 'text-green-600 bg-green-50' },
  { initials: 'DF', color: 'bg-blue-700', name: 'Dr. Daniel Fernández', email: 'daniel.fernandez@nutria.com', specialty: 'Renal', status: 'Activo', statusColor: 'text-green-600 bg-green-50' },
];

const quickActions = [
  { icon: '🏅', title: 'Agregar Nutricionista', desc: 'Registrar nuevo profesional', iconBg: 'bg-yellow-100' },
  { icon: '👥', title: 'Gestionar Clientes', desc: 'Ver todos los usuarios', iconBg: 'bg-blue-100' },
  { icon: '📗', title: 'Publicar Contenido', desc: 'Artículos y recursos', iconBg: 'bg-green-100' },
  { icon: '📊', title: 'Ver Reportes', desc: 'Estadísticas del sistema', iconBg: 'bg-blue-100' },
];

const systemActivity = [
  { text: 'Nuevo nutricionista registrado: Dr. Daniel Fernández', time: 'Hace 2h' },
  { text: '8 nuevos artículos publicados en la biblioteca', time: 'Hace 5h' },
  { text: '23 nuevos clientes registrados esta semana', time: 'Hoy' },
  { text: 'Sistema actualizado a versión 2.5.1', time: 'Ayer' },
];

function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('Panel Principal');

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-52 bg-red-600 flex flex-col justify-between py-5 px-3 flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 mb-7">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-base">🥗</span>
            </div>
            <div>
              <span className="text-white font-bold text-base leading-none">NutrIA</span>
              <p className="text-red-200 text-xs leading-none">Admin</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {navItems.map(({ label, icon }) => {
              const isActive = activeNav === label;
              return (
                <button
                  key={label}
                  onClick={() => setActiveNav(label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition text-left
                    ${isActive
                      ? 'bg-red-800 text-white font-semibold'
                      : 'text-red-100 hover:bg-red-700'
                    }`}
                >
                  {icons[icon]}
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin user */}
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer">
          <div className="w-9 h-9 bg-red-800 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            AD
          </div>
          <div>
            <p className="text-white text-xs font-semibold leading-tight">Administrador</p>
            <p className="text-red-300 text-xs">Sistema NutrIA</p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-red-600">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition">
              {icons.bell}
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition">
              {icons.settingsGear}
            </button>
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* Welcome */}
          <p className="text-gray-700 font-medium mb-1">Bienvenido al panel administrativo 👋</p>
          <p className="text-gray-400 text-sm mb-6">Gestiona nutricionistas, clientes y contenido de la plataforma</p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-7">
            {statsCards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${card.iconBg} rounded-full flex items-center justify-center text-xl`}>
                    {card.icon}
                  </div>
                  <span className="text-gray-500 text-sm">{card.label}</span>
                </div>
                <p className="text-3xl font-bold text-red-500 mb-1">{card.value}</p>
                <p className={`text-xs ${card.changeColor}`}>{card.change}</p>
              </div>
            ))}
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-5 gap-6">
            {/* Nutricionistas Recientes — col-span 3 */}
            <div className="col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800 text-base">Nutricionistas Recientes</h2>
                <button className="text-red-500 text-sm hover:underline">Ver todos →</button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase border-b border-gray-100">
                    <th className="text-left pb-2 font-semibold">Nombre</th>
                    <th className="text-left pb-2 font-semibold">Especialidad</th>
                    <th className="text-left pb-2 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {nutritionists.map((n) => (
                    <tr key={n.email} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 ${n.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {n.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700 text-xs leading-tight">{n.name}</p>
                            <p className="text-gray-400 text-xs">{n.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-gray-500 text-xs">{n.specialty}</td>
                      <td className="py-2.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${n.statusColor}`}>
                          {n.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right column — col-span 2 */}
            <div className="col-span-2 flex flex-col gap-5">
              {/* Acciones Rápidas */}
              <div className="bg-white rounded-xl border-2 border-blue-400 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 text-base mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.title}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition text-left"
                    >
                      <div className={`w-9 h-9 ${action.iconBg} rounded-full flex items-center justify-center text-lg flex-shrink-0`}>
                        {action.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 text-xs leading-tight">{action.title}</p>
                        <p className="text-gray-400 text-xs">{action.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actividad del Sistema */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 text-base mb-4">Actividad del Sistema</h2>
                <ul className="space-y-3">
                  {systemActivity.map((item, i) => (
                    <li key={i} className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5 text-xs">•</span>
                        <span className="text-gray-600 text-xs">{item.text}</span>
                      </div>
                      <span className="text-gray-400 text-xs whitespace-nowrap">{item.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
