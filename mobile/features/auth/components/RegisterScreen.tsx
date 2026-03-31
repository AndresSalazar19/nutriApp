import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
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

// Convierte "DD/MM/YY" o "DD/MM/YYYY" → "YYYY-MM-DD" para el backend
function parseDateToISO(input: string): string | null {
  const parts = input.split('/');
  if (parts.length !== 3) return null;

  let [day, month, year] = parts;
  if (year.length === 2) {
    // Heurística: años >= 25 → 1900s, < 25 → 2000s
    year = parseInt(year, 10) >= 25 ? `19${year}` : `20${year}`;
  }

  const d = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  if (isNaN(d.getTime())) return null;

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading, error } = useRegister();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    // ── Validaciones locales ──────────────────────────────────────────────────
    const { fullName, email, phone, birthDate, password, confirmPassword } = form;

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

    // Separar nombre completo en first_name / last_name
    const nameParts = fullName.trim().split(' ');
    const first_name = nameParts[0] ?? '';
    const last_name  = nameParts.slice(1).join(' ') || first_name;

    // Convertir fecha
    const date_of_birth = parseDateToISO(birthDate);
    if (!date_of_birth) {
      Alert.alert('Fecha inválida', 'Usa el formato DD/MM/AAAA (ej: 23/03/1990).');
      return;
    }

    // ── Llamada al backend ────────────────────────────────────────────────────
    const user = await register({
      first_name,
      last_name,
      email: email.trim(),
      phone: phone.trim(),
      date_of_birth,
      password,
    });

    if (user) {
      // Registro exitoso → ir al onboarding
      router.replace('/(onboarding)/health');
    }
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

            {/* Error del servidor */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {/* Nombre completo */}
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan Pérez García"
              placeholderTextColor="#bbb"
              value={form.fullName}
              onChangeText={(v) => updateField('fullName', v)}
              editable={!loading}
            />

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

            {/* Teléfono + Fecha de nacimiento */}
            <View style={styles.rowFields}>
              <View style={{ flex: 1, marginRight: 10 }}>
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
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Fecha de nacimiento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="23/03/1990"
                  placeholderTextColor="#bbb"
                  value={form.birthDate}
                  onChangeText={(v) => updateField('birthDate', v)}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Contraseña */}
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputFlex}
                placeholder="••••••••"
                placeholderTextColor="#bbb"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(v) => updateField('password', v)}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {/* Confirmar contraseña */}
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputFlex}
                placeholder="••••••••"
                placeholderTextColor="#bbb"
                secureTextEntry={!showConfirm}
                value={form.confirmPassword}
                onChangeText={(v) => updateField('confirmPassword', v)}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Text style={styles.inputIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {/* Checkboxes */}
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              <View style={[styles.checkbox, acceptTerms && styles.checkboxActive]}>
                {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>
                Acepto los{' '}
                <Text style={styles.checkLink}>Términos y Condiciones</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checkRow, { marginBottom: 28 }]}
              onPress={() => setAcceptPrivacy(!acceptPrivacy)}
            >
              <View style={[styles.checkbox, acceptPrivacy && styles.checkboxActive]}>
                {acceptPrivacy && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>
                Acepto la{' '}
                <Text style={styles.checkLink}>Política de Privacidad</Text>
              </Text>
            </TouchableOpacity>

            {/* Botón crear cuenta */}
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

            {/* Login */}
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta?{' '}
                <Text style={styles.loginLink}>Inicia Sesión</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
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
  backArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
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
  errorText: {
    color: '#cc0000',
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
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
  rowFields: {
    flexDirection: 'row',
  },
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
  inputFlex: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    color: '#333',
  },
  inputIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkLabel: {
    fontSize: 13,
    color: '#555',
    flexShrink: 1,
  },
  checkLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
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
  btnDisabled: {
    opacity: 0.7,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});