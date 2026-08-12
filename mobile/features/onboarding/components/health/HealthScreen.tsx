import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingHeader } from '../OnboardingHeader';
import { SubStepBadge } from '../shared/SubStepBadge';
import { FieldLabel, FieldError } from '../shared/FormField';
import { YesNoToggle } from '../shared/YesNoToggle';
import { BMICard } from './BMICard';
import { AllergyChip } from './AllergyChip';
import { ActivityLevelSelect } from './ActivityLevelSelect';
import { useHealthForm } from '../../hooks/useHealthForm';
import { submitHealthProfile } from '../../services/onboardingService';
import { ALLERGIES } from '../../constants';
import { COLORS } from '@/constants/colors';

export default function HealthScreen() {
  const router = useRouter();
  const form = useHealthForm();
  const [saving, setSaving] = React.useState(false);

  const handleContinue = async () => {
    if (saving) return;
    if (!form.validateAll()) return; // No dejar avanzar con el formulario incompleto.

    setSaving(true);
    try {
      await submitHealthProfile(form.getData());
      router.push('/(onboarding)/history');
    } catch (error) {
      Alert.alert(
        'No se pudo guardar',
        error instanceof Error ? error.message : 'Intenta nuevamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <OnboardingHeader currentStep={1} />
      <SubStepBadge step={1} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Información de Salud Básica</Text>
        <Text style={styles.sectionSubtitle}>
          Estos datos son obligatorios: los usamos para calcular tu plan nutricional.
        </Text>

        {/* Weight & Height */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <FieldLabel text="Peso Actual" />
            <View style={[styles.inputWithUnit, form.errors.weight && styles.inputError]}>
              <TextInput
                style={styles.input}
                value={form.weight}
                onChangeText={form.setWeight}
                keyboardType="decimal-pad"
                placeholder="0.0"
                placeholderTextColor="#AAAAAA"
              />
              <Text style={styles.unitText}>kg</Text>
            </View>
            <FieldError message={form.errors.weight} />
          </View>
          <View style={styles.halfField}>
            <FieldLabel text="Altura" />
            <View style={[styles.inputWithUnit, form.errors.height && styles.inputError]}>
              <TextInput
                style={styles.input}
                value={form.height}
                onChangeText={form.setHeight}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#AAAAAA"
              />
              <Text style={styles.unitText}>m</Text>
            </View>
            <FieldError message={form.errors.height} />
          </View>
        </View>

        <BMICard weight={form.weight} height={form.height} />

        {/* Blood Pressure */}
        <FieldLabel text="Presión Arterial" />
        <View style={styles.row}>
          <View style={styles.halfField}>
            <View style={[styles.inputWithUnit, form.errors.systolic && styles.inputError]}>
              <TextInput
                style={styles.input}
                value={form.systolic}
                onChangeText={form.setSystolic}
                keyboardType="numeric"
                placeholder="120"
                placeholderTextColor="#AAAAAA"
              />
              <Text style={styles.unitText}>Sistólica</Text>
            </View>
            <FieldError message={form.errors.systolic} />
          </View>
          <View style={styles.halfField}>
            <View style={[styles.inputWithUnit, form.errors.diastolic && styles.inputError]}>
              <TextInput
                style={styles.input}
                value={form.diastolic}
                onChangeText={form.setDiastolic}
                keyboardType="numeric"
                placeholder="80"
                placeholderTextColor="#AAAAAA"
              />
              <Text style={styles.unitText}>Diastólica</Text>
            </View>
            <FieldError message={form.errors.diastolic} />
          </View>
        </View>

        {/* Hypertension toggle */}
        <YesNoToggle
          label="¿Tienes diagnóstico de hipertensión?"
          value={form.hasHypertension}
          onChange={form.setHasHypertension}
          error={form.errors.hasHypertension}
          style={{ marginTop: 16 }}
        />

        {/* Activity level */}
        <ActivityLevelSelect
          value={form.activityLevel}
          onChange={form.setActivityLevel}
          error={form.errors.activityLevel}
        />

        {/* Medications */}
        <FieldLabel text="Medicamentos Actuales" required={false} style={{ marginTop: 16 }} />
        <TextInput
          style={styles.inputFull}
          value={form.medications}
          onChangeText={form.setMedications}
          placeholder="Ej: Losartán 50mg, Aspirina..."
          placeholderTextColor="#AAAAAA"
        />

        {/* Allergies */}
        <FieldLabel text="Alergias Alimentarias" required={false} style={{ marginTop: 16 }} />
        <Text style={styles.fieldHint}>Selecciona todas las que apliquen</Text>
        <View style={styles.chipsContainer}>
          {ALLERGIES.map((allergy) => (
            <AllergyChip
              key={allergy}
              label={allergy}
              selected={form.selectedAllergies.includes(allergy)}
              onPress={() => form.toggleAllergy(allergy)}
            />
          ))}
        </View>

        {/* Dietary Restrictions */}
        <FieldLabel text="Restricciones Dietéticas" required={false} style={{ marginTop: 16 }} />
        <TextInput
          style={styles.inputFull}
          value={form.dietaryRestrictions}
          onChangeText={form.setDietaryRestrictions}
          placeholder="Ej: Vegetariano, Sin gluten..."
          placeholderTextColor="#AAAAAA"
        />

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Continuar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  sectionSubtitle: { fontSize: 12.5, color: '#888', marginBottom: 16, lineHeight: 17 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  fieldHint: { fontSize: 12, color: '#888', marginBottom: 8, marginTop: -4 },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: { borderColor: COLORS.error, backgroundColor: COLORS.errorLight },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A', fontWeight: '500' },
  inputFull: {
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 48,
    fontSize: 14,
    color: '#1A1A1A',
  },
  unitText: { fontSize: 13, color: '#999', marginLeft: 4 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
