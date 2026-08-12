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
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { OnboardingHeader } from '../OnboardingHeader';
import { SubStepBadge } from '../shared/SubStepBadge';
import { FieldLabel } from '../shared/FormField';
import { YesNoToggle } from '../shared/YesNoToggle';
import { ChipMultiSelect } from '../shared/ChipMultiSelect';
import { useHistoryForm } from '../../hooks/useHistoryForm';
import { submitPathologicalHistory } from '../../services/onboardingService';
import { PATHOLOGICAL_CONDITIONS, DIGESTIVE_ISSUES, FAMILY_HISTORY_ITEMS } from '../../constants';
import { COLORS } from '@/constants/colors';

function SectionHeader({ icon, title }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrap}>
        <MaterialCommunityIcons name={icon} size={18} color={COLORS.primary} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const form = useHistoryForm();
  const [saving, setSaving] = React.useState(false);

  const handleContinue = async () => {
    if (saving) return;
    if (!form.validateAll()) return;

    setSaving(true);
    try {
      await submitPathologicalHistory(form.getData());
      router.push('/(onboarding)/dietary');
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
      <SubStepBadge step={2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Antecedentes</Text>
        <Text style={styles.pageSubtitle}>
          Cuéntanos tu historial médico y familiar. Las preguntas Sí/No son obligatorias.
        </Text>

        <SectionHeader icon="clipboard-pulse-outline" title="Antecedentes personales patológicos" />

        <ChipMultiSelect
          label="¿Tienes alguna enfermedad diagnosticada?"
          hint="Selecciona todas las que apliquen (opcional)"
          options={PATHOLOGICAL_CONDITIONS}
          selected={form.conditions}
          onToggle={form.toggleCondition}
        />
        {form.conditions.includes('Otra') && (
          <TextInput
            style={styles.inputFull}
            value={form.otherCondition}
            onChangeText={form.setOtherCondition}
            placeholder="¿Cuál otra enfermedad?"
            placeholderTextColor="#AAAAAA"
          />
        )}

        <YesNoToggle
          label="¿Has sido hospitalizado anteriormente?"
          value={form.hospitalized}
          onChange={form.setHospitalized}
          error={form.errors.hospitalized}
          style={styles.field}
        />
        {form.hospitalized === true && (
          <TextInput
            style={styles.inputFull}
            value={form.hospitalizedDetail}
            onChangeText={form.setHospitalizedDetail}
            placeholder="¿Por qué motivo? (opcional)"
            placeholderTextColor="#AAAAAA"
          />
        )}

        <YesNoToggle
          label="¿Tienes alergias alimentarias?"
          value={form.hasFoodAllergies}
          onChange={form.setHasFoodAllergies}
          error={form.errors.hasFoodAllergies}
          style={styles.field}
        />
        {form.hasFoodAllergies === true && (
          <TextInput
            style={styles.inputFull}
            value={form.foodAllergies}
            onChangeText={form.setFoodAllergies}
            placeholder="¿Cuáles? Ej: Maní, mariscos... (opcional)"
            placeholderTextColor="#AAAAAA"
          />
        )}

        <YesNoToggle
          label="¿Tienes intolerancias alimentarias?"
          value={form.hasFoodIntolerances}
          onChange={form.setHasFoodIntolerances}
          error={form.errors.hasFoodIntolerances}
          style={styles.field}
        />
        {form.hasFoodIntolerances === true && (
          <TextInput
            style={styles.inputFull}
            value={form.foodIntolerances}
            onChangeText={form.setFoodIntolerances}
            placeholder="¿Cuáles? Ej: Lactosa, gluten... (opcional)"
            placeholderTextColor="#AAAAAA"
          />
        )}

        <YesNoToggle
          label="¿Presentas problemas digestivos?"
          value={form.hasDigestiveIssues}
          onChange={form.setHasDigestiveIssues}
          error={form.errors.hasDigestiveIssues}
          style={styles.field}
        />
        {form.hasDigestiveIssues === true && (
          <View style={styles.chipsContainer}>
            {DIGESTIVE_ISSUES.map((issue) => (
              <TouchableOpacity
                key={issue.key}
                style={[styles.chip, form.digestiveIssues[issue.key] && styles.chipSelected]}
                onPress={() => form.toggleDigestiveIssue(issue.key)}
                activeOpacity={0.7}
              >
                {form.digestiveIssues[issue.key] && (
                  <MaterialCommunityIcons name="check" size={14} color={COLORS.primary} />
                )}
                <Text style={[styles.chipText, form.digestiveIssues[issue.key] && styles.chipTextSelected]}>
                  {issue.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <YesNoToggle
          label="¿Consumes medicamentos actualmente?"
          value={form.takesMedications}
          onChange={form.setTakesMedications}
          error={form.errors.takesMedications}
          style={styles.field}
        />
        {form.takesMedications === true && (
          <TextInput
            style={styles.inputFull}
            value={form.currentMedications}
            onChangeText={form.setCurrentMedications}
            placeholder="¿Cuáles? (opcional)"
            placeholderTextColor="#AAAAAA"
          />
        )}

        <YesNoToggle
          label="¿Consumes suplementos?"
          value={form.takesSupplements}
          onChange={form.setTakesSupplements}
          error={form.errors.takesSupplements}
          style={styles.field}
        />
        {form.takesSupplements === true && (
          <TextInput
            style={styles.inputFull}
            value={form.supplements}
            onChangeText={form.setSupplements}
            placeholder="¿Cuáles? (opcional)"
            placeholderTextColor="#AAAAAA"
          />
        )}

        <YesNoToggle
          label="¿Te han realizado cirugías?"
          value={form.hasSurgeries}
          onChange={form.setHasSurgeries}
          error={form.errors.hasSurgeries}
          style={styles.field}
        />
        {form.hasSurgeries === true && (
          <TextInput
            style={styles.inputFull}
            value={form.surgeriesDetail}
            onChangeText={form.setSurgeriesDetail}
            placeholder="¿Cuáles y cuándo? (opcional)"
            placeholderTextColor="#AAAAAA"
          />
        )}

        <SectionHeader icon="account-group-outline" title="Antecedentes familiares" />
        <ChipMultiSelect
          label="¿Hay antecedentes familiares de...?"
          hint="Selecciona todos los que apliquen (opcional)"
          options={FAMILY_HISTORY_ITEMS.map((i) => i.label)}
          selected={FAMILY_HISTORY_ITEMS.filter((i) => form.familyHistory[i.key]).map((i) => i.label)}
          onToggle={(label) => {
            const item = FAMILY_HISTORY_ITEMS.find((i) => i.label === label);
            if (item) form.toggleFamilyHistory(item.key);
          }}
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
  pageTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  pageSubtitle: { fontSize: 12.5, color: '#888', marginBottom: 16, lineHeight: 17 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 12 },
  sectionIconWrap: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark },
  field: { marginBottom: 4, marginTop: 4 },
  inputFull: {
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 48,
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 14,
  },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#CCC',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  chipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  chipTextSelected: { color: COLORS.primary, fontWeight: '700' },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
