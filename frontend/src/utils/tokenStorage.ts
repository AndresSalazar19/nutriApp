const TOKEN_KEY = 'nutria_token';

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const tokenStorage = {
  /** Devuelve el JWT almacenado, o null si no existe. */
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /** Guarda el JWT en localStorage. */
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /** Elimina el JWT de localStorage. */
  remove(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Retorna true si no hay token o si el campo `exp` del payload ya venció.
   * Se considera expirado 30 segundos antes para evitar race conditions.
   */
  isExpired(): boolean {
    const token = this.get();
    if (!token) return true;

    const payload = decodePayload(token);
    if (!payload || typeof payload.exp !== 'number') return true;

    const bufferMs = 30 * 1000;
    return payload.exp * 1000 - bufferMs < Date.now();
  },

  /** Decodifica y retorna el payload del JWT sin verificar firma. */
  getPayload(): Record<string, unknown> | null {
    const token = this.get();
    if (!token) return null;
    return decodePayload(token);
  },
};
