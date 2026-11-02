import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { SessionStorage } from './client';

const KEY = 'lnkshrt.mobile.session.v1';
// Browser preview sessions stay in memory. Native sessions use the device's secure store.
let previewSession: string | null = null;
export const sessionStorage: SessionStorage = {
  read: () => Platform.OS === 'web' ? Promise.resolve(previewSession) : SecureStore.getItemAsync(KEY),
  write: async value => {
    if (Platform.OS === 'web') previewSession = value;
    else await SecureStore.setItemAsync(KEY, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  },
  clear: async () => {
    if (Platform.OS === 'web') previewSession = null;
    else await SecureStore.deleteItemAsync(KEY);
  },
};
