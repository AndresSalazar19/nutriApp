// ─── Types ────────────────────────────────────────────────────────────────────
// Nota: este archivo ya no contiene datos mock — solo los tipos que consumen
// ReportService, LineChart y MacroBarChart. Se conserva el nombre de archivo
// para no romper los imports existentes.

export interface TimePoint {
  date: string;
  value: number;
}

export interface MacroData {
  name: string;
  consumed: number;
  goal: number;
  color: string;
  goalColor: string;
}
