import * as SecureStore from 'expo-secure-store';

export type AuthStorageKey = 'accessToken' | 'refreshToken' | 'rememberedEmail';

export const storage = {
  async getItem(key: AuthStorageKey): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: AuthStorageKey, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },

  async removeItem(key: AuthStorageKey): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },

  async setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync('accessToken', accessToken, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      await SecureStore.setItemAsync('refreshToken', refreshToken, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      await Promise.allSettled([
        SecureStore.deleteItemAsync('accessToken'),
        SecureStore.deleteItemAsync('refreshToken'),
      ]);
      throw error;
    }
  },

  async clearAuthTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync('accessToken'),
      SecureStore.deleteItemAsync('refreshToken'),
    ]);
  },
};
