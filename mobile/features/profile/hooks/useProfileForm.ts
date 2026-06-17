import { useCallback, useEffect, useState } from 'react';
import { PersonalInfo, HealthInfo, UserProfile } from '../types';
import { UserService, UserAccount } from '@/services/userservice';

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
    medicalCondition: '',
    allergies: '',
  },
  nutritionist: {
    name: '',
    specialty: '',
  },
};

function formatBirthDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
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
      medicalCondition: '',
      allergies: '',
    },
    nutritionist: {
      name: '',
      specialty: '',
    },
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

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const user = await UserService.getById(userId);
      setProfile(mapUserToProfile(user));
    } catch {
      setError('No se pudo cargar el perfil. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

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
    setImageUri,
    activeModal,
    activeValue,
    openModal,
    closeModal,
    saveField,
  };
}