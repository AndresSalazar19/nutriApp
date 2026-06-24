import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

export const tokenStorage = {
  get(): string | null {
    try {
      return SecureStore.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    SecureStore.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  },
};
