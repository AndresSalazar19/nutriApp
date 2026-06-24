import { useState } from 'react';
import { HealthData } from '../types';

export function useHealthForm() {
  const [weight, setWeight] = useState('72.5');
  const [height, setHeight] = useState('1.68');
  const [systolic, setSystolic] = useState('130');
  const [diastolic, setDiastolic] = useState('85');
  const [hasHypertension, setHasHypertension] = useState(true);
  const [medications, setMedications] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(['Lácteos']);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy],
    );
  };

  const getData = (): HealthData => ({
    weight,
    height,
    systolic,
    diastolic,
    hasHypertension,
    medications,
    selectedAllergies,
    dietaryRestrictions,
  });

  return {
    weight,
    setWeight,
    height,
    setHeight,
    systolic,
    setSystolic,
    diastolic,
    setDiastolic,
    hasHypertension,
    setHasHypertension,
    medications,
    setMedications,
    selectedAllergies,
    toggleAllergy,
    dietaryRestrictions,
    setDietaryRestrictions,
    getData,
  };
}
