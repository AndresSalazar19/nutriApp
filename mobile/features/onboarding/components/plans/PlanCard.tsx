import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Plan } from '../../types';

interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, selected, onSelect }) => {
  const borderColor = selected ? plan.accentColor : plan.accentColor + '55';
  const bgColor = plan.accentColor + '08';

  return (
    <TouchableOpacity
      style={[styles.planCard, { borderColor, backgroundColor: bgColor }]}
      onPress={() => onSelect(plan.id)}
      activeOpacity={0.85}
    >
      <View style={styles.planHeader}>
        <Text style={[styles.planName, { color: plan.titleColor }]}>{plan.name}</Text>
        {plan.badge && (
          <View style={[styles.badge, { backgroundColor: plan.accentColor }]}>
            <Text style={styles.badgeText}>{plan.badge}</Text>
          </View>
        )}
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceText}>{plan.price}</Text>
        <Text style={styles.pricePeriod}>{plan.period}</Text>
        {plan.savingsText && (
          <View style={[styles.savingsBadge, { backgroundColor: plan.accentColor + '22' }]}>
            <Text style={[styles.savingsText, { color: plan.accentColor }]}>
              {plan.savingsText}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.featuresList}>
        {plan.features.map((feature, i) => (
          <View key={i} style={styles.featureRow}>
            <MaterialCommunityIcons name="check" size={14} color={plan.accentColor} />
            <Text
              style={[
                styles.featureText,
                i === 0 && feature.includes('Todo') && styles.featureTextBold,
              ]}
            >
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.selectButton,
          { borderColor: plan.accentColor },
          selected && { backgroundColor: plan.accentColor },
        ]}
        onPress={() => onSelect(plan.id)}
        activeOpacity={0.8}
      >
        <View style={styles.selectButtonContent}>
          {selected && <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.textOnPrimary} />}
          <Text
            style={[
              styles.selectButtonText,
              { color: plan.accentColor },
              selected && { color: COLORS.textOnPrimary },
            ]}
          >
            {selected ? 'Seleccionado' : 'Seleccionar Plan'}
          </Text>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  planCard: { borderWidth: 2, borderRadius: 16, padding: 16 },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  planName: { fontSize: 18, fontWeight: '800' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: 12 },
  priceText: { fontSize: 28, fontWeight: '900', color: '#1A1A1A' },
  pricePeriod: { fontSize: 14, color: '#888', marginBottom: 4 },
  savingsBadge: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
  },
  savingsText: { fontSize: 12, fontWeight: '700' },
  featuresList: { gap: 6, marginBottom: 14 },
  featureRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  featureCheck: { fontSize: 13, fontWeight: '700', marginTop: 1 },
  featureText: { fontSize: 13, color: '#444', flex: 1, lineHeight: 18 },
  featureTextBold: { fontWeight: '700', color: '#1A1A1A' },
  selectButton: { borderWidth: 2, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  selectButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectButtonText: { fontSize: 14, fontWeight: '700' },
});
