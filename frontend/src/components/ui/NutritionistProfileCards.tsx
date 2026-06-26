import React from 'react';
import { NutritionistProfileDetail } from '../../services/NutritionistService';
import { Badge } from './Badge';

interface Props {
  profile: NutritionistProfileDetail;
}

export function NutritionistProfileCards({ profile }: Props) {
  const person = profile.user?.person;
  const fullName = person ? `${person.first_name} ${person.last_name}` : profile.user?.email;

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-700">
            {person ? (
              <span>
                {person.first_name?.[0]}
                {person.last_name?.[0]}
              </span>
            ) : (
              <span>NU</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">{fullName}</h2>
            <p className="text-sm text-gray-500">{profile.user?.email}</p>
            <div className="mt-2">
              <Badge variant={profile.status as any} />
            </div>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h4 className="font-bold text-gray-800 text-sm mb-3">Información Personal</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <div>
              <strong>Nombre:</strong> {fullName ?? '—'}
            </div>
            <div>
              <strong>Correo:</strong> {profile.user?.email ?? '—'}
            </div>
            <div>
              <strong>Teléfono:</strong> {person?.phone ?? '—'}
            </div>
            <div>
              <strong>Género:</strong> {person?.gender ?? '—'}
            </div>
            <div>
              <strong>Fecha de nacimiento:</strong> {person?.date_of_birth ?? '—'}
            </div>
            <div>
              <strong>Cédula:</strong> {person?.cedula ?? '—'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h4 className="font-bold text-gray-800 text-sm mb-3">Información Profesional</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <div>
              <strong>Nº Licencia:</strong> {profile.license_number ?? '—'}
            </div>
            <div>
              <strong>Especialidad:</strong> {profile.specialty?.name ?? '—'}
            </div>
            <div>
              <strong>Años experiencia:</strong> {profile.years_experience ?? '—'}
            </div>
            <div>
              <strong>Biografía:</strong> {profile.bio ?? '—'}
            </div>
            <div>
              <strong>Formación:</strong> {profile.education ?? '—'}
            </div>
            <div>
              <strong>Tarifa:</strong>{' '}
              {profile.consultation_fee != null ? `$ ${profile.consultation_fee}` : '—'}
            </div>
            <div>
              <strong>Máx pacientes:</strong> {profile.max_patients ?? '—'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
