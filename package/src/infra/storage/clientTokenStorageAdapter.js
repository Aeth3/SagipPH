import { asyncStorageAdapter } from "./asyncStorageAdapter";
import * as Keychain from "react-native-keychain";

// Dedicated adapter for client-token persistence.
// Uses Keychain/Keystore first, then falls back to AsyncStorage.
const CLIENT_TOKEN_SERVICE = "sagipph.client_token";
const CLIENT_TOKEN_ACCOUNT = "client_token";

export const clientTokenStorageAdapter = {
  getItem: async (key) => {
    if (key !== CLIENT_TOKEN_ACCOUNT) return asyncStorageAdapter.getItem(key);

    try {
      const creds = await Keychain.getGenericPassword({ service: CLIENT_TOKEN_SERVICE });
      if (creds?.password) return creds.password;
    } catch (error) {
      // Fall through to AsyncStorage fallback.
    }

    return asyncStorageAdapter.getItem(key);
  },
  setItem: async (key, value) => {
    if (key !== CLIENT_TOKEN_ACCOUNT) {
      await asyncStorageAdapter.setItem(key, value);
      return;
    }

    try {
      await Keychain.setGenericPassword(CLIENT_TOKEN_ACCOUNT, value, {
        service: CLIENT_TOKEN_SERVICE,
      });
      return;
    } catch (error) {
      // Fall through to AsyncStorage fallback.
    }

    await asyncStorageAdapter.setItem(key, value);
  },
  removeItem: async (key) => {
    if (key !== CLIENT_TOKEN_ACCOUNT) {
      await asyncStorageAdapter.removeItem(key);
      return;
    }

    try {
      await Keychain.resetGenericPassword({ service: CLIENT_TOKEN_SERVICE });
    } catch (error) {
      // Fall through to AsyncStorage fallback.
    }

    await asyncStorageAdapter.removeItem(key);
  },
};
