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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "DD/MM/AAAA" → "YYYY-MM-DD" para el backend */
function parseDateToISO(input: string): string | null {
  const parts = input.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy || yyyy.length !== 4) return null;
  const d = new Date(`${yyyy}-${mm}-${dd}`);
  if (isNaN(d.getTime())) return null;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

// ─── DatePicker Modal ─────────────────────────────────────────────────────────
// Sheet modal reutilizable que envuelve DatePickerField para usarlo en Register

interface DatePickerModalProps {
  visible: boolean;
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
  onConfirm: (val: string) => void;
}

function DatePickerModal({ visible, value, onChange, onClose, onConfirm }: DatePickerModalProps) {
  const [draft, setDraft] = useState(value);

  // Sincroniza cuando se abre
  React.useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={dpStyles.backdrop} onPress={onClose} />
      <View style={dpStyles.sheet}>
        <View style={dpStyles.handle} />
        <Text style={dpStyles.title}>Fecha de Nacimiento</Text>
        <DatePickerField value={draft} onChange={setDraft} />
        <View style={dpStyles.actions}>
          <TouchableOpacity style={dpStyles.btnCancel} onPress={onClose}>
            <Text style={dpStyles.btnCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={dpStyles.btnSave}
            onPress={() => {
              onConfirm(draft);
              onClose();
            }}
          >
            <Text style={dpStyles.btnSaveText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const dpStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 48 : 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 14 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  btnCancelText: { fontSize: 15, fontWeight: '600', color: '#888' },
  btnSave: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  btnSaveText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

// ─── RegisterScreen ───────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading, error } = useRegister();

  const [form, setForm] = useState({
    fullName: '',
    identification: '',
    email: '',
    phone: '',
    birthDate: '', // formato "DD/MM/AAAA"
    password: '',
    confirmPassword: '',
    gender: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    const { fullName, email, phone, birthDate, password, confirmPassword, gender, identification } =
      form;

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !birthDate.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
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

    const nameParts = fullName.trim().split(' ');
    const first_name = nameParts[0] ?? '';
    const last_name = nameParts.slice(1).join(' ') || first_name;

    const date_of_birth = parseDateToISO(birthDate);
    if (!date_of_birth) {
      Alert.alert('Fecha inválida', 'Selecciona tu fecha de nacimiento.');
      return;
    }

    if (gender.trim() === '') {
      Alert.alert('Género', 'Selecciona tu género.');
      return;
    }

    if (identification.trim().length !== 10) {
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
          {/* Panel verde superior */}
          <View style={styles.topPanel}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🌿</Text>
            </View>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Completa tus datos para comenzar</Text>
          </View>

          {/* Panel blanco */}
          <View style={styles.bottomPanel}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {/* Nombre */}
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan Pérez García"
              placeholderTextColor="#bbb"
              value={form.fullName}
              onChangeText={(v) => updateField('fullName', v)}
              editable={!loading}
            />

            {/* Cédula */}
            <Text style={styles.label}>Cédula</Text>
            <TextInput
              style={styles.input}
              placeholder="0934567890"
              keyboardType="phone-pad"
              placeholderTextColor="#bbb"
              value={form.identification}
              onChangeText={(v) => updateField('identification', v)}
              editable={!loading}
            />

            {/* Género */}
            <Text style={styles.label}>Género</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.gender}
                onValueChange={(value) => updateField('gender', value)}
                enabled={!loading}
              >
                <Picker.Item label="Seleccione un género" value="" color="#bbb" />
                <Picker.Item label="Femenino" value="femenino" />
                <Picker.Item label="Masculino" value="masculino" />
              </Picker>
            </View>

            {/* Correo */}
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="juan@ejemplo.com"
              placeholderTextColor="#bbb"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => updateField('email', v)}
              editable={!loading}
            />

            {/* Teléfono */}
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="0999 999 999"
              placeholderTextColor="#bbb"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(v) => updateField('phone', v)}
              editable={!loading}
            />

            {/* Fecha de nacimiento — abre DatePickerModal */}
            <Text style={styles.label}>Fecha de Nacimiento</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateRow]}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateText, !form.birthDate && styles.datePlaceholder]}>
                {form.birthDate || 'Seleccionar fecha DD/MM/AAAA'}
              </Text>
            </TouchableOpacity>

            {/* Contraseña */}
            <Text style={styles.label}>Contraseña</Text>
            <PasswordField
              value={form.password}
              onChangeText={(v) => updateField('password', v)}
              placeholder="••••••••"
            />

            {/* Confirmar contraseña */}
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <PasswordField
              value={form.confirmPassword}
              onChangeText={(v) => updateField('confirmPassword', v)}
              placeholder="••••••••"
            />

            {/* Términos */}
            <Checkbox checked={acceptTerms} onPress={() => setAcceptTerms(!acceptTerms)}>
              <Text style={styles.checkLabel}>
                Acepto los <Text style={styles.checkLink}>Términos y Condiciones</Text>
              </Text>
            </Checkbox>

            <Checkbox checked={acceptPrivacy} onPress={() => setAcceptPrivacy(!acceptPrivacy)}>
              <Text style={styles.checkLabel}>
                Acepto la <Text style={styles.checkLink}>Política de Privacidad</Text>
              </Text>
            </Checkbox>

            {/* Botón */}
            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia Sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* DatePicker Modal */}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  topPanel: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  backArrow: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logoEmoji: { fontSize: 32 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  bottomPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  errorBox: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#ffcccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#cc0000', fontSize: 13 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    marginBottom: 16,
    overflow: 'hidden',
  },

  picker: {
    paddingHorizontal: 14,
    color: '#333',
  },
  // Fecha — mismo aspecto que input pero como botón
  dateRow: { justifyContent: 'center' },
  dateText: { fontSize: 14, color: '#333' },
  datePlaceholder: { color: '#bbb' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  inputFlex: { flex: 1, paddingVertical: 13, fontSize: 14, color: '#333' },
  inputIcon: { fontSize: 16, marginLeft: 8 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: COLORS.primary },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  checkLabel: { fontSize: 13, color: '#555', flexShrink: 1 },
  checkLink: { color: COLORS.primary, fontWeight: '600' },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginText: { textAlign: 'center', fontSize: 13, color: '#888' },
  loginLink: { color: COLORS.primary, fontWeight: 'bold' },
});
