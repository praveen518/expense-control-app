import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'balance_visibility';

let isVisible = false;
const listeners = new Set<() => void>();

(async () => {
  const stored = await AsyncStorage.getItem(KEY);
  if (stored !== null) {
    isVisible = stored === 'true';
    listeners.forEach(l => l());
  }
})();

export const privacyStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return isVisible;
  },

  async toggle() {
    isVisible = !isVisible;
    await AsyncStorage.setItem(KEY, String(isVisible));
    listeners.forEach(l => l());
  },
};
