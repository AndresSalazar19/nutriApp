import React, { useState } from 'react';
import {
  ActivityIndicator,
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

interface BloodPressureModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (payload: {
    systolic: number;
    diastolic: number;
    pulse?: number | null;
    notes?: string;
  }) => Promise<void>;
}

export function BloodPressureModal({ visible, onClose, onSave }: BloodPressureModalProps) {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

  function getCategory(): { label: string; color: string } | null {
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);
    if (isNaN(sys) || isNaN(dia)) return null;
    if (sys < 120 && dia < 80) return { label: 'Normal', color: COLORS.success };
    if (sys < 130 && dia < 80) return { label: 'Elevada', color: COLORS.warning };
    if (sys < 140 || dia < 90) return { label: 'Hipertensión Etapa 1', color: COLORS.chartOrange };
    return { label: 'Hipertensión Etapa 2', color: COLORS.danger };
  }

  async function handleSave() {
    if (!systolic.trim() || !diastolic.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa al menos la presión sistólica y diastólica.');
      return;
    }
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);
    if (isNaN(sys) || isNaN(dia) || sys < 50 || sys > 300 || dia < 30 || dia > 200) {
      Alert.alert('Valores inválidos', 'Verifica que los valores de presión sean correctos.');
      return;
    }

    const pulseValue = pulse.trim() ? parseInt(pulse, 10) : null;
    if (pulse.trim() && (isNaN(pulseValue ?? NaN) || (pulseValue ?? 0) < 30 || (pulseValue ?? 0) > 220)) {
      Alert.alert('Valor inválido', 'Verifica que el pulso sea correcto.');
      return;
    }

    setSaving(true);
    try {
      await onSave?.({
        systolic: sys,
        diastolic: dia,
        pulse: pulseValue,
        notes: notes.trim() || undefined,
      });

      const message = `Presión: ${sys}/${dia} mmHg${pulse ? `\nPulso: ${pulse} bpm` : ''}\nFecha: ${dateStr}`;
      resetAndClose();
      setTimeout(() => {
        Alert.alert('Registro guardado', message);
      }, 0);
    } catch (error: any) {
      Alert.alert('No se pudo guardar', error?.message ?? 'Inténtalo nuevamente.');
    } finally {
      setSaving(false);
    }
  }

  function resetAndClose() {
    setSystolic('');
    setDiastolic('');
    setPulse('');
    setNotes('');
    setSaving(false);
    onClose();
  }

  const category = getCategory();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="heart-pulse" size={24} color={COLORS.textOnPrimary} />
              <Text style={styles.headerTitle}>Registrar Presión Arterial</Text>
              <TouchableOpacity onPress={resetAndClose} disabled={saving} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textOnPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              <View style={styles.dateRow}>
                <MaterialCommunityIcons name="calendar-today" size={16} color={COLORS.textMuted} />
                <Text style={styles.dateText}>{dateStr} — {timeStr}</Text>
              </View>

              <Text style={styles.sectionLabel}>Presión Arterial</Text>
              <View style={styles.bpRow}>
                <View style={styles.bpField}>
                  <Text style={styles.fieldLabel}>Sistólica</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      placeholder="120"
                      placeholderTextColor={COLORS.placeholder}
                      keyboardType="number-pad"
                      maxLength={3}
                      value={systolic}
                      onChangeText={setSystolic}
                    />
                    <Text style={styles.unitText}>mmHg</Text>
                  </View>
                </View>

                <View style={styles.bpSeparator}>
                  <Text style={styles.bpSlash}>/</Text>
                </View>

                <View style={styles.bpField}>
                  <Text style={styles.fieldLabel}>Diastólica</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      placeholder="80"
                      placeholderTextColor={COLORS.placeholder}
                      keyboardType="number-pad"
                      maxLength={3}
                      value={diastolic}
                      onChangeText={setDiastolic}
                    />
                    <Text style={styles.unitText}>mmHg</Text>
                  </View>
                </View>
              </View>

              {category && (
                <View style={[styles.categoryBadge, { backgroundColor: category.color + '18', borderColor: category.color + '40' }]}>
                  <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                  <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
                </View>
              )}

              <Text style={styles.sectionLabel}>Pulso (opcional)</Text>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="heart-outline" size={18} color={COLORS.textMuted} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="72"
                  placeholderTextColor={COLORS.placeholder}
                  keyboardType="number-pad"
                  maxLength={3}
                  value={pulse}
                  onChangeText={setPulse}
                />
                <Text style={styles.unitText}>bpm</Text>
              </View>

              <Text style={styles.sectionLabel}>Notas (opcional)</Text>
              <View style={styles.notesWrap}>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Ej: Después del desayuno, me sentía relajado..."
                  placeholderTextColor={COLORS.placeholder}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              <View style={styles.infoCard}>
                <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.primaryMedium} />
                <Text style={styles.infoText}>
                  Mide tu presión en reposo, sentado y con el brazo apoyado a la altura del corazón para obtener lecturas más precisas.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetAndClose} disabled={saving}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={COLORS.textOnPrimary} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check" size={18} color={COLORS.textOnPrimary} />
                    <Text style={styles.saveBtnText}>Guardar</Text>
                  </>
                )}
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
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
    paddingBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 4,
  },
  bpRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  bpField: {
    flex: 1,
  },
  bpSeparator: {
    paddingBottom: 12,
  },
  bpSlash: {
    fontSize: 24,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
  fieldLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.inputBg,
    gap: 6,
    marginBottom: 12,
  },
  input: {
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    minWidth: 40,
  },
  unitText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 16,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesWrap: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  notesInput: {
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 12,
    minHeight: 72,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnDisabled: {
    opacity: 0.65,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
});
