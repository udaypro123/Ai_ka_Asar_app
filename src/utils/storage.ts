import * as Keychain from 'react-native-keychain';

export type AuthStorageKey = 'accessToken' | 'refreshToken' | 'rememberedEmail';

const keychainOptions = {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const storage = {
  async getItem(key: AuthStorageKey): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({ service: key });
    return credentials ? credentials.password : null;
  },

  async setItem(key: AuthStorageKey, value: string): Promise<void> {
    const stored = await Keychain.setGenericPassword(key, value, {
      ...keychainOptions,
      service: key,
    });
    if (!stored) throw new Error(`Could not securely store ${key}`);
  },

  async removeItem(key: AuthStorageKey): Promise<void> {
    await Keychain.resetGenericPassword({ service: key });
  },

  async setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await Promise.all([
        storage.setItem('accessToken', accessToken),
        storage.setItem('refreshToken', refreshToken),
      ]);
    } catch (error) {
      await Promise.allSettled([
        storage.removeItem('accessToken'),
        storage.removeItem('refreshToken'),
      ]);
      throw error;
    }
  },

  async clearAuthTokens(): Promise<void> {
    await Promise.all([
      storage.removeItem('accessToken'),
      storage.removeItem('refreshToken'),
    ]);
  },
};
