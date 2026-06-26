import React, { useState, useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
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

interface AppointmentsModalProps {
  visible: boolean;
  onClose: () => void;
}

type AppointmentType = 'control' | 'nutricion' | 'examen';

interface Appointment {
  id: string;
  title: string;
  doctor: string;
  year: number;
  month: number;
  day: number;
  time: string;
  type: AppointmentType;
  status: 'confirmada' | 'pendiente';
}

const TYPE_OPTIONS: { key: AppointmentType; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }[] = [
  { key: 'control', label: 'Control', icon: 'heart-pulse', color: COLORS.primary },
  { key: 'nutricion', label: 'Nutrición', icon: 'food-apple', color: COLORS.primaryMedium },
  { key: 'examen', label: 'Examen', icon: 'test-tube', color: COLORS.chartPurple },
];

const TYPE_MAP = Object.fromEntries(TYPE_OPTIONS.map(t => [t.key, t]));

const now = new Date();

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: '1', title: 'Control de presión arterial', doctor: 'Dr. María López', year: now.getFullYear(), month: now.getMonth(), day: 28, time: '09:00', type: 'control', status: 'confirmada' },
  { id: '2', title: 'Consulta nutricional', doctor: 'Lic. Carlos Méndez', year: now.getFullYear(), month: now.getMonth() + 1, day: 2, time: '14:30', type: 'nutricion', status: 'confirmada' },
  { id: '3', title: 'Exámenes de laboratorio', doctor: 'Laboratorio Central', year: now.getFullYear(), month: now.getMonth() + 1, day: 10, time: '07:30', type: 'examen', status: 'pendiente' },
];

function dateKey(y: number, m: number, d: number) {
  return `${y}-${m}-${d}`;
}

function formatMonthLabel(year: number, month: number): string {
  const d = new Date(year, month, 1);
  const label = d.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatDateShort(y: number, m: number, d: number): string {
  const dt = new Date(y, m, d);
  return dt.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function AppointmentsModal({ visible, onClose }: AppointmentsModalProps) {
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [showNewForm, setShowNewForm] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState<AppointmentType>('control');

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const appointmentDays = useMemo(() => {
    const set = new Set<string>();
    for (const a of appointments) {
      if (a.year === viewYear && a.month === viewMonth) {
        set.add(dateKey(a.year, a.month, a.day));
      }
    }
    return set;
  }, [appointments, viewYear, viewMonth]);

  const filteredAppointments = useMemo(() => {
    if (selectedDay != null) {
      return appointments.filter(a => a.year === viewYear && a.month === viewMonth && a.day === selectedDay);
    }
    return appointments
      .filter(a => {
        const aDate = new Date(a.year, a.month, a.day);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return aDate >= today;
      })
      .sort((a, b) => new Date(a.year, a.month, a.day).getTime() - new Date(b.year, b.month, b.day).getTime());
  }, [appointments, selectedDay, viewYear, viewMonth]);

  function goToPrevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else { setViewMonth(m => m - 1); }
    setSelectedDay(null);
  }

  function goToNextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else { setViewMonth(m => m + 1); }
    setSelectedDay(null);
  }

  function handleDayPress(day: number) {
    setSelectedDay(prev => prev === day ? null : day);
  }

  function resetForm() {
    setNewTitle('');
    setNewDoctor('');
    setNewTime('');
    setNewType('control');
    setShowNewForm(false);
  }

  function handleCreateAppointment() {
    if (!newTitle.trim()) {
      Alert.alert('Campo requerido', 'Ingresa un título para la cita.');
      return;
    }
    if (!newTime.trim()) {
      Alert.alert('Campo requerido', 'Ingresa la hora de la cita.');
      return;
    }

    const day = selectedDay ?? now.getDate();
    const apt: Appointment = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      doctor: newDoctor.trim() || 'Por asignar',
      year: selectedDay != null ? viewYear : now.getFullYear(),
      month: selectedDay != null ? viewMonth : now.getMonth(),
      day,
      time: newTime.trim(),
      type: newType,
      status: 'pendiente',
    };

    setAppointments(prev => [...prev, apt]);
    Alert.alert('Cita agendada', `${apt.title}\n${formatDateShort(apt.year, apt.month, apt.day)} a las ${apt.time}`);
    resetForm();
  }

  function handleClose() {
    resetForm();
    setSelectedDay(null);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <MaterialCommunityIcons name="calendar-month" size={24} color={COLORS.textOnPrimary} />
              <Text style={styles.headerTitle}>Mis Citas</Text>
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textOnPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* Month navigation */}
              <View style={styles.monthNav}>
                <TouchableOpacity onPress={goToPrevMonth} style={styles.monthArrow}>
                  <MaterialCommunityIcons name="chevron-left" size={26} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.monthLabel}>{formatMonthLabel(viewYear, viewMonth)}</Text>
                <TouchableOpacity onPress={goToNextMonth} style={styles.monthArrow}>
                  <MaterialCommunityIcons name="chevron-right" size={26} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Week day headers */}
              <View style={styles.weekRow}>
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                  <Text key={i} style={styles.weekDay}>{d}</Text>
                ))}
              </View>

              {/* Calendar grid */}
              <View style={styles.calendarGrid}>
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <View key={`e-${i}`} style={styles.dayCell} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = isCurrentMonth && day === now.getDate();
                  const isSelected = selectedDay === day;
                  const hasApt = appointmentDays.has(dateKey(viewYear, viewMonth, day));
                  return (
                    <TouchableOpacity key={day} style={styles.dayCell} onPress={() => handleDayPress(day)} activeOpacity={0.6}>
                      <View style={[
                        styles.dayCircle,
                        isToday && !isSelected && styles.dayToday,
                        isSelected && styles.daySelected,
                      ]}>
                        <Text style={[
                          styles.dayText,
                          (isToday && !isSelected) && styles.dayTextToday,
                          isSelected && styles.dayTextSelected,
                        ]}>
                          {day}
                        </Text>
                      </View>
                      {hasApt && <View style={[styles.appointmentDot, isSelected && styles.dotSelected]} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Selected day label */}
              {selectedDay != null && (
                <View style={styles.selectedLabel}>
                  <MaterialCommunityIcons name="calendar-check" size={16} color={COLORS.primary} />
                  <Text style={styles.selectedLabelText}>
                    {formatDateShort(viewYear, viewMonth, selectedDay)}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedDay(null)}>
                    <Text style={styles.clearSelection}>Ver todas</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Appointments list */}
              <Text style={styles.sectionLabel}>
                {selectedDay != null ? 'Citas del día' : 'Próximas citas'}
              </Text>

              {filteredAppointments.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="calendar-blank-outline" size={36} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>
                    {selectedDay != null ? 'No hay citas este día' : 'No hay citas próximas'}
                  </Text>
                </View>
              ) : (
                filteredAppointments.map(apt => {
                  const cfg = TYPE_MAP[apt.type];
                  return (
                    <View key={apt.id} style={styles.appointmentCard}>
                      <View style={[styles.aptIconWrap, { backgroundColor: cfg.color + '18' }]}>
                        <MaterialCommunityIcons name={cfg.icon} size={22} color={cfg.color} />
                      </View>
                      <View style={styles.aptBody}>
                        <Text style={styles.aptTitle}>{apt.title}</Text>
                        <Text style={styles.aptDoctor}>{apt.doctor}</Text>
                        <View style={styles.aptDateRow}>
                          <MaterialCommunityIcons name="calendar-outline" size={13} color={COLORS.textMuted} />
                          <Text style={styles.aptDate}>{formatDateShort(apt.year, apt.month, apt.day)}</Text>
                          <MaterialCommunityIcons name="clock-outline" size={13} color={COLORS.textMuted} />
                          <Text style={styles.aptDate}>{apt.time}</Text>
                        </View>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        apt.status === 'confirmada' ? styles.statusConfirmed : styles.statusPending,
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: apt.status === 'confirmada' ? COLORS.success : COLORS.warning },
                        ]}>
                          {apt.status === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}

              {/* New appointment form */}
              {showNewForm ? (
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>Nueva cita</Text>
                  {selectedDay != null && (
                    <Text style={styles.formDate}>
                      Fecha: {formatDateShort(viewYear, viewMonth, selectedDay)}
                    </Text>
                  )}

                  <Text style={styles.fieldLabel}>Título</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: Control de presión"
                      placeholderTextColor={COLORS.placeholder}
                      value={newTitle}
                      onChangeText={setNewTitle}
                    />
                  </View>

                  <Text style={styles.fieldLabel}>Doctor / Lugar</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: Dr. López"
                      placeholderTextColor={COLORS.placeholder}
                      value={newDoctor}
                      onChangeText={setNewDoctor}
                    />
                  </View>

                  <Text style={styles.fieldLabel}>Hora</Text>
                  <View style={styles.inputWrap}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 09:30"
                      placeholderTextColor={COLORS.placeholder}
                      value={newTime}
                      onChangeText={setNewTime}
                    />
                  </View>

                  <Text style={styles.fieldLabel}>Tipo de cita</Text>
                  <View style={styles.typeRow}>
                    {TYPE_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.key}
                        style={[styles.typeChip, newType === opt.key && { backgroundColor: opt.color + '20', borderColor: opt.color }]}
                        onPress={() => setNewType(opt.key)}
                      >
                        <MaterialCommunityIcons name={opt.icon} size={16} color={newType === opt.key ? opt.color : COLORS.textMuted} />
                        <Text style={[styles.typeChipText, newType === opt.key && { color: opt.color }]}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.formActions}>
                    <TouchableOpacity style={styles.formCancelBtn} onPress={resetForm}>
                      <Text style={styles.formCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.formSaveBtn} onPress={handleCreateAppointment}>
                      <MaterialCommunityIcons name="check" size={18} color={COLORS.textOnPrimary} />
                      <Text style={styles.formSaveText}>Agendar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowNewForm(true)}>
                  <MaterialCommunityIcons name="plus-circle-outline" size={20} color={COLORS.primaryMedium} />
                  <Text style={styles.addBtnText}>Agendar nueva cita</Text>
                </TouchableOpacity>
              )}

              <View style={{ height: 16 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Text style={styles.closeBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMedium,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Month nav
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Calendar
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: {
    backgroundColor: COLORS.primaryLight,
  },
  daySelected: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  dayTextToday: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dayTextSelected: {
    color: COLORS.textOnPrimary,
    fontWeight: '700',
  },
  appointmentDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primaryMedium,
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: COLORS.textOnPrimary,
  },

  // Selected label
  selectedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedLabelText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  clearSelection: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryMedium,
    textDecorationLine: 'underline',
  },

  // Appointments
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aptIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aptBody: {
    flex: 1,
  },
  aptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  aptDoctor: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  aptDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aptDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusConfirmed: {
    backgroundColor: COLORS.success + '15',
    borderColor: COLORS.success + '40',
  },
  statusPending: {
    backgroundColor: COLORS.warning + '15',
    borderColor: COLORS.warning + '40',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Add button
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primaryMedium,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryMedium,
  },

  // Form
  formCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  formDate: {
    fontSize: 12,
    color: COLORS.primaryMedium,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    gap: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  formCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  formCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  formSaveBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  formSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: COLORS.primaryMedium,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
});
