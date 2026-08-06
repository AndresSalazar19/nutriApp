import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';

export type DailyMetricMode = 'weight' | 'hydration' | 'consumed' | 'burned';

const CONFIG = {
  weight: { title: 'Registrar peso', unit: 'kg', icon: 'scale-bathroom' as const },
  hydration: { title: 'Registrar hidratacion', unit: 'ml', icon: 'water' as const },
  consumed: { title: 'Calorias de la comida', unit: 'kcal', icon: 'food-apple' as const },
  burned: { title: 'Calorias quemadas', unit: 'kcal', icon: 'run' as const },
};

interface Props {
  visible: boolean;
  mode: DailyMetricMode;
  onClose: () => void;
  onSave: (value: number) => Promise<void>;
}

export function DailyMetricModal({ visible, mode, onClose, onSave }: Props) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const config = CONFIG[mode];

  useEffect(() => setValue(''), [mode, visible]);

  async function save() {
    const parsed = Number(value.replace(',', '.'));
    const valid = mode === 'weight'
      ? parsed >= 20 && parsed <= 500
      : mode === 'hydration'
        ? parsed >= 50 && parsed <= 3000
        : Number.isInteger(parsed) && parsed >= 1 && parsed <= 10000;
    if (!valid) {
      Alert.alert('Valor invalido', `Ingresa una cantidad valida en ${config.unit}.`);
      return;
    }
    setSaving(true);
    try {
      await onSave(parsed);
      onClose();
      Alert.alert('Registro guardado', `${parsed} ${config.unit} agregados hoy.`);
    } catch (error) {
      Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <MaterialCommunityIcons name={config.icon} size={24} color={COLORS.textOnPrimary} />
            <Text style={styles.title}>{config.title}</Text>
            <TouchableOpacity onPress={onClose} disabled={saving}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.textOnPrimary} />
            </TouchableOpacity>
          </View>

          {mode === 'hydration' && (
            <View style={styles.presets}>
              {[
                ['Pequeno', 250],
                ['Mediano', 350],
                ['Grande', 500],
              ].map(([label, amount]) => (
                <TouchableOpacity
                  key={String(amount)}
                  style={styles.preset}
                  onPress={() => setValue(String(amount))}
                >
                  <Text style={styles.presetLabel}>{label}</Text>
                  <Text style={styles.presetValue}>{amount} ml</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>{mode === 'hydration' ? 'Volumen personalizado' : 'Cantidad'}</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={value}
              onChangeText={setValue}
              keyboardType={mode === 'weight' ? 'decimal-pad' : 'number-pad'}
              placeholder="0"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
            />
            <Text style={styles.unit}>{config.unit}</Text>
          </View>

          <TouchableOpacity style={styles.save} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Guardar</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.backdrop },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 18, backgroundColor: COLORS.primary, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  title: { flex: 1, color: COLORS.textOnPrimary, fontSize: 17, fontWeight: '700' },
  presets: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingTop: 18 },
  preset: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, alignItems: 'center' },
  presetLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  presetValue: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  label: { marginHorizontal: 18, marginTop: 18, marginBottom: 6, fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  inputWrap: { marginHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 13, fontSize: 18, color: COLORS.textPrimary },
  unit: { color: COLORS.textMuted, fontWeight: '600' },
  save: { marginHorizontal: 18, marginTop: 20, borderRadius: 50, backgroundColor: COLORS.primary, alignItems: 'center', paddingVertical: 14 },
  saveText: { color: COLORS.textOnPrimary, fontSize: 15, fontWeight: '700' },
});
