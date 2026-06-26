import { AvailabilityRule } from '../../services/NutritionistService';

export function weekdayName(n: number) {
  return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][n] ?? String(n);
}

export function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function ruleLabel(rule: AvailabilityRule) {
  if (rule.rule_type === 'recurring' && rule.day_of_week != null) {
    return weekdayName(rule.day_of_week);
  }
  return rule.specific_date ?? '—';
}

export function ruleTypeLabel(ruleType: string) {
  return ruleType === 'exception' ? 'Excepción' : 'Recurrente';
}

export function formatExceptionDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString('es-EC', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
