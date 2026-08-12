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
import { PillSelect } from '../shared/PillSelect';
import { FoodFrequencyTable } from './FoodFrequencyTable';
import { useDietaryForm } from '../../hooks/useDietaryForm';
import { submitDietaryHistory } from '../../services/onboardingService';
import { APPETITE_OPTIONS, MEAL_PREPARER_OPTIONS } from '../../constants';
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

export default function DietaryScreen() {
  const router = useRouter();
  const form = useDietaryForm();
  const [saving, setSaving] = React.useState(false);

  const handleContinue = async () => {
    if (saving) return;
    if (!form.validateAll()) return;

    setSaving(true);
    try {
      await submitDietaryHistory(form.getData());
      router.push('/(onboarding)/plans');
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
      <SubStepBadge step={3} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Historia alimentaria</Text>
        <Text style={styles.pageSubtitle}>
          Últimos datos antes de armar tu plan. Las preguntas Sí/No y la tabla de frecuencia son obligatorias.
        </Text>

        <SectionHeader icon="silverware-fork-knife" title="Hábitos generales" />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <FieldLabel text="Comidas al día" required={false} />
            <TextInput
              style={styles.inputFull}
              value={form.mealsPerDay}
              onChangeText={form.setMealsPerDay}
              keyboardType="numeric"
              placeholder="Ej: 3"
              placeholderTextColor="#AAAAAA"
            />
          </View>
          <View style={styles.halfField}>
            <FieldLabel text="Vasos de agua al día" required={false} />
            <TextInput
              style={styles.inputFull}
              value={form.waterGlassesPerDay}
              onChangeText={form.setWaterGlassesPerDay}
              keyboardType="numeric"
              placeholder="Ej: 8"
              placeholderTextColor="#AAAAAA"
            />
          </View>
        </View>

        <YesNoToggle
          label="¿Sueles omitir comidas?"
          value={form.skipsMeals}
          onChange={form.setSkipsMeals}
          error={form.errors.skipsMeals}
          style={styles.field}
        />

        <PillSelect
          label="¿Quién prepara los alimentos?"
          options={MEAL_PREPARER_OPTIONS}
          value={form.mealPreparer || null}
          onChange={form.setMealPreparer}
        />

        <YesNoToggle
          label="¿Comes fuera de casa frecuentemente?"
          value={form.eatsOutFrequently}
          onChange={form.setEatsOutFrequently}
          error={form.errors.eatsOutFrequently}
          style={styles.field}
        />

        <PillSelect
          label="¿Cómo describirías tu apetito?"
          options={APPETITE_OPTIONS}
          value={form.appetite || null}
          onChange={form.setAppetite}
        />

        <YesNoToggle
          label="¿Comes por ansiedad, estrés o aburrimiento?"
          value={form.eatsFromEmotions}
          onChange={form.setEatsFromEmotions}
          error={form.errors.eatsFromEmotions}
          style={styles.field}
        />

        <YesNoToggle
          label="¿Tienes antojos frecuentes?"
          value={form.frequentCravings}
          onChange={form.setFrequentCravings}
          error={form.errors.frequentCravings}
          style={styles.field}
        />

        <YesNoToggle
          label="¿Consumes bebidas azucaradas?"
          value={form.drinksSugaryBeverages}
          onChange={form.setDrinksSugaryBeverages}
          error={form.errors.drinksSugaryBeverages}
          style={styles.field}
        />

        <YesNoToggle
          label="¿Consumes alcohol?"
          value={form.drinksAlcohol}
          onChange={form.setDrinksAlcohol}
          error={form.errors.drinksAlcohol}
          style={styles.field}
        />

        <YesNoToggle
          label="¿Fumas?"
          value={form.smokes}
          onChange={form.setSmokes}
          error={form.errors.smokes}
          style={styles.field}
        />

        <SectionHeader icon="chart-timeline-variant" title="Frecuencia de consumo" />
        <FoodFrequencyTable
          value={form.foodFrequency}
          onChange={form.setFoodFrequencyItem}
          error={form.errors.foodFrequency}
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
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  halfField: { flex: 1 },
  field: { marginBottom: 16 },
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
