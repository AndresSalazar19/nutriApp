import React, { useEffect, useState } from 'react';
import { NutritionistLayout } from '../../components/layout/NutritionistLayout';
import { useAuth } from '../../hooks/useAuth';
import { PatientNutritionistService } from '../../services/PatientNutritionist/patientNutritionistService';
import {
  PatientReportsPanel,
  ReportPatientOption,
} from '../../components/reports/PatientReportsPanel';

const AVATAR_COLORS = [
  'bg-green-500',
  'bg-blue-500',
  'bg-orange-400',
  'bg-purple-500',
  'bg-teal-500',
];

export default function ReportsPage() {
  const { user } = useAuth();

  const [patients, setPatients] = useState<ReportPatientOption[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);

  // Load the nutritionist's own assigned patients for the selector
  useEffect(() => {
    let isMounted = true;

    async function loadPatients() {
      if (!user?.userId) {
        setPatients([]);
        setPatientsLoading(false);
        return;
      }

      setPatientsLoading(true);
      try {
        const list = await PatientNutritionistService.listPatientsByNutritionist(user.userId);
        const mapped: ReportPatientOption[] = list.map((p, i) => ({
          id: p.id,
          name: p.fullName,
          initials: `${p.first_name.charAt(0)}${p.last_name.charAt(0)}`.toUpperCase(),
          color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        }));

        if (isMounted) setPatients(mapped);
      } catch (error) {
        console.error('Error cargando pacientes:', error);
        if (isMounted) setPatients([]);
      } finally {
        if (isMounted) setPatientsLoading(false);
      }
    }

    loadPatients();
    return () => {
      isMounted = false;
    };
  }, [user?.userId]);

  return (
    <NutritionistLayout>
      <PatientReportsPanel
        patients={patients}
        patientsLoading={patientsLoading}
        emptyStateTitle="No tienes pacientes asignados"
        emptyStateDescription="Cuando tengas pacientes asignados, podrás ver aquí sus reportes de progreso."
      />
    </NutritionistLayout>
  );
}
