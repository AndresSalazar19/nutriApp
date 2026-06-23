import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar } from '../../components/layout/AdminTopBar';
import { StatCard } from '../../components/ui/StatCard';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import {
  MdEmojiEvents,
  MdPeople,
  MdDescription,
  MdLocalFlorist,
  MdPersonAdd,
  MdGroup,
  MdLibraryBooks,
  MdBarChart,
} from 'react-icons/md';

const statsCards = [
  { icon: MdEmojiEvents, iconBg: 'bg-admin-light', label: 'Nutricionistas', value: '15', change: '↑ 2 este mes', changeType: 'positive' as const, accentColor: 'text-gray-900' },
  { icon: MdPeople, iconBg: 'bg-admin-light', label: 'Clientes Totales', value: '347', change: '↑ 23 este mes', changeType: 'positive' as const, accentColor: 'text-gray-900' },
  { icon: MdDescription, iconBg: 'bg-admin-light', label: 'Suscripciones Activas', value: '289', change: '83% tasa', changeType: 'neutral' as const, accentColor: 'text-gray-900' },
  { icon: MdLocalFlorist, iconBg: 'bg-admin-light', label: 'Artículos Publicados', value: '128', change: '↑ 8 esta semana', changeType: 'positive' as const, accentColor: 'text-gray-900' },
];

interface Nutritionist {
  id: string;
  initials: string;
  color: string;
  name: string;
  email: string;
  specialty: string;
  status: 'active' | 'pending';
}

const nutritionists: Nutritionist[] = [
  { id: '1', initials: 'AS', color: 'bg-admin-light',  name: 'Dr. Alfonso Silva',     email: 'alfonso.silva@nutria.com',   specialty: 'Hipertensión', status: 'active'  },
  { id: '2', initials: 'MG', color: 'bg-admin-light',   name: 'Dra. María García',     email: 'maria.garcia@nutria.com',    specialty: 'Diabetes',     status: 'active'  },
  { id: '3', initials: 'JR', color: 'bg-admin-light',   name: 'Dr. Juan Rodríguez',    email: 'juan.rodriguez@nutria.com',  specialty: 'Obesidad',     status: 'active'  },
  { id: '4', initials: 'LC', color: 'bg-admin-light',   name: 'Dra. Laura Castro',     email: 'laura.castro@nutria.com',    specialty: 'Deportiva',    status: 'pending' },
  { id: '5', initials: 'PM', color: 'bg-admin-light', name: 'Dr. Pedro Morales',     email: 'pedro.morales@nutria.com',   specialty: 'Cardiología',  status: 'active'  },
  { id: '6', initials: 'ST', color: 'bg-admin-light', name: 'Dra. Sara Torres',      email: 'sara.torres@nutria.com',     specialty: 'Pediatría',    status: 'active'  },
  { id: '7', initials: 'DF', color: 'bg-admin-light',   name: 'Dr. Daniel Fernández',  email: 'daniel.fernandez@nutria.com',specialty: 'Renal',        status: 'active'  },
];

const quickActions = [
  { icon: MdPersonAdd, title: 'Agregar Nutricionista', desc: 'Registrar nuevo profesional', iconBg: 'bg-admin-light' },
  { icon: MdGroup, title: 'Gestionar Clientes', desc: 'Ver todos los usuarios', iconBg: 'bg-admin-light' },
  { icon: MdLibraryBooks, title: 'Publicar Contenido', desc: 'Artículos y recursos', iconBg: 'bg-admin-light' },
  { icon: MdBarChart, title: 'Ver Reportes', desc: 'Estadísticas del sistema', iconBg: 'bg-admin-light' },
];

const systemActivity = [
  { text: 'Nuevo nutricionista registrado: Dr. Daniel Fernández', time: 'Hace 2h' },
  { text: '8 nuevos artículos publicados en la biblioteca',        time: 'Hace 5h' },
  { text: '23 nuevos clientes registrados esta semana',            time: 'Hoy'     },
  { text: 'Sistema actualizado a versión 2.5.1',                   time: 'Ayer'    },
];

const columns: Column<Nutritionist>[] = [
  {
    key: 'nombre',
    header: 'Nombre',
    render: (row) => (
      <div className="flex items-center gap-2">
        <Avatar initials={row.initials} color={row.color} size="sm" />
        <div>
          {/* Aquí estaban los colores admin, ahora son grises/negros */}
          <p className="font-semibold text-gray-900 text-xs leading-tight">{row.name}</p>
          <p className="text-gray-500 text-xs">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'especialidad',
    header: 'Especialidad',
    render: (row) => <span className="text-gray-500 text-xs">{row.specialty}</span>,
  },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => <Badge variant={row.status === 'active' ? 'active' : 'pending'} />,
  },
];

function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('Panel Principal');

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      {/* Top bar */}
      <AdminTopBar title="Panel de Administración" />

<div className="bg-admin-bg px-8 pb-8 pt-2">
          {/* Bienvenida */}
          <p className="text-admin-dark font-medium mb-0.5">Bienvenido al panel administrativo</p>
          <p className="text-gray-500 text-sm mb-6">Gestiona nutricionistas, clientes y contenido de la plataforma</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-7">
          {statsCards.map((card) => (
            <StatCard
              key={card.label}
              {...card}
              icon={<card.icon className="text-xl text-admin-dark" />}
            />
          ))}
        </div>

        {/* Grid inferior */}
        <div className="grid grid-cols-5 gap-6">

          {/* Tabla nutricionistas — 3 columnas */}
          <div className="col-span-3 bg-white rounded-xl border-none shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-base">Nutricionistas Recientes</h2>
              <button className="text-gray-900 font-medium text-sm hover:underline">Ver todos →</button>
            </div>
            <DataTable
              columns={columns}
              data={nutritionists}
              keyExtractor={(row) => row.id}
              emptyTitle="No hay nutricionistas"
              emptyIcon="🏥"
            />
          </div>

          {/* Columna derecha — 2 columnas */}
          <div className="col-span-2 flex flex-col gap-5">

            {/* Acciones rápidas */}
            <div className="bg-white rounded-xl border-none shadow-sm p-5">
              <h2 className="font-bold text-gray-800 text-base mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    className="flex items-start gap-3 p-3 rounded-lg bg-admin-bg hover:bg-admin-light transition text-left"
                  >
                    <div className={`w-9 h-9 ${action.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <action.icon className="text-xl text-admin-dark" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-xs leading-tight">{action.title}</p>
                      <p className="text-gray-500 text-xs">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actividad del sistema */}
            <div className="bg-white rounded-xl border-none shadow-sm p-5">
              <h2 className="font-bold text-gray-800 text-base mb-4">Actividad del Sistema</h2>
              <ul className="space-y-3">
                {systemActivity.map((item, i) => (
                  <li key={i} className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-900 mt-0.5 text-xs">•</span>
                      <span className="text-gray-900 text-xs">{item.text}</span>
                    </div>
                    <span className="text-gray-400 text-xs whitespace-nowrap">{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;