import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { AuthService } from '@/features/auth/services/authService';
import { PatientNutritionistService, AssignedNutritionist } from '@/services/patientNutritionistService';
import {
  Appointment,
  AppointmentModality,
  AppointmentService,
} from '../services/appointmentService';

interface Props { visible: boolean; onClose: () => void }

const DURATION_MIN = 45;
const WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function localDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function calendarDate(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 12);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function nutritionistName(appointment: Appointment): string {
  const person = appointment.nutritionist?.person;
  return person ? `${person.first_name} ${person.last_name}`.trim() : appointment.nutritionist?.email ?? 'Nutricionista';
}

function canCancel(appointment: Appointment): boolean {
  return new Date(appointment.scheduled_at).getTime() - Date.now() >= 24 * 60 * 60 * 1000;
}

export function AppointmentsModal({ visible, onClose }: Props) {
  const today = new Date();
  const [patientId, setPatientId] = useState<string | null>(null);
  const [nutritionist, setNutritionist] = useState<AssignedNutritionist | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [modality, setModality] = useState<AppointmentModality>('virtual');
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadAppointments(id: string) {
    setAppointments(await AppointmentService.list(id));
  }

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError(null);
    AuthService.getUser()
      .then(async user => {
        if (!user?.id) throw new Error('Inicia sesión para consultar tus citas.');
        setPatientId(user.id);
        const [assigned] = await Promise.all([
          PatientNutritionistService.getAssigned(user.id),
          loadAppointments(user.id),
        ]);
        setNutritionist(assigned);
      })
      .catch(err => setError(err?.message ?? 'No se pudieron cargar las citas.'))
      .finally(() => setLoading(false));
  }, [visible]);

  const selectedDate = selectedDay == null ? null : calendarDate(viewYear, viewMonth, selectedDay);
  const selectedDateKey = selectedDate ? localDateKey(selectedDate) : null;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();
  const currentMonthKey = viewYear * 12 + viewMonth;
  const todayMonthKey = today.getFullYear() * 12 + today.getMonth();

  const appointmentDays = useMemo(() => new Set(
    appointments.filter(a => a.status !== 'cancelled').map(a => localDateKey(new Date(a.scheduled_at))),
  ), [appointments]);

  const visibleAppointments = useMemo(() => appointments
    .filter(a => a.status !== 'cancelled')
    .filter(a => selectedDateKey ? localDateKey(new Date(a.scheduled_at)) === selectedDateKey : new Date(a.scheduled_at) >= today)
    .sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at)),
  [appointments, selectedDateKey]);

  async function selectDay(day: number) {
    const date = calendarDate(viewYear, viewMonth, day);
    if (date < calendarDate(today.getFullYear(), today.getMonth(), today.getDate())) return;
    setSelectedDay(day);
    setSelectedSlot(null);
    setSlots([]);
    if (!nutritionist) return;
    setSlotsLoading(true);
    try {
      setSlots(await AppointmentService.getAvailableSlots(nutritionist.id, localDateKey(date)));
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo consultar la disponibilidad.');
    } finally {
      setSlotsLoading(false);
    }
  }

  async function createAppointment() {
    if (!patientId || !nutritionist || !selectedSlot || !description.trim()) {
      Alert.alert('Datos incompletos', 'Selecciona una fecha, un horario y escribe una descripción.');
      return;
    }
    setSaving(true);
    try {
      await AppointmentService.create({
        patient_id: patientId,
        nutritionist_id: nutritionist.id,
        scheduled_at: selectedSlot,
        modality,
        notes: description.trim(),
      });
      await loadAppointments(patientId);
      setDescription('');
      setSelectedSlot(null);
      setShowForm(false);
      Alert.alert('Cita agendada', 'Tu cita quedó agendada correctamente.');
    } catch (err: any) {
      Alert.alert('No se pudo agendar', err?.message ?? 'Intenta nuevamente.');
      if (selectedDateKey) await selectDay(selectedDay!);
    } finally {
      setSaving(false);
    }
  }

  function requestCancellation(appointment: Appointment) {
    if (!patientId) return;
    if (!canCancel(appointment)) {
      const message = 'Las citas solo pueden cancelarse con al menos 24 horas de anticipación.';
      if (Platform.OS === 'web') window.alert(message);
      else Alert.alert('Cancelación no disponible', message);
      return;
    }

    const cancel = async () => {
      try {
        await AppointmentService.cancel(appointment.id, patientId);
        await loadAppointments(patientId);
      } catch (err: any) {
        const message = err?.message ?? 'Intenta nuevamente.';
        if (Platform.OS === 'web') window.alert(`No se pudo cancelar: ${message}`);
        else Alert.alert('No se pudo cancelar', message);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Seguro que deseas cancelar esta cita?')) void cancel();
      return;
    }

    Alert.alert('Cancelar cita', '¿Seguro que deseas cancelar esta cita?', [
      { text: 'Volver', style: 'cancel' },
      { text: 'Cancelar cita', style: 'destructive', onPress: () => void cancel() },
    ]);
  }

  function changeMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
    setSelectedDay(null);
    setShowForm(false);
    setSlots([]);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}><View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="calendar-month" size={24} color={COLORS.textOnPrimary} />
          <Text style={styles.headerTitle}>Mis citas</Text>
          <TouchableOpacity onPress={onClose}><MaterialCommunityIcons name="close" size={24} color={COLORS.textOnPrimary} /></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          {loading ? <ActivityIndicator color={COLORS.primary} /> : error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.assigned}>{nutritionist ? `Nutricionista: ${nutritionist.name}` : 'No tienes un nutricionista asignado'}</Text>
          <View style={styles.monthNav}>
            <TouchableOpacity disabled={currentMonthKey <= todayMonthKey} onPress={() => changeMonth(-1)}><MaterialCommunityIcons name="chevron-left" size={28} color={currentMonthKey <= todayMonthKey ? COLORS.textMuted : COLORS.textPrimary} /></TouchableOpacity>
            <Text style={styles.monthTitle}>{calendarDate(viewYear, viewMonth, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)}><MaterialCommunityIcons name="chevron-right" size={28} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
          <View style={styles.weekRow}>{WEEKDAYS.map((d, i) => <Text key={i} style={styles.weekday}>{d}</Text>)}</View>
          <View style={styles.grid}>
            {Array.from({ length: firstDayOffset }).map((_, i) => <View key={`empty-${i}`} style={styles.dayCell} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = calendarDate(viewYear, viewMonth, day);
              const past = date < calendarDate(today.getFullYear(), today.getMonth(), today.getDate());
              const selected = day === selectedDay;
              return <TouchableOpacity key={day} disabled={past} style={styles.dayCell} onPress={() => selectDay(day)}>
                <View style={[styles.dayCircle, selected && styles.selectedDay]}><Text style={[styles.dayText, past && styles.pastDay, selected && styles.selectedDayText]}>{day}</Text></View>
                {appointmentDays.has(localDateKey(date)) && <View style={styles.dot} />}
              </TouchableOpacity>;
            })}
          </View>

          <Text style={styles.sectionTitle}>{selectedDate ? `Citas del ${formatDate(selectedDate)}` : 'Próximas citas'}</Text>
          {visibleAppointments.length === 0 ? <Text style={styles.empty}>No hay citas para mostrar.</Text> : visibleAppointments.map(appointment => (
            <View key={appointment.id} style={styles.card}>
              <MaterialCommunityIcons name={appointment.modality === 'virtual' ? 'video-outline' : 'map-marker-outline'} size={25} color={COLORS.primary} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{appointment.notes || 'Consulta nutricional'}</Text>
                <Text style={styles.cardMeta}>{nutritionistName(appointment)}</Text>
                <Text style={styles.cardMeta}>{formatDate(new Date(appointment.scheduled_at))} · {formatTime(appointment.scheduled_at)} · {appointment.duration_min} min</Text>
                <Text style={styles.cardMeta}>{appointment.modality === 'virtual' ? 'Virtual' : 'Presencial'} · {appointment.status === 'scheduled' ? 'Agendada' : appointment.status}</Text>
              </View>
              {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && <TouchableOpacity onPress={() => requestCancellation(appointment)}><MaterialCommunityIcons name="calendar-remove" size={23} color={canCancel(appointment) ? COLORS.danger : COLORS.textMuted} /></TouchableOpacity>}
            </View>
          ))}

          {showForm ? <View style={styles.form}>
            <Text style={styles.sectionTitle}>Nueva cita · {DURATION_MIN} minutos</Text>
            {!selectedDate && <Text style={styles.help}>Selecciona primero una fecha futura.</Text>}
            <Text style={styles.label}>Horario disponible</Text>
            {slotsLoading ? <ActivityIndicator color={COLORS.primary} /> : selectedDate && slots.length === 0 ? <Text style={styles.help}>No hay horarios disponibles para este día.</Text> : <View style={styles.chips}>{slots.map(slot => <TouchableOpacity key={slot} style={[styles.chip, selectedSlot === slot && styles.chipSelected]} onPress={() => setSelectedSlot(slot)}><Text style={[styles.chipText, selectedSlot === slot && styles.chipTextSelected]}>{formatTime(slot)}</Text></TouchableOpacity>)}</View>}
            <Text style={styles.label}>Modalidad</Text>
            <View style={styles.chips}>{(['virtual', 'in_person'] as AppointmentModality[]).map(value => <TouchableOpacity key={value} style={[styles.chip, modality === value && styles.chipSelected]} onPress={() => setModality(value)}><Text style={[styles.chipText, modality === value && styles.chipTextSelected]}>{value === 'virtual' ? 'Virtual' : 'Presencial'}</Text></TouchableOpacity>)}</View>
            <Text style={styles.label}>Descripción</Text>
            <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Ej: Control de presión arterial" placeholderTextColor={COLORS.placeholder} multiline />
            <View style={styles.actions}><TouchableOpacity style={styles.secondary} onPress={() => setShowForm(false)}><Text style={styles.secondaryText}>Volver</Text></TouchableOpacity><TouchableOpacity disabled={saving} style={styles.primary} onPress={createAppointment}>{saving ? <ActivityIndicator color={COLORS.textOnPrimary} /> : <Text style={styles.primaryText}>Agendar</Text>}</TouchableOpacity></View>
          </View> : <TouchableOpacity disabled={!nutritionist} style={[styles.add, !nutritionist && styles.disabled]} onPress={() => setShowForm(true)}><MaterialCommunityIcons name="plus-circle-outline" size={20} color={COLORS.primary} /><Text style={styles.addText}>Agendar nueva cita</Text></TouchableOpacity>}
        </ScrollView>
      </View></View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.backdrop },
  container: { maxHeight: '94%', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: COLORS.surface, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 18, backgroundColor: COLORS.primaryMedium },
  headerTitle: { flex: 1, color: COLORS.textOnPrimary, fontSize: 18, fontWeight: '700' },
  body: { padding: 20, paddingBottom: 38 },
  assigned: { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 12 },
  error: { color: COLORS.danger, marginBottom: 10 },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  monthTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', textTransform: 'capitalize' },
  weekRow: { flexDirection: 'row' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', color: COLORS.textMuted, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  dayCell: { width: `${100 / 7}%`, height: 46, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  selectedDay: { backgroundColor: COLORS.primary },
  dayText: { color: COLORS.textPrimary },
  pastDay: { color: COLORS.textMuted },
  selectedDayText: { color: COLORS.textOnPrimary, fontWeight: '700' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primaryMedium, marginTop: -3 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  empty: { color: COLORS.textMuted, textAlign: 'center', paddingVertical: 16 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 13, marginBottom: 10 },
  cardBody: { flex: 1 },
  cardTitle: { color: COLORS.textPrimary, fontWeight: '700', marginBottom: 3 },
  cardMeta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  add: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.primary, borderRadius: 14, padding: 14, marginTop: 8 },
  addText: { color: COLORS.primary, fontWeight: '700' },
  disabled: { opacity: 0.45 },
  form: { backgroundColor: COLORS.background, borderRadius: 14, padding: 15, marginTop: 12 },
  help: { color: COLORS.textMuted, fontSize: 12, marginBottom: 8 },
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8 },
  chipSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontWeight: '600' },
  chipTextSelected: { color: COLORS.textOnPrimary },
  input: { minHeight: 72, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 11, color: COLORS.textPrimary, backgroundColor: COLORS.surface },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  secondary: { flex: 1, alignItems: 'center', padding: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 22 },
  secondaryText: { color: COLORS.textSecondary, fontWeight: '600' },
  primary: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 22, backgroundColor: COLORS.primary },
  primaryText: { color: COLORS.textOnPrimary, fontWeight: '700' },
});
