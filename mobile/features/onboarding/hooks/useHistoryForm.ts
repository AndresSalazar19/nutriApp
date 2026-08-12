import { useCallback, useMemo, useState } from 'react';
import { DigestiveIssues, FamilyHistoryData, PathologicalHistoryData } from '../types';

export type HistoryField =
  | 'hospitalized'
  | 'hasFoodAllergies'
  | 'hasFoodIntolerances'
  | 'hasDigestiveIssues'
  | 'takesMedications'
  | 'takesSupplements'
  | 'hasSurgeries';

export type HistoryFieldErrors = Partial<Record<HistoryField, string>>;

const REQUIRED_MESSAGE = 'Responde Sí o No para continuar.';

const EMPTY_DIGESTIVE: DigestiveIssues = {
  constipation: false,
  diarrhea: false,
  reflux: false,
  bloating: false,
  nausea: false,
};

const EMPTY_FAMILY_HISTORY: FamilyHistoryData = {
  diabetes: false,
  hypertension: false,
  obesity: false,
  cardiovascularDisease: false,
  cancer: false,
  kidneyDisease: false,
  eatingDisorders: false,
};

function validate(values: PathologicalHistoryData): HistoryFieldErrors {
  const errors: HistoryFieldErrors = {};
  const REQUIRED: HistoryField[] = [
    'hospitalized',
    'hasFoodAllergies',
    'hasFoodIntolerances',
    'hasDigestiveIssues',
    'takesMedications',
    'takesSupplements',
    'hasSurgeries',
  ];
  REQUIRED.forEach((field) => {
    if (values[field] === null) errors[field] = REQUIRED_MESSAGE;
  });
  return errors;
}

export function useHistoryForm() {
  const [conditions, setConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState('');
  const [hospitalized, setHospitalized] = useState<boolean | null>(null);
  const [hospitalizedDetail, setHospitalizedDetail] = useState('');
  const [hasFoodAllergies, setHasFoodAllergies] = useState<boolean | null>(null);
  const [foodAllergies, setFoodAllergies] = useState('');
  const [hasFoodIntolerances, setHasFoodIntolerances] = useState<boolean | null>(null);
  const [foodIntolerances, setFoodIntolerances] = useState('');
  const [hasDigestiveIssues, setHasDigestiveIssues] = useState<boolean | null>(null);
  const [digestiveIssues, setDigestiveIssues] = useState<DigestiveIssues>(EMPTY_DIGESTIVE);
  const [takesMedications, setTakesMedications] = useState<boolean | null>(null);
  const [currentMedications, setCurrentMedications] = useState('');
  const [takesSupplements, setTakesSupplements] = useState<boolean | null>(null);
  const [supplements, setSupplements] = useState('');
  const [hasSurgeries, setHasSurgeries] = useState<boolean | null>(null);
  const [surgeriesDetail, setSurgeriesDetail] = useState('');
  const [familyHistory, setFamilyHistory] = useState<FamilyHistoryData>(EMPTY_FAMILY_HISTORY);
  const [errors, setErrors] = useState<HistoryFieldErrors>({});

  const toggleCondition = (condition: string) => {
    setConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const toggleDigestiveIssue = (key: keyof DigestiveIssues) => {
    setDigestiveIssues((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFamilyHistory = (key: keyof FamilyHistoryData) => {
    setFamilyHistory((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getData = useCallback(
    (): PathologicalHistoryData => ({
      conditions,
      otherCondition,
      hospitalized,
      hospitalizedDetail,
      hasFoodAllergies,
      foodAllergies: foodAllergies.split(',').map((s) => s.trim()).filter(Boolean),
      hasFoodIntolerances,
      foodIntolerances: foodIntolerances.split(',').map((s) => s.trim()).filter(Boolean),
      hasDigestiveIssues,
      digestiveIssues,
      takesMedications,
      currentMedications: currentMedications.split(',').map((s) => s.trim()).filter(Boolean),
      takesSupplements,
      supplements: supplements.split(',').map((s) => s.trim()).filter(Boolean),
      hasSurgeries,
      surgeriesDetail,
      familyHistory,
    }),
    [
      conditions, otherCondition, hospitalized, hospitalizedDetail,
      hasFoodAllergies, foodAllergies, hasFoodIntolerances, foodIntolerances,
      hasDigestiveIssues, digestiveIssues, takesMedications, currentMedications,
      takesSupplements, supplements, hasSurgeries, surgeriesDetail, familyHistory,
    ]
  );

  const validateAll = useCallback(() => {
    const next = validate(getData());
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [getData]);

  const isValid = useMemo(() => Object.keys(validate(getData())).length === 0, [getData]);

  return {
    conditions, toggleCondition,
    otherCondition, setOtherCondition,
    hospitalized, setHospitalized,
    hospitalizedDetail, setHospitalizedDetail,
    hasFoodAllergies, setHasFoodAllergies,
    foodAllergies, setFoodAllergies,
    hasFoodIntolerances, setHasFoodIntolerances,
    foodIntolerances, setFoodIntolerances,
    hasDigestiveIssues, setHasDigestiveIssues,
    digestiveIssues, toggleDigestiveIssue,
    takesMedications, setTakesMedications,
    currentMedications, setCurrentMedications,
    takesSupplements, setTakesSupplements,
    supplements, setSupplements,
    hasSurgeries, setHasSurgeries,
    surgeriesDetail, setSurgeriesDetail,
    familyHistory, toggleFamilyHistory,
    errors,
    isValid,
    validateAll,
    getData,
  };
}
