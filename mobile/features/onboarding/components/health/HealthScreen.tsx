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
} from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingHeader } from '../OnboardingHeader';
import { BMICard } from './BMICard';
import { AllergyChip } from './AllergyChip';
import { useHealthForm } from '../../hooks/useHealthForm';
import { submitHealthProfile } from '../../services/onboardingService';
import { ALLERGIES } from '../../constants';
import { COLORS } from '@/constants/colors';

export default function HealthScreen() {
  const router = useRouter();
  const form = useHealthForm();

  const handleContinue = async () => {
    await submitHealthProfile(form.getData());
    router.push('/(onboarding)/plans');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <OnboardingHeader currentStep={1} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Información de Salud Básica</Text>

        {/* Weight & Height */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Peso Actual *</Text>
            <View style={styles.inputWithUnit}>
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
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Altura *</Text>
            <View style={styles.inputWithUnit}>
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
          </View>
        </View>

        <BMICard weight={form.weight} height={form.height} />

        {/* Blood Pressure */}
        <Text style={styles.fieldLabel}>Presión Arterial *</Text>
        <View style={styles.row}>
          <View style={styles.halfField}>
            <View style={styles.inputWithUnit}>
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
          </View>
          <View style={styles.halfField}>
            <View style={styles.inputWithUnit}>
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
          </View>
        </View>

        {/* Hypertension toggle */}
        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
          ¿Tienes diagnóstico de hipertensión? *
        </Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.radioOption, form.hasHypertension && styles.radioOptionSelected]}
            onPress={() => form.setHasHypertension(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.radioCircle, form.hasHypertension && styles.radioCircleFilled]} />
            <Text style={[styles.radioText, form.hasHypertension && styles.radioTextSelected]}>
              Sí
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioOption, !form.hasHypertension && styles.radioOptionSelected]}
            onPress={() => form.setHasHypertension(false)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.radioCircle, !form.hasHypertension && styles.radioCircleFilled]}
            />
            <Text style={[styles.radioText, !form.hasHypertension && styles.radioTextSelected]}>
              No
            </Text>
          </TouchableOpacity>
        </View>

        {/* Medications */}
        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Medicamentos Actuales</Text>
        <TextInput
          style={styles.inputFull}
          value={form.medications}
          onChangeText={form.setMedications}
          placeholder="Ej: Losartán 50mg, Aspirina..."
          placeholderTextColor="#AAAAAA"
        />

        {/* Allergies */}
        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Alergias Alimentarias</Text>
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
          <TouchableOpacity style={styles.addChip} activeOpacity={0.7}>
            <Text style={styles.addChipText}>+ Agregar otra</Text>
          </TouchableOpacity>
        </View>

        {/* Dietary Restrictions */}
        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Restricciones Dietéticas</Text>
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
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
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
  radioOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    backgroundColor: '#fff',
  },
  radioOptionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  radioText: { fontSize: 15, color: '#555', fontWeight: '500' },
  radioTextSelected: { color: COLORS.primary, fontWeight: '700' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#CCC',
    backgroundColor: '#fff',
  },
  addChipText: { fontSize: 13, color: '#555', fontWeight: '500' },
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
