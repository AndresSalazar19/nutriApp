import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="check-decagram" size={48} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>¡Todo listo!</Text>
        <Text style={styles.subtitle}>
          Tu cuenta ha sido creada y tu plan activado. Estás listo para comenzar tu camino hacia
          una alimentación más saludable.
        </Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <MaterialCommunityIcons name="check-circle-outline" size={20} color={COLORS.primaryMedium} />
            <Text style={styles.cardText}>Perfil médico completado</Text>
          </View>
          <View style={styles.cardRow}>
            <MaterialCommunityIcons name="check-circle-outline" size={20} color={COLORS.primaryMedium} />
            <Text style={styles.cardText}>Plan de suscripción activado</Text>
          </View>
          <View style={styles.cardRow}>
            <MaterialCommunityIcons name="check-circle-outline" size={20} color={COLORS.primaryMedium} />
            <Text style={styles.cardText}>Pago procesado exitosamente</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Comenzar ahora</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.textOnPrimary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    marginBottom: 32,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  continueButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: { color: COLORS.textOnPrimary, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
