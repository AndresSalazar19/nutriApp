import AsyncStorage from '@react-native-async-storage/async-storage';

export type OnboardingStep = 'health' | 'plans' | 'payment' | 'completed';

const KEY_PREFIX = 'onboarding_step:';

function keyFor(userId: string) {
  return `${KEY_PREFIX}${userId}`;
}

export const OnboardingProgress = {
  async get(userId: string): Promise<OnboardingStep | null> {
    const value = await AsyncStorage.getItem(keyFor(userId));
    if (value === 'health' || value === 'plans' || value === 'payment' || value === 'completed') {
      return value;
    }
    return null;
  },

  async set(userId: string, step: OnboardingStep): Promise<void> {
    await AsyncStorage.setItem(keyFor(userId), step);
  },
};
