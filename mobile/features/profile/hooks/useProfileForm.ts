import { useState } from 'react';
import { PersonalInfo, HealthInfo, UserProfile } from '../types';

// ─── Mock initial data (replace with API call when backend is ready) ──────────
const INITIAL_PROFILE: UserProfile = {
  name: 'Juan Pérez García',
  email: 'juan.perez@ejemplo.com',
  plan: 'Premium',
  personalInfo: {
    phone: '+593 999 999 999',
    birthDate: '15/03/1985',
    height: '175 cm',
    gender: 'Masculino',
  },
  healthInfo: {
    medicalCondition: 'Hipertensión',
    allergies: 'Ninguna',
  },
  nutritionist: {
    name: 'Dr. Alfonso Silva',
    specialty: 'Nutricionista Clínico',
  },
};

export interface ActiveModal {
  field: keyof PersonalInfo | keyof HealthInfo;
  section: 'personal' | 'health';
}

export function useProfileForm() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);

  // ── Derived value for the currently editing field ─────────────────────────
  const activeValue = activeModal
    ? activeModal.section === 'personal'
      ? profile.personalInfo[activeModal.field as keyof PersonalInfo]
      : profile.healthInfo[activeModal.field as keyof HealthInfo]
    : '';

  // ── Open a specific field modal ───────────────────────────────────────────
  function openModal(field: keyof PersonalInfo | keyof HealthInfo, section: 'personal' | 'health') {
    setActiveModal({ field, section });
  }

  function closeModal() {
    setActiveModal(null);
  }

  // ── Save the edited value back to the corresponding section ───────────────
  function saveField(value: string) {
    if (!activeModal) return;

    if (activeModal.section === 'personal') {
      setProfile((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [activeModal.field]: value,
        },
      }));
    } else {
      setProfile((prev) => ({
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
    imageUri,
    setImageUri,
    activeModal,
    activeValue,
    openModal,
    closeModal,
    saveField,
  };
}
