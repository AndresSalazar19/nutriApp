import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar } from '../../components/layout/AdminTopBar';
import { PatientService } from '../../services/PatientNutritionist/patientNutritionistService';
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

const ReportsPage: React.FC = () => {
  const [activeNav, setActiveNav] = useState('Reportes');
  const [patients, setPatients] = useState<ReportPatientOption[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);

  // Admin sees every patient in the system, not just ones assigned to a
  // particular nutritionist — this is the one thing that differs from the
  // nutritionist-side Reports page, which is why they share PatientReportsPanel.
  useEffect(() => {
    let isMounted = true;

    async function loadPatients() {
      setPatientsLoading(true);
      try {
        const list = await PatientService.getAll();
        const mapped: ReportPatientOption[] = list.map((p, i) => {
          const firstName = p.first_name?.trim() ?? '';
          const lastName = p.last_name?.trim() ?? '';
          const fullName = `${firstName} ${lastName}`.trim();
          return {
            id: p.user_id,
            name: fullName || p.email,
            initials:
              `${firstName.charAt(0) ?? ''}${lastName.charAt(0) ?? ''}`.toUpperCase() || 'P',
            color: AVATAR_COLORS[i % AVATAR_COLORS.length],
          };
        });

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
  }, []);

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <AdminTopBar title="Reportes" subtitle="Genera y exporta reportes de cualquier paciente" />
      <PatientReportsPanel
        patients={patients}
        patientsLoading={patientsLoading}
        headerTitle="Seleccionar paciente"
        headerSubtitle="Elige un paciente, un rango de fechas y el tipo de reporte"
        emptyStateTitle="No hay pacientes registrados"
        emptyStateDescription="Cuando se registren pacientes en la plataforma, podrás ver aquí sus reportes."
        accent="admin"
      />
    </AdminLayout>
  );
};

export default ReportsPage;
