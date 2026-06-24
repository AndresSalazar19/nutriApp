import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { OnboardingHeader } from '../OnboardingHeader';
import { LabeledInput } from './LabeledInput';
import { usePaymentForm } from '../../hooks/usePaymentForm';
import { processPayment } from '../../services/onboardingService';
import { PLANS } from '../../constants';
import { COLORS } from '@/constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PaymentScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[1];
  const form = usePaymentForm();

  const handleConfirm = async () => {
    await processPayment(form.getData());
    router.push('/(onboarding)/success');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <OnboardingHeader currentStep={3} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Plan Summary */}
        <View style={styles.planSummary}>
          <View style={styles.planSummaryTop}>
            <Text style={styles.planSummaryTitle}>
              Plan Seleccionado:{' '}
              <Text style={styles.planSummaryName}>{plan.name}</Text>
            </Text>
            <View style={styles.planSummaryRight}>
              <Text style={styles.planSummarySmall}>Renovación automática</Text>
              <Text style={styles.planSummarySmall}>Cancela cuando quieras</Text>
            </View>
          </View>
          <View style={styles.planSummaryPriceRow}>
            <Text style={styles.planSummaryPrice}>{plan.price}</Text>
            <Text style={styles.planSummaryPeriod}> /mes</Text>
          </View>
          <View style={styles.freeBadge}>
            <MaterialCommunityIcons name="party-popper" size={14} color={COLORS.primary} />
            <Text style={styles.freeBadgeText}>Primera semana GRATIS</Text>
          </View>
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Método de Pago</Text>
        <TouchableOpacity style={styles.paymentMethodCard} activeOpacity={0.8}>
          <MaterialCommunityIcons name="credit-card-outline" size={28} color={COLORS.primary} />
          <View>
            <Text style={styles.paymentMethodName}>Tarjeta de Crédito/Débito</Text>
            <Text style={styles.paymentMethodBrands}>Visa, Mastercard</Text>
          </View>
        </TouchableOpacity>

        {/* Card Info */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Información de la Tarjeta
        </Text>

        <LabeledInput
          label="Número de Tarjeta *"
          value={form.cardNumber}
          onChangeText={form.setCardNumber}
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
          maxLength={19}
          rightIcon="credit-card-outline"
        />

        <LabeledInput
          label="Nombre del Titular *"
          value={form.cardHolder}
          onChangeText={form.setCardHolder}
          placeholder="Juan Pérez Gómez"
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <LabeledInput
              label="Fecha de Vencimiento *"
              value={form.expiry}
              onChangeText={form.setExpiry}
              placeholder="MM / AA"
              keyboardType="numeric"
              maxLength={7}
            />
          </View>
          <View style={styles.halfField}>
            <LabeledInput
              label="CVV *"
              value={form.cvv}
              onChangeText={form.setCvv}
              placeholder="123"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              rightIcon="lock-outline"
            />
          </View>
        </View>

        {/* Billing Address */}
        <Text style={[styles.sectionTitle, { marginTop: 6 }]}>
          Dirección de Facturación
        </Text>

        <Text style={styles.fieldLabel}>País *</Text>
        <TouchableOpacity style={styles.pickerWrapper} activeOpacity={0.8}>
          <Text style={styles.pickerText}>{form.country}</Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>

        <View style={[styles.row, { marginTop: 14 }]}>
          <View style={styles.halfField}>
            <LabeledInput
              label="Ciudad *"
              value={form.city}
              onChangeText={form.setCity}
              placeholder="Guayaquil"
            />
          </View>
          <View style={styles.halfField}>
            <LabeledInput
              label="Código Postal"
              value={form.postalCode}
              onChangeText={form.setPostalCode}
              placeholder="090101"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={form.toggleTerms}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, form.acceptedTerms && styles.checkboxChecked]}>
            {form.acceptedTerms && <Text style={styles.checkboxCheck}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            Acepto los{' '}
            <Text style={styles.termsLink}>Términos y Condiciones</Text>
            {'\n'}y la{' '}
            <Text style={styles.termsLink}>Política de Privacidad</Text>
          </Text>
        </TouchableOpacity>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, !form.isValid && styles.confirmButtonDisabled]}
          onPress={form.isValid ? handleConfirm : undefined}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmButtonText}>Confirmar y Comenzar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  // Plan Summary
  planSummary: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FFFBF4',
    marginBottom: 20,
  },
  planSummaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  planSummaryTitle: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1 },
  planSummaryName: { color: COLORS.primary, fontWeight: '800' },
  planSummaryRight: { alignItems: 'flex-end' },
  planSummarySmall: { fontSize: 10, color: '#888', lineHeight: 15 },
  planSummaryPriceRow: { flexDirection: 'row', alignItems: 'flex-end' },
  planSummaryPrice: { fontSize: 28, fontWeight: '900', color: '#1A1A1A' },
  planSummaryPeriod: { fontSize: 13, color: '#888', marginBottom: 4 },
  freeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  freeBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },

  // Payment Method Card
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    backgroundColor: COLORS.background,
  },
  paymentMethodIcon: { fontSize: 28 },
  paymentMethodName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  paymentMethodBrands: { fontSize: 12, color: '#888', marginTop: 2 },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },

  // Country Picker
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 0,
  },
  pickerText: { fontSize: 15, color: '#1A1A1A' },
  pickerArrow: { fontSize: 12, color: '#999' },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 6,
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxCheck: { color: '#fff', fontSize: 13, fontWeight: '700' },
  termsText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },
  termsLink: { color: COLORS.primary, fontWeight: '600', textDecorationLine: 'underline' },

  // Confirm
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: { backgroundColor: '#AAAAAA', shadowColor: '#AAA' },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
