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
import { useLogin } from '@/features/auth/hooks/useAuth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PasswordField } from '@/components/ui/PasswordField';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading, error } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    const result = await login({ email: email.trim(), password });

    if (result) {
      // Autenticación exitosa → navegar al home
      router.replace('/(tabs)');
    }
    // Si result es null, el error ya está en `error` y se muestra abajo
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
              <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="leaf" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Text style={styles.subtitle}>Ingresa tus credenciales</Text>
          </View>

          {/* Panel blanco inferior */}
          <View style={styles.bottomPanel}>
            {/* Error del servidor */}
            {error ? (
              <View style={styles.errorBox}>
                <View style={styles.errorRow}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#cc0000" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </View>
            ) : null}

            {/* Correo */}
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#bbb"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
              <MaterialCommunityIcons name="email-outline" size={20} color="#999" />
            </View>

            {/* Contraseña */}
            <Text style={styles.label}>Contraseña</Text>
            <PasswordField value={password} onChangeText={setPassword} placeholder="••••••••" />

            {/* Recordarme + Olvidaste */}
            <View style={styles.row}>
              <TouchableOpacity style={styles.checkRow} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                </View>
                <Text style={styles.checkLabel}>Recordarme</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            {/* Botón principal */}
            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            {/* Divisor */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Biometría */}
            <TouchableOpacity style={styles.btnSecondary}>
              <View style={styles.biometricContent}>
                <MaterialCommunityIcons name="fingerprint" size={20} color="#555" />
                <Text style={styles.btnSecondaryText}>Usar biometría</Text>
              </View>
            </TouchableOpacity>

            {/* Registro */}
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerText}>
                ¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate aquí</Text>
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
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
    backgroundColor: '#fafafa',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#333',
  },
  inputIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    color: '#aaa',
    fontSize: 13,
  },
  btnSecondary: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 24,
  },
  btnSecondaryText: {
    color: '#555',
    fontSize: 15,
    fontWeight: '500',
  },
  registerText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  biometricContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
