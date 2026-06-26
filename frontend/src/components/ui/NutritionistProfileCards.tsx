import React from 'react';
import { API_URL } from '../../config/api';
import { Avatar } from './Avatar';
import { NutritionistProfileDetail } from '../../services/NutritionistService';
import { Badge } from './Badge';

interface Props {
  profile: NutritionistProfileDetail;
  previewUrl?: string | null;
  selectedFile?: File | null;
  uploadError?: string | null;
  onFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmUpload?: () => void;
  onCancelUpload?: () => void;
  isUploading?: boolean;
}

export function NutritionistProfileCards({
  profile,
  previewUrl,
  selectedFile,
  uploadError,
  onFileChange,
  onConfirmUpload,
  onCancelUpload,
  isUploading,
}: Props) {
  const person = profile.user?.person;
  const fullName = person ? `${person.first_name} ${person.last_name}` : profile.user?.email;

  const avatarSource =
    previewUrl ||
    (profile.user?.avatar_url
      ? `${API_URL.replace('/api/v1', '')}/${profile.user.avatar_url}`
      : null);
  const initials = person
    ? `${person.first_name?.[0] ?? ''}${person.last_name?.[0] ?? ''}`.toUpperCase() || 'NU'
    : 'NU';

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              src={avatarSource}
              initials={initials}
              color="bg-gray-200 text-gray-700"
              size="lg"
            />
            <label className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-gray-600 cursor-pointer shadow-md hover:scale-110 transition-transform translate-x-1 translate-y-1">
              <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              <span className="text-[10px]">✎</span>
            </label>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">{fullName}</h2>
            <p className="text-sm text-gray-500">{profile.user?.email}</p>
            <div className="mt-2">
              <Badge variant={profile.status as any} />
            </div>
          </div>
        </div>

        {selectedFile && (
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onConfirmUpload}
              disabled={isUploading}
              className="px-4 py-2 bg-admin-medium text-white rounded-lg text-sm font-semibold hover:bg-admin-dark transition disabled:opacity-50"
            >
              {isUploading ? 'Subiendo...' : 'Confirmar'}
            </button>
            <button
              type="button"
              onClick={onCancelUpload}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
          </div>
        )}
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
          </div>
        </div>
      </div>
    </>
  );
}
