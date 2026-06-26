import React, { useCallback, useEffect, useState } from 'react';
import { NutritionistLayout } from '../../components/layout/NutritionistLayout';
import { useAuth } from '../../hooks/useAuth';
import {
  NutritionistService,
  NutritionistProfileDetail,
  AvailabilityRule,
  AvailabilityCalendar,
  NutritionistDocumentResponse,
} from '../../services/NutritionistService';
import { EmptyState } from '../../components/ui/EmptyState';
import { NutritionistProfileCards } from '../../components/ui/NutritionistProfileCards';
import { AvailabilitySection } from '../../components/ui/AvailabilitySection';
import {
  AvailabilityEditorModal,
  DeleteAvailabilityModal,
  AvailabilityFormState,
} from '../../components/ui/AvailabilityModals';

const DEFAULT_FORM: AvailabilityFormState = {
  rule_type: 'recurring',
  day_of_week: 0,
  specific_date: '',
  start_time: '08:00',
  end_time: '17:00',
  is_block: false,
};

export default function NutritionistProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<NutritionistProfileDetail | null>(null);
  const [calendar, setCalendar] = useState<AvailabilityCalendar | null>(null);

  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityRule | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [formState, setFormState] = useState<AvailabilityFormState>(DEFAULT_FORM);

  const loadProfile = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      NutritionistService.getNutritionistProfile(user.userId),
      NutritionistService.getAvailabilityCalendar(user.userId),
    ])
      .then(([p, calendarData]) => {
        setProfile(p);
        setCalendar(calendarData);
      })
      .catch((e) => setError(e.message ?? 'Error al cargar perfil'))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const openEditor = (
    availability?: AvailabilityRule,
    defaultRuleType: 'recurring' | 'exception' = 'recurring',
  ) => {
    setSelectedAvailability(availability ?? null);
    if (availability) {
      const isBlock =
        availability.rule_type === 'exception' &&
        (availability.start_time == null || availability.end_time == null);
      setFormState({
        rule_type: availability.rule_type as 'recurring' | 'exception',
        day_of_week: availability.day_of_week ?? 0,
        specific_date: availability.specific_date ?? '',
        start_time: availability.start_time ?? '08:00',
        end_time: availability.end_time ?? '17:00',
        is_block: isBlock,
      });
    } else {
      setFormState({ ...DEFAULT_FORM, rule_type: defaultRuleType });
    }
    setEditorError(null);
    setIsEditorOpen(true);
  };

  const openEditorForDay = (dayOfWeek: number) => {
    setSelectedAvailability(null);
    setFormState({ ...DEFAULT_FORM, day_of_week: dayOfWeek });
    setEditorError(null);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setSelectedAvailability(null);
    setEditorError(null);
  };

  const openDeleteConfirm = (availability: AvailabilityRule) => {
    setSelectedAvailability(availability);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setSelectedAvailability(null);
  };

  const handleFormChange = (
    field: keyof AvailabilityFormState,
    value: string | boolean | number,
  ) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSaveAvailability = async () => {
    if (!profile) return;
    setEditorLoading(true);
    setEditorError(null);

    const payload: any = { rule_type: formState.rule_type };

    if (formState.rule_type === 'recurring') {
      payload.day_of_week = Number(formState.day_of_week);
      payload.start_time = formState.start_time;
      payload.end_time = formState.end_time;
      payload.is_available = !formState.is_block;
    } else {
      payload.specific_date = formState.specific_date || undefined;
      if (!formState.is_block) {
        payload.start_time = formState.start_time;
        payload.end_time = formState.end_time;
        payload.is_available = true;
      }
    }

    try {
      if (selectedAvailability) {
        await NutritionistService.updateAvailability(selectedAvailability.id, payload);
      } else {
        await NutritionistService.createAvailability(profile.user.id, payload);
      }
      closeEditor();
      loadProfile();
    } catch (err: any) {
      setEditorError(err.message ?? 'Error al guardar disponibilidad');
    } finally {
      setEditorLoading(false);
    }
  };

  const handleDeleteAvailability = async () => {
    if (!selectedAvailability) return;
    setEditorLoading(true);
    setEditorError(null);
    try {
      await NutritionistService.deleteAvailability(selectedAvailability.id);
      closeDeleteConfirm();
      loadProfile();
    } catch (err: any) {
      setEditorError(err.message ?? 'Error al eliminar disponibilidad');
    } finally {
      setEditorLoading(false);
    }
  };

  if (loading) {
    return (
      <NutritionistLayout>
        <div className="px-8 py-6">
          <p className="text-sm text-gray-500">Cargando perfil de nutricionista...</p>
        </div>
      </NutritionistLayout>
    );
  }

  if (error) {
    return (
      <NutritionistLayout>
        <div className="px-8 py-6">
          <EmptyState title="Error" description={error} />
        </div>
      </NutritionistLayout>
    );
  }

  if (!profile) {
    return (
      <NutritionistLayout>
        <div className="px-8 py-6">
          <EmptyState title="No encontrado" description="Perfil no encontrado" />
        </div>
      </NutritionistLayout>
    );
  }

  return (
    <NutritionistLayout>
      <div className="px-8 py-6 space-y-4">
        <NutritionistProfileCards profile={profile} />

        <AvailabilitySection
          calendar={calendar}
          onAdd={() => openEditor()}
          onAddDay={openEditorForDay}
          onAddException={() => openEditor(undefined, 'exception')}
          onEdit={openEditor}
          onDelete={openDeleteConfirm}
        />

        {/* Documentos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h4 className="font-bold text-gray-800 text-sm mb-3">Documentos</h4>
          {profile.documents.length === 0 ? (
            <p className="text-sm text-gray-500">Sin documentos cargados</p>
          ) : (
            <div className="space-y-2">
              {profile.documents.map((d: NutritionistDocumentResponse) => (
                <div key={d.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {d.file_name ?? d.file_path}
                    </div>
                    <div className="text-xs text-gray-500">{d.document_type}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs">{d.is_verified ? 'Verificado' : 'No verificado'}</div>
                    <a
                      href={d.file_path.startsWith('http') ? d.file_path : d.file_path}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-nutri-medium underline"
                    >
                      Ver / Descargar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AvailabilityEditorModal
        isOpen={isEditorOpen}
        onClose={closeEditor}
        selectedAvailability={selectedAvailability}
        formState={formState}
        onChange={handleFormChange}
        onSave={handleSaveAvailability}
        loading={editorLoading}
        error={editorError}
      />

      <DeleteAvailabilityModal
        isOpen={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        selectedAvailability={selectedAvailability}
        onConfirm={handleDeleteAvailability}
        loading={editorLoading}
        error={editorError}
      />
    </NutritionistLayout>
  );
}
