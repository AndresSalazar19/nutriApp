import { useCallback, useMemo, useState } from 'react';
import { ActivityLevel, HealthData } from '../types';

export type HealthField =
  | 'weight'
  | 'height'
  | 'systolic'
  | 'diastolic'
  | 'hasHypertension'
  | 'activityLevel';

export type HealthFieldErrors = Partial<Record<HealthField, string>>;

// Mismos rangos que el backend (PatientHealthUpdate en app/schemas/patient.py)
// para que el usuario vea el error al instante, sin esperar el round-trip.
const WEIGHT_MIN = 20;
const WEIGHT_MAX = 300;
const HEIGHT_MIN = 0.5;
const HEIGHT_MAX = 2.5;
const SYSTOLIC_MIN = 70;
const SYSTOLIC_MAX = 250;
const DIASTOLIC_MIN = 40;
const DIASTOLIC_MAX = 150;

function validate(values: HealthData): HealthFieldErrors {
  const errors: HealthFieldErrors = {};

  const weight = Number(values.weight.replace(',', '.'));
  if (!values.weight.trim()) errors.weight = 'El peso es obligatorio.';
  else if (!Number.isFinite(weight) || weight < WEIGHT_MIN || weight > WEIGHT_MAX) {
    errors.weight = `Ingresa un peso entre ${WEIGHT_MIN} y ${WEIGHT_MAX} kg.`;
  }

  const height = Number(values.height.replace(',', '.'));
  if (!values.height.trim()) errors.height = 'La altura es obligatoria.';
  else if (!Number.isFinite(height) || height < HEIGHT_MIN || height > HEIGHT_MAX) {
    errors.height = `Ingresa una altura entre ${HEIGHT_MIN} y ${HEIGHT_MAX} m (${HEIGHT_MIN * 100}-${HEIGHT_MAX * 100} cm).`;
  }

  const systolic = Number(values.systolic);
  if (!values.systolic.trim()) errors.systolic = 'La presión sistólica es obligatoria.';
  else if (!Number.isFinite(systolic) || systolic < SYSTOLIC_MIN || systolic > SYSTOLIC_MAX) {
    errors.systolic = `Debe estar entre ${SYSTOLIC_MIN} y ${SYSTOLIC_MAX} mmHg.`;
  }

  const diastolic = Number(values.diastolic);
  if (!values.diastolic.trim()) errors.diastolic = 'La presión diastólica es obligatoria.';
  else if (!Number.isFinite(diastolic) || diastolic < DIASTOLIC_MIN || diastolic > DIASTOLIC_MAX) {
    errors.diastolic = `Debe estar entre ${DIASTOLIC_MIN} y ${DIASTOLIC_MAX} mmHg.`;
  } else if (Number.isFinite(systolic) && diastolic >= systolic) {
    errors.diastolic = 'La diastólica debe ser menor que la sistólica.';
  }

  if (values.hasHypertension === null) {
    errors.hasHypertension = 'Indica si tienes diagnóstico de hipertensión.';
  }

  if (values.activityLevel === null) {
    errors.activityLevel = 'Selecciona tu nivel de actividad laboral.';
  }

  return errors;
}

export function useHealthForm() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [hasHypertension, setHasHypertension] = useState<boolean | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [medications, setMedications] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [errors, setErrors] = useState<HealthFieldErrors>({});

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const getData = useCallback(
    (): HealthData => ({
      weight,
      height,
      systolic,
      diastolic,
      hasHypertension,
      activityLevel,
      medications,
      selectedAllergies,
      dietaryRestrictions,
    }),
    [weight, height, systolic, diastolic, hasHypertension, activityLevel, medications, selectedAllergies, dietaryRestrictions]
  );

  /** Corre la validación completa y actualiza `errors`. Devuelve true si el
   *  formulario está listo para enviarse (usar en el botón "Continuar" para
   *  bloquear el avance con el formulario incompleto). */
  const validateAll = useCallback(() => {
    const next = validate(getData());
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [getData]);

  const isValid = useMemo(() => Object.keys(validate(getData())).length === 0, [getData]);

  return {
    weight, setWeight,
    height, setHeight,
    systolic, setSystolic,
    diastolic, setDiastolic,
    hasHypertension, setHasHypertension,
    activityLevel, setActivityLevel,
    medications, setMedications,
    selectedAllergies, toggleAllergy,
    dietaryRestrictions, setDietaryRestrictions,
    errors,
    isValid,
    validateAll,
    getData,
  };
}
