import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { AuthService, DuplicateCheckField } from '@/features/auth/services/authService';
import {
  getValidationErrors,
  useRegisterValidation,
  AsyncFieldValidator,
  RegisterField,
  RegisterFormValues,
} from '@/features/auth/hooks/useRegisterValidation';
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

// Label con asterisco rojo para campos obligatorios.
function FieldLabel({ text }: { text: string }) {
  return (
    <Text style={styles.label}>
      {text} <Text style={styles.requiredMark}>*</Text>
    </Text>
  );
}

// Mensaje de error en rojo debajo del campo (nunca un Alert). Si no hay
// error pero se está corriendo el validador asíncrono de duplicados,
// muestra un hint neutro en su lugar.
function FieldError({ message, validating }: { message?: string; validating?: boolean }) {
  if (message) return <Text style={styles.fieldErrorText}>{message}</Text>;
  if (validating) return <Text style={styles.fieldHintText}>Verificando disponibilidad…</Text>;
  return null;
}

const DUPLICATE_CHECK_FIELDS = new Set<RegisterField>(['identification', 'email', 'phone']);

const DUPLICATE_MESSAGES: Record<string, string> = {
  identification: 'Esta cédula ya está registrada.',
  email: 'Este correo ya está registrado.',
  phone: 'Este teléfono ya está registrado.',
};

// Validador asíncrono de duplicados: se dispara en el onBlur de
// cédula/correo/teléfono (una vez que el formato ya es válido) y consulta
// GET /users/availability. Si la llamada falla (sin conexión, etc.) no
// bloqueamos al usuario aquí: el backend igual vuelve a validar duplicados
// al enviar el formulario completo.
const checkDuplicates: AsyncFieldValidator = async (field, value) => {
  if (!DUPLICATE_CHECK_FIELDS.has(field)) return null;
  try {
    const available = await AuthService.checkAvailability(field as DuplicateCheckField, value.trim());
    return available ? null : DUPLICATE_MESSAGES[field];
  } catch {
    return null;
  }
};

const INITIAL_FORM: RegisterFormValues = {
  fullName: '',
  identification: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading, error, errorField } = useRegister();

  const [form, setForm] = useState<RegisterFormValues>(INITIAL_FORM);
  const [acceptTerms, setAcceptTerms]       = useState(false);
  const [acceptPrivacy, setAcceptPrivacy]   = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Validación de cédula/correo/teléfono duplicados contra el backend,
  // enchufada vía el slot asíncrono del hook.
  const validation = useRegisterValidation(checkDuplicates);
  const { errors, touched, validating, validateField, validateAll, markTouched, runAsyncValidation, setFieldError } = validation;

  const updateField = (field: RegisterField, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Errores "en vivo" recalculados en cada cambio, independientes de si el
  // usuario ya tocó cada campo. Se usan solo para decidir si el botón de
  // continuar puede habilitarse, no para pintar mensajes (eso depende de
  // `touched`, para no mostrar "obligatorio" antes de que el usuario escriba).
  const liveErrors = useMemo(() => getValidationErrors(form), [form]);
  const hasClientErrors = Object.keys(liveErrors).length > 0;
  // `errors` (a diferencia de `liveErrors`) también incluye los duplicados
  // detectados por el validador asíncrono (cédula/correo/teléfono ya
  // registrados), así que el botón se mantiene bloqueado hasta que se
  // resuelvan o el usuario corrija el valor.
  const hasAsyncErrors = Object.values(errors).some(Boolean);
  const isValidating = Object.values(validating).some(Boolean);
  const canSubmit = !hasClientErrors && !hasAsyncErrors && !isValidating && acceptTerms && acceptPrivacy && !loading;

  const handleChange = (field: RegisterField, value: string) => {
    updateField(field, value);
    if (touched[field]) {
      // Revalida en vivo solo si el usuario ya salió del campo una vez,
      // para que el error desaparezca apenas corrige el valor.
      validateField(field, { ...form, [field]: value });
    }
  };

  const handleBlur = (field: RegisterField) => {
    markTouched(field);
    validateField(field, form);
    if (DUPLICATE_CHECK_FIELDS.has(field)) {
      runAsyncValidation(field, form);
    }
  };

  const handleSelect = (field: RegisterField, value: string) => {
    updateField(field, value);
    markTouched(field);
    validateField(field, { ...form, [field]: value });
  };

  // Si el backend rechaza cédula/email/teléfono por duplicado (u otra
  // razón), lo mostramos con el mismo slot visual que los errores de
  // cliente, pegado al campo correspondiente.
  useEffect(() => {
    if (errorField === 'identification' || errorField === 'email' || errorField === 'phone') {
      setFieldError(errorField, error);
      markTouched(errorField);
    }
  }, [error, errorField, setFieldError, markTouched]);

  const handleRegister = async () => {
    const valid = validateAll(form);
    if (!valid || !acceptTerms || !acceptPrivacy) return;

    const nameParts  = form.fullName.trim().split(/\s+/);
    const first_name = nameParts[0] ?? '';
    const last_name  = nameParts.slice(1).join(' ') || first_name;

    const date_of_birth = parseDateToISO(form.birthDate);
    if (!date_of_birth) return;

    const user = await register({
      first_name,
      last_name,
      email: form.email.trim(),
      phone: form.phone.trim(),
      date_of_birth,
      password: form.password,
      gender: form.gender,
      cedula: form.identification.trim(),
    });

    if (user) router.replace('/(onboarding)/health');
  };

  // Solo mostramos la caja de error genérica arriba cuando el backend NO
  // indicó un campo específico (p. ej. error de conexión). Si sí lo indicó,
  // el mensaje aparece pegado al input correspondiente.
  const showGenericError = !!error && !errorField;
  const fieldError = (field: RegisterField) => (touched[field] ? errors[field] : undefined);
  const fieldHasError = (field: RegisterField) => !!fieldError(field);

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

            {showGenericError ? (
              <View style={styles.errorBox}>
                <View style={styles.errorRow}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={18} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </View>
            ) : null}

            <FieldLabel text="Nombre Completo" />
            <TextInput
              style={[styles.input, fieldHasError('fullName') && styles.inputError]}
              placeholder="Juan Pérez García"
              placeholderTextColor={COLORS.placeholder}
              value={form.fullName}
              onChangeText={(v) => handleChange('fullName', v)}
              onBlur={() => handleBlur('fullName')}
              editable={!loading}
            />
            <FieldError message={fieldError('fullName')} />

            <FieldLabel text="Cédula" />
            <TextInput
              style={[styles.input, fieldHasError('identification') && styles.inputError]}
              placeholder="0934567890"
              keyboardType="number-pad"
              maxLength={10}
              placeholderTextColor={COLORS.placeholder}
              value={form.identification}
              onChangeText={(v) => handleChange('identification', v)}
              onBlur={() => handleBlur('identification')}
              editable={!loading}
            />
            <FieldError message={fieldError('identification')} validating={validating.identification} />

            <FieldLabel text="Género" />
            <View style={[styles.pickerContainer, fieldHasError('gender') && styles.inputError]}>
              <Picker
                selectedValue={form.gender}
                onValueChange={(value) => handleSelect('gender', value)}
                enabled={!loading}
                style={styles.picker}
                dropdownIconColor={COLORS.textPrimary}
              >
                <Picker.Item label="Seleccione un género" value="" color={COLORS.placeholder} style={styles.pickerItem} />
                <Picker.Item label="Femenino" value="femenino" color={COLORS.textPrimary} style={styles.pickerItem} />
                <Picker.Item label="Masculino" value="masculino" color={COLORS.textPrimary} style={styles.pickerItem} />
              </Picker>
            </View>
            <FieldError message={fieldError('gender')} />

            <FieldLabel text="Correo Electrónico" />
            <TextInput
              style={[styles.input, fieldHasError('email') && styles.inputError]}
              placeholder="juan@ejemplo.com"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => handleChange('email', v)}
              onBlur={() => handleBlur('email')}
              editable={!loading}
            />
            <FieldError message={fieldError('email')} validating={validating.email} />

            <FieldLabel text="Teléfono" />
            <TextInput
              style={[styles.input, fieldHasError('phone') && styles.inputError]}
              placeholder="0999999999"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="number-pad"
              maxLength={10}
              value={form.phone}
              onChangeText={(v) => handleChange('phone', v)}
              onBlur={() => handleBlur('phone')}
              editable={!loading}
            />
            <FieldError message={fieldError('phone')} validating={validating.phone} />

            <FieldLabel text="Fecha de Nacimiento" />
            <TouchableOpacity
              style={[styles.dateButton, fieldHasError('birthDate') && styles.inputError]}
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
            <FieldError message={fieldError('birthDate')} />

            <FieldLabel text="Contraseña" />
            <PasswordField
              value={form.password}
              onChangeText={(v) => handleChange('password', v)}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
            />
            <FieldError message={fieldError('password')} />

            <FieldLabel text="Confirmar Contraseña" />
            <PasswordField
              value={form.confirmPassword}
              onChangeText={(v) => handleChange('confirmPassword', v)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="••••••••"
            />
            <FieldError message={fieldError('confirmPassword')} />

            <View style={styles.termsSection}>
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
              {(!acceptTerms || !acceptPrivacy) && (
                <Text style={styles.termsHint}>Debes aceptar ambos para continuar.</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, !canSubmit && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={!canSubmit}
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
        onConfirm={(val) => handleSelect('birthDate', val)}
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
  requiredMark: { color: COLORS.error },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.inputBg, marginBottom: 16,
  },
  inputError: {
    borderColor: COLORS.error, borderWidth: 1.5, marginBottom: 6,
  },
  fieldErrorText: {
    color: COLORS.error, fontSize: 12, marginTop: -2, marginBottom: 14,
  },
  fieldHintText: {
    color: COLORS.textMuted, fontSize: 12, marginTop: -2, marginBottom: 14,
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
  termsSection: {
    marginTop: 18,
    marginBottom: 24,
    gap: 14,
  },
  termsHint: {
    fontSize: 12, color: COLORS.textMuted, marginTop: -6,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 2, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: COLORS.primary },
  checkmark:      { color: COLORS.textOnPrimary, fontSize: 12, fontWeight: 'bold' },
  checkLabel:     { fontSize: 13, color: COLORS.textSecondary, flexShrink: 1, lineHeight: 19 },
  checkLink:      { color: COLORS.primary, fontWeight: '600' },
  btnPrimary: {
    backgroundColor: COLORS.primary, paddingVertical: 16,
    borderRadius: 50, alignItems: 'center', marginTop: 4, marginBottom: 20,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled:     { opacity: 0.5 },
  btnPrimaryText:  { color: COLORS.textOnPrimary, fontSize: 16, fontWeight: 'bold' },
  loginText:       { textAlign: 'center', fontSize: 13, color: COLORS.textMuted },
  loginLink:       { color: COLORS.primary, fontWeight: 'bold' },
});
