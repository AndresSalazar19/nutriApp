import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {

  const router = useRouter();

  const handleLogin = () => {
    console.log('Iniciar sesión');
    router.push('/login');
  };

  const handleRegister = () => {
    console.log('Crear cuenta');
    router.push('/register');
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Panel superior verde */}
      <View style={styles.topPanel}>
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="leaf" size={36} color={COLORS.primary} />
        </View>

        <Text style={styles.brandName}>NutrIA</Text>
      </View>

      {/* Panel inferior blanco */}
      <View style={styles.bottomPanel}>
        <Text style={styles.welcomeTitle}>Bienvenido a NutrIA</Text>
        <Text style={styles.welcomeSubtitle}>
          Controla tu hipertensión con alimentación saludable
        </Text>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
          <Text style={styles.btnPrimaryText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={handleRegister}>
          <Text style={styles.btnSecondaryText}>Crear Cuenta</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Al continuar, aceptas nuestros{'\n'}
          <Text style={styles.termsLink}>Términos y Condiciones</Text>
        </Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  topPanel: {
    backgroundColor: COLORS.primary,
    height: height * 0.52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logoEmoji: {
    fontSize: 36,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textOnPrimary,
    marginBottom: 4,
  },

  bottomPanel: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 28,
    paddingTop: 36,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnSecondary: {
    width: '100%',
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 24,
  },
  btnSecondaryText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});
