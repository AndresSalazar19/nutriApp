import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { ActivityLevel } from '../../types';
import { ACTIVITY_LEVELS } from '../../constants';
import { FieldLabel, FieldError } from '../shared/FormField';

const ICONS: Record<ActivityLevel, keyof typeof MaterialCommunityIcons.glyphMap> = {
  sedentario: 'seat-outline',
  moderado: 'walk',
  pesado: 'weight-lifter',
};

interface ActivityLevelSelectProps {
  value: ActivityLevel | null;
  onChange: (value: ActivityLevel) => void;
  error?: string | null;
}

export const ActivityLevelSelect: React.FC<ActivityLevelSelectProps> = ({ value, onChange, error }) => (
  <View style={styles.wrap}>
    <FieldLabel text="Nivel de actividad laboral" />
    {ACTIVITY_LEVELS.map((level) => {
      const selected = value === level.value;
      return (
        <TouchableOpacity
          key={level.value}
          style={[styles.card, selected && styles.cardSelected]}
          onPress={() => onChange(level.value)}
          activeOpacity={0.75}
        >
          <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
            <MaterialCommunityIcons
              name={ICONS[level.value]}
              size={22}
              color={selected ? '#fff' : COLORS.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, selected && styles.cardTitleSelected]}>{level.label}</Text>
            <Text style={styles.cardHint}>{level.hint}</Text>
          </View>
          <View style={[styles.radio, selected && styles.radioFilled]} />
        </TouchableOpacity>
      );
    })}
    <FieldError message={error} />
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginTop: 16, marginBottom: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 12,
    gap: 12,
    marginBottom: 10,
  },
  cardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: { backgroundColor: COLORS.primary },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  cardTitleSelected: { color: COLORS.primaryDark },
  cardHint: { fontSize: 12, color: '#888', marginTop: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCC',
  },
  radioFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
});
