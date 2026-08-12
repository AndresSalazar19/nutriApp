import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'avatar_uri:';

function keyFor(userId: string) {
  return `${KEY_PREFIX}${userId}`;
}

/**
 * Guarda la foto de perfil SOLO en el dispositivo (AsyncStorage), ligada al
 * usuario logueado -- no se sube al backend. Sobrevive a cerrar/reabrir la
 * app, pero se pierde si el usuario cambia de dispositivo, reinstala la app,
 * o borra los datos de la app.
 */
export const avatarStorage = {
  async get(userId: string): Promise<string | null> {
    if (!userId) return null;
    return AsyncStorage.getItem(keyFor(userId));
  },

  async set(userId: string, uri: string): Promise<void> {
    if (!userId) return;
    await AsyncStorage.setItem(keyFor(userId), uri);
  },

  async clear(userId: string): Promise<void> {
    if (!userId) return;
    await AsyncStorage.removeItem(keyFor(userId));
  },
};
