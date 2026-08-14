/**
 * Simple storage layer abstraction compatible with React Native & Web
 */
const MEMORY_STORAGE: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const g = typeof globalThis !== 'undefined' ? (globalThis as any) : null;
      if (g && g.localStorage) {
        return g.localStorage.getItem(key);
      }
      return MEMORY_STORAGE[key] || null;
    } catch {
      return MEMORY_STORAGE[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      const g = typeof globalThis !== 'undefined' ? (globalThis as any) : null;
      if (g && g.localStorage) {
        g.localStorage.setItem(key, value);
      }
      MEMORY_STORAGE[key] = value;
    } catch {
      MEMORY_STORAGE[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const g = typeof globalThis !== 'undefined' ? (globalThis as any) : null;
      if (g && g.localStorage) {
        g.localStorage.removeItem(key);
      }
      delete MEMORY_STORAGE[key];
    } catch {
      delete MEMORY_STORAGE[key];
    }
  },
};
