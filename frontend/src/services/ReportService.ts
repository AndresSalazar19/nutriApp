import { API_URL } from '../config/api';
import { tokenStorage } from '../utils/tokenStorage';
import { TimePoint } from '../components/mock/reportsMock';

export type RangeKey = '3m' | '6m' | '1y';
export type ReportType = 'progress' | 'clinical_history' | 'soap' | 'evolution' | 'meal_plan';

export interface HistoryEntry {
  id: string;
  entry_type: string;
  description: string;
  created_at: string;
}

export interface AppointmentSummary {
  id: string;
  scheduled_at: string;
  status: string;
  modality: string;
}

export interface PatientReportData {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  range_key: RangeKey;
  weight_lost: number | null;
  weight_lost_pct: number | null;
  weight_history: TimePoint[];
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  blood_pressure_note: string | null;
  systolic_history: TimePoint[];
  diastolic_history: TimePoint[];
  clinical_notes: string | null;
  history_entries: HistoryEntry[];
  appointments: AppointmentSummary[];
}

export interface GeneratedReport {
  id: string;
  file_url: string;
  file_name: string;
  range_key: RangeKey;
  report_type: ReportType;
  created_at: string;
}

function authHeaders() {
  const token = tokenStorage.get() ?? '';
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const msg = data?.status?.messages?.[0] ?? data?.detail ?? `Error ${response.status}`;
    throw new Error(msg);
  }

  return data;
}

export const ReportService = {
  async getPatientReport(patientId: string, range: RangeKey): Promise<PatientReportData> {
    const res = await fetch(`${API_URL}/patients/${patientId}/report?range=${range}`, {
      method: 'GET',
      headers: authHeaders(),
    });

    const body = await handleResponse<{ data: PatientReportData }>(res);
    return body.data;
  },

  async generateReportPdf(
    patientId: string,
    range: RangeKey,
    reportType: ReportType = 'progress',
  ): Promise<GeneratedReport> {
    const res = await fetch(
      `${API_URL}/patients/${patientId}/report/pdf?range=${range}&report_type=${reportType}`,
      {
        method: 'POST',
        headers: authHeaders(),
      },
    );

    const body = await handleResponse<{ data: GeneratedReport }>(res);
    return body.data;
  },
};
