import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { ThemeMode } from '../../themes/theme';
import { animateThemeChange } from '../../themes/themeAnimation';

const STORAGE_KEY = 'theme_mode';

let themeMode: ThemeMode = 'system';

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

export const themeStore = {
  getSnapshot: () => themeMode,

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setThemeMode: async (mode: ThemeMode) => {
    animateThemeChange();
    themeMode = mode;
    await AsyncStorage.setItem(STORAGE_KEY, mode);
    notify();
  },

  hydrate: async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      themeMode = stored;
      notify();
    }
  },
};

export const useThemeMode = () =>
  useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot
  );
