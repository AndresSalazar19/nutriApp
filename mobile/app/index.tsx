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

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {

  const router = useRouter();

  const handleLogin = () => {
    // Aquí irá la navegación al dashboard cuando esté listo
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
        {/* Logo */}
        <View style={styles.logoCircle}>
          {/* Reemplaza este Text por tu <Image> del logo SVG/PNG cuando lo tengas */}
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>

        <Text style={styles.brandName}>NutrIA</Text>
        <Text style={styles.brandSubtitle}>Tu compañero nutricional inteligente</Text>

        {/* Features */}
        <View style={styles.featureListWrapper}>
            <View style={styles.featureList}>
                {[
                { emoji: '🥗', label: 'Planes personalizados' },
                { emoji: '📊', label: 'Seguimiento de progreso' },
                { emoji: '💬', label: 'Chat con nutricionista' },
                ].map((item) => (
                <View key={item.label} style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                    <Text style={styles.featureEmoji}>{item.emoji}</Text>
                    </View>
                    <Text style={styles.featureLabel}>{item.label}</Text>
                </View>
                ))}
            </View>
        </View>
      </View>

      {/* Panel inferior blanco */}
      <View style={styles.bottomPanel}>
        <Text style={styles.welcomeTitle}>Bienvenido a NutrIA</Text>
        <Text style={styles.welcomeSubtitle}>
          Controla tu hipertensión con alimentación saludable
        </Text>

        {/* Botón Iniciar Sesión */}
        <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
          <Text style={styles.btnPrimaryText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        {/* Botón Crear Cuenta */}
        <TouchableOpacity style={styles.btnSecondary} onPress={handleRegister}>
          <Text style={styles.btnSecondaryText}>Crear Cuenta</Text>
        </TouchableOpacity>

        {/* Términos */}
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
    backgroundColor: '#fff',
  },

  // ── Panel verde superior ──
  topPanel: {
    backgroundColor: '#4caf50',
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
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
    color: '#fff',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 28,
  },
  featureListWrapper: {
  width: '100%',
  alignItems: 'center',
  },
  featureList: {
    gap: 12,
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // ── Panel blanco inferior ──
  bottomPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 28,
    paddingTop: 36,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnSecondary: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 24,
  },
  btnSecondaryText: {
    color: '#4caf50',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#4caf50',
    textDecorationLine: 'underline',
  },
});