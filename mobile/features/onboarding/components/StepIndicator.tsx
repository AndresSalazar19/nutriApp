import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ONBOARDING_STEPS } from '../constants';
import { COLORS } from '@/constants/colors';

interface StepIndicatorProps {
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => (
  <View style={styles.stepContainer}>
    {ONBOARDING_STEPS.map((step, index) => {
      const isCompleted = step.id < currentStep;
      const isActive = step.id === currentStep;
      return (
        <React.Fragment key={step.id}>
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                isCompleted && styles.stepCircleCompleted,
                isActive && styles.stepCircleActive,
              ]}
            >
              <Text
                style={[
                  styles.stepCircleText,
                  (isActive || isCompleted) && styles.stepCircleTextActive,
                ]}
              >
                {isCompleted ? '✓' : step.icon ?? step.id}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                (isActive || isCompleted) && styles.stepLabelActive,
              ]}
            >
              {step.label}
            </Text>
          </View>
          {index < ONBOARDING_STEPS.length - 1 && (
            <View
              style={[
                styles.stepLine,
                isCompleted && styles.stepLineCompleted,
              ]}
            />
          )}
        </React.Fragment>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  stepItem: { alignItems: 'center', width: 56 },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: '#fff', borderColor: '#fff' },
  stepCircleCompleted: { backgroundColor: '#fff', borderColor: '#fff' },
  stepCircleText: { color: 'rgba(255,255,255,0.7)', fontWeight: '700', fontSize: 13 },
  stepCircleTextActive: { color: COLORS.primary },
  stepLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 4, textAlign: 'center' },
  stepLabelActive: { color: '#fff', fontWeight: '600' },
  stepLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 14 },
  stepLineCompleted: { backgroundColor: '#fff' },
});
