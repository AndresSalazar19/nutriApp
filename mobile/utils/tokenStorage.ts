import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(TOKEN_KEY);
      }

      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async set(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      return;
    }

    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(TOKEN_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  },
  async isExpired(): Promise<boolean> {
    const token = await this.get();
    if (!token) return true;
    const payload = decodePayload(token);
    if (!payload || typeof payload.exp !== 'number') return true;
    const bufferMs = 30 * 1000;
    return payload.exp * 1000 - bufferMs < Date.now();
  },
  async getPayload(): Promise<Record<string, unknown> | null> {
    const token = await this.get();
    if (!token) return null;
    return decodePayload(token);
  },
};
