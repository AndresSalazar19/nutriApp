import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useRegister } from '@/features/auth/hooks/useAuth';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { Picker } from '@react-native-picker/picker';
import { PasswordField } from '@/components/ui/PasswordField';
import { Checkbox } from '@/components/ui/Checkbox';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function parseDateToISO(input: string): string | null {
  const parts = input.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy || yyyy.length !== 4) return null;
  const d = new Date(`${yyyy}-${mm}-${dd}`);
  if (isNaN(d.getTime())) return null;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

interface DatePickerModalProps {
  visible: boolean;
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
  onConfirm: (val: string) => void;
}

function DatePickerModal({ visible, value, onChange, onClose, onConfirm }: DatePickerModalProps) {
  const [draft, setDraft] = useState(value);

  React.useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={dpStyles.backdrop} onPress={onClose} />
      <View style={dpStyles.sheet}>
        <View style={dpStyles.handle} />
        <Text style={dpStyles.title}>Fecha de Nacimiento</Text>
        <DatePickerField value={draft} onChange={setDraft} />
        <View style={dpStyles.actions}>
          <TouchableOpacity style={dpStyles.btnCancel} onPress={onClose}>
            <Text style={dpStyles.btnCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={dpStyles.btnSave} onPress={() => { onConfirm(draft); onClose(); }}>
            <Text style={dpStyles.btnSaveText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const dpStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: COLORS.backdrop },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 48 : 36,
    shadowColor: COLORS.black, shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  btnCancelText: { fontSize: 15, fontWeight: '600', color: COLORS.textMuted },
  btnSave: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.primary, alignItems: 'center',
  },
  btnSaveText: { fontSize: 15, fontWeight: '700', color: COLORS.textOnPrimary },
});

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading, error } = useRegister();

  const [form, setForm] = useState({
    fullName: '',
    identification: '',
    email: '',
    phone: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
    gender: '',
  });
  const [acceptTerms, setAcceptTerms]       = useState(false);
  const [acceptPrivacy, setAcceptPrivacy]   = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    const { fullName, email, phone, birthDate, password, confirmPassword, gender, identification } = form;

    if (!fullName.trim() || !email.trim() || !phone.trim() || !birthDate.trim() ||
        !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Contraseñas', 'Las contraseñas no coinciden.');
      return;
    }
    if (!acceptTerms || !acceptPrivacy) {
      Alert.alert('Términos', 'Debes aceptar los términos y la política de privacidad.');
      return;
    }

    const nameParts  = fullName.trim().split(' ');
    const first_name = nameParts[0] ?? '';
    const last_name  = nameParts.slice(1).join(' ') || first_name;

    const date_of_birth = parseDateToISO(birthDate);
    if (!date_of_birth) {
      Alert.alert('Fecha inválida', 'Selecciona tu fecha de nacimiento.');
      return;
    }

    if (gender.trim() === '') {
      Alert.alert('Género', 'Selecciona tu género.');
      return;
    }

    if (identification.trim().length !== 10 ) {
      Alert.alert('Cédula inválida', 'La cédula debe tener exactamente 10 caracteres.');
      return;
    }

    const user = await register({
      first_name,
      last_name,
      email: email.trim(),
      phone: phone.trim(),
      date_of_birth,
      password,
      gender,
      cedula: identification.trim(),
    });

    if (user) router.replace('/(onboarding)/health');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

          <View style={styles.topPanel}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={18} color={COLORS.textOnPrimary} />
            </TouchableOpacity>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="leaf" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Completa tus datos para comenzar</Text>
          </View>

          <View style={styles.bottomPanel}>

            {error ? (
              <View style={styles.errorBox}>
                <View style={styles.errorRow}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={18} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </View>
            ) : null}

            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan Pérez García"
              placeholderTextColor={COLORS.placeholder}
              value={form.fullName}
              onChangeText={(v) => updateField('fullName', v)}
              editable={!loading}
            />

            <Text style={styles.label}>Cédula</Text>
            <TextInput
              style={styles.input}
              placeholder="0934567890"
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.placeholder}
              value={form.identification}
              onChangeText={(v) => updateField('identification', v)}
              editable={!loading}
            />

            <Text style={styles.label}>Género</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.gender}
                onValueChange={(value) => updateField('gender', value)}
                enabled={!loading}
                style={styles.picker}
                dropdownIconColor={COLORS.textPrimary}
              >
                <Picker.Item label="Seleccione un género" value="" color={COLORS.placeholder} style={styles.pickerItem} />
                <Picker.Item label="Femenino" value="femenino" color={COLORS.textPrimary} style={styles.pickerItem} />
                <Picker.Item label="Masculino" value="masculino" color={COLORS.textPrimary} style={styles.pickerItem} />
              </Picker>
            </View>

            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="juan@ejemplo.com"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => updateField('email', v)}
              editable={!loading}
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="0999 999 999"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(v) => updateField('phone', v)}
              editable={!loading}
            />

            <Text style={styles.label}>Fecha de Nacimiento</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="calendar-month-outline" size={20} color={form.birthDate ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.dateText, !form.birthDate && styles.datePlaceholder]}>
                {form.birthDate || 'Seleccionar fecha DD/MM/AAAA'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.label}>Contraseña</Text>
            <PasswordField
              value={form.password}
              onChangeText={(v) => updateField('password', v)}
              placeholder="••••••••"
            />

            <Text style={styles.label}>Confirmar Contraseña</Text>
            <PasswordField
              value={form.confirmPassword}
              onChangeText={(v) => updateField('confirmPassword', v)}
              placeholder="••••••••"
            />

            <Checkbox
              checked={acceptTerms}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              <Text style={styles.checkLabel}>
                Acepto los{' '}
                <Text style={styles.checkLink}>
                  Términos y Condiciones
                </Text>
              </Text>
            </Checkbox>

            <Checkbox
              checked={acceptPrivacy}
              onPress={() => setAcceptPrivacy(!acceptPrivacy)}
            >
              <Text style={styles.checkLabel}>
                Acepto la{' '}
                <Text style={styles.checkLink}>
                  Política de Privacidad
                </Text>
              </Text>
            </Checkbox>

            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={COLORS.textOnPrimary} />
                : <Text style={styles.btnPrimaryText}>Crear Cuenta</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia Sesión</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerModal
        visible={showDatePicker}
        value={form.birthDate}
        onChange={(val) => updateField('birthDate', val)}
        onConfirm={(val) => updateField('birthDate', val)}
        onClose={() => setShowDatePicker(false)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.primary },
  topPanel: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingTop: 20, paddingBottom: 36, paddingHorizontal: 24,
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.overlay,
    borderRadius: 20, width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  backArrow:   { color: COLORS.textOnPrimary, fontSize: 18, fontWeight: 'bold' },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  logoEmoji:   { fontSize: 32 },
  title:       { fontSize: 26, fontWeight: 'bold', color: COLORS.textOnPrimary, marginBottom: 4 },
  subtitle:    { fontSize: 13, color: COLORS.overlayMedium },
  bottomPanel: {
    flex: 1, backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32,
  },
  errorBox:    { backgroundColor: COLORS.errorLight, borderWidth: 1, borderColor: COLORS.errorBorder, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorText:   { color: COLORS.error, fontSize: 13, flex: 1 },
  label:       { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.inputBg, marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    paddingHorizontal: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.inputBg,
  },
  pickerItem: {
    fontSize: 14,
    backgroundColor: COLORS.surface,
  },
  dateButton: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, height: 50,
    backgroundColor: COLORS.inputBg, marginBottom: 16,
  },
  dateText:        { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  datePlaceholder: { color: COLORS.textSecondary },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, marginBottom: 16, backgroundColor: COLORS.inputBg,
  },
  inputFlex:   { flex: 1, paddingVertical: 13, fontSize: 14, color: COLORS.textPrimary },
  inputIcon:   { fontSize: 16, marginLeft: 8 },
  checkRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 2, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: COLORS.primary },
  checkmark:      { color: COLORS.textOnPrimary, fontSize: 12, fontWeight: 'bold' },
  checkLabel:     { fontSize: 13, color: COLORS.textSecondary, flexShrink: 1 },
  checkLink:      { color: COLORS.primary, fontWeight: '600' },
  btnPrimary: {
    backgroundColor: COLORS.primary, paddingVertical: 16,
    borderRadius: 50, alignItems: 'center', marginBottom: 20,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled:     { opacity: 0.7 },
  btnPrimaryText:  { color: COLORS.textOnPrimary, fontSize: 16, fontWeight: 'bold' },
  loginText:       { textAlign: 'center', fontSize: 13, color: COLORS.textMuted },
  loginLink:       { color: COLORS.primary, fontWeight: 'bold' },
});
