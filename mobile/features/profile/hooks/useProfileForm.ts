import { useCallback, useEffect, useState } from 'react';
import { PersonalInfo, HealthInfo, UserProfile } from '../types';
import { UserService, UserAccount } from '@/services/userservice';
import { PatientService, PatientDetail } from '@/services/patientService';
import { useAssignedNutritionist } from './useAssignedNutritionist';
import { avatarStorage } from '../utils/avatarStorage';

const EMPTY_PROFILE: UserProfile = {
  name: '',
  email: '',
  plan: 'Premium',
  personalInfo: {
    cedula: '',
    phone: '',
    birthDate: '',
    height: '',
    gender: '',
  },
  healthInfo: {
    weight: '',
    bmi: '',
    bloodPressure: '',
    activityLevel: '',
    medicalCondition: '',
    allergies: '',
    dietaryRestrictions: '',
  },
  nutritionist: {
    name: '',
    specialty: '',
  },
};

const ACTIVITY_LEVEL_LABELS: Record<string, string> = {
  sedentario: 'Sedentario',
  moderado: 'Moderado',
  pesado: 'Pesado',
};

function formatBirthDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}

function mapUserToProfile(user: UserAccount): UserProfile {
  const person = user.person;
  const fullName = person ? `${person.first_name} ${person.last_name}`.trim() : '';

  return {
    name: fullName || user.email,
    email: user.email,
    plan: 'Premium',
    personalInfo: {
      cedula: person?.cedula ?? '',
      phone: person?.phone ?? '',
      birthDate: formatBirthDate(person?.date_of_birth),
      height: '',
      gender: person?.gender ?? '',
    },
    healthInfo: {
      weight: '',
      bmi: '',
      bloodPressure: '',
      activityLevel: '',
      medicalCondition: '',
      allergies: '',
      dietaryRestrictions: '',
    },
    nutritionist: {
      name: '',
      specialty: '',
    },
  };
}

/** Traduce el detalle real del paciente (lo que se llenó en el onboarding)
 *  a los textos que pinta la tarjeta "Información de Salud" del perfil. */
function mapPatientDetailToHealthInfo(detail: PatientDetail): { height: string; healthInfo: HealthInfo } {
  const height = detail.height_m ? `${Math.round(detail.height_m * 100)} cm` : '';
  const weight = detail.weight_kg ? `${detail.weight_kg} kg` : 'Sin registrar';
  const bmi = detail.bmi ? `${detail.bmi} · ${bmiLabel(detail.bmi)}` : 'Sin registrar';
  const bloodPressure =
    detail.systolic && detail.diastolic ? `${detail.systolic}/${detail.diastolic} mmHg` : 'Sin registrar';
  const activityLevel = detail.activity_level ? ACTIVITY_LEVEL_LABELS[detail.activity_level] : 'Sin registrar';
  const conditions: string[] = [];
  if (detail.hypertension_diagnosed) conditions.push('Hipertensión');
  const pathological = (detail.clinical_history as any)?.pathological;
  if (Array.isArray(pathological?.conditions)) {
    pathological.conditions.forEach((c: string) => {
      if (c !== 'Otra' && !conditions.includes(c)) conditions.push(c);
    });
    if (pathological.other_condition) conditions.push(pathological.other_condition);
  }
  const medicalCondition = conditions.length ? conditions.join(', ') : 'Ninguna registrada';
  const allergies = detail.allergies.length ? detail.allergies.join(', ') : 'Ninguna registrada';
  const dietaryRestrictions = detail.dietary_restrictions.length
    ? detail.dietary_restrictions.join(', ')
    : 'Ninguna registrada';

  return {
    height,
    healthInfo: { weight, bmi, bloodPressure, activityLevel, medicalCondition, allergies, dietaryRestrictions },
  };
}

export interface ActiveModal {
  field: keyof PersonalInfo | keyof HealthInfo;
  section: 'personal' | 'health';
}

export function useProfileForm(userId: string) {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);

  const { nutritionist: assignedNutritionist } = useAssignedNutritionist(userId || undefined);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const user = await UserService.getById(userId);
      const next = mapUserToProfile(user);

      // El detalle de salud es "best effort": si el paciente todavía no
      // completó el onboarding (o falla la llamada), igual mostramos los
      // datos personales en vez de tumbar toda la pantalla de perfil.
      try {
        const detail = await PatientService.getDetail(userId);
        const { height, healthInfo } = mapPatientDetailToHealthInfo(detail);
        next.personalInfo.height = height || next.personalInfo.height;
        next.healthInfo = healthInfo;
      } catch {
        // Se deja el healthInfo vacío del mapUserToProfile.
      }

      setProfile(next);
    } catch {
      setError('No se pudo cargar el perfil. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  // Carga la foto de perfil guardada localmente (no viene del backend).
  // Se re-ejecuta si cambia el usuario logueado, para no mostrar la foto de
  // una sesión anterior mientras carga la del usuario actual.
  useEffect(() => {
    if (!userId) {
      setImageUri(null);
      return;
    }
    let cancelled = false;
    avatarStorage.get(userId).then((uri) => {
      if (!cancelled) setImageUri(uri);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Persiste la nueva foto localmente cada vez que el usuario elige una,
  // además de actualizar el estado que ya usa AvatarPicker.
  const updateImageUri = useCallback(
    (uri: string) => {
      setImageUri(uri);
      if (userId) {
        avatarStorage.set(userId, uri).catch(() => {
          // Falla silenciosa: la foto igual se ve en esta sesión de la app
          // (queda en el estado), solo no sobrevivirá a cerrar la app.
        });
      }
    },
    [userId],
  );

  // Se combina por separado del resto del perfil: el nutricionista tiene su
  // propio fetch/estado de carga (useAssignedNutritionist), así que no
  // bloquea ni depende del resto de mapUserToProfile.
  useEffect(() => {
    if (!assignedNutritionist) return;
    setProfile((prev) => ({
      ...prev,
      nutritionist: {
        id: assignedNutritionist.id,
        name: assignedNutritionist.name,
        specialty: assignedNutritionist.specialty ?? '',
      },
    }));
  }, [assignedNutritionist]);

  const activeValue = activeModal
    ? activeModal.section === 'personal'
      ? profile.personalInfo[activeModal.field as keyof PersonalInfo]
      : profile.healthInfo[activeModal.field as keyof HealthInfo]
    : '';

  function openModal(
    field: keyof PersonalInfo | keyof HealthInfo,
    section: 'personal' | 'health',
  ) {
    setActiveModal({ field, section });
  }

  function closeModal() {
    setActiveModal(null);
  }

  function saveField(value: string) {
    if (!activeModal) return;

    if (activeModal.section === 'personal') {
      setProfile(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [activeModal.field]: value,
        },
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        healthInfo: {
          ...prev.healthInfo,
          [activeModal.field]: value,
        },
      }));
    }
  }

  return {
    profile,
    loading,
    error,
    reload: load,
    imageUri,
    setImageUri: updateImageUri,
    activeModal,
    activeValue,
    openModal,
    closeModal,
    saveField,
    assignedNutritionist,
  };
}