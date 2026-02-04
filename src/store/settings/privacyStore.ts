import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'balance_visibility';

type Snapshot = {
  isVisible: boolean;
};

let isVisible = false;

const listeners = new Set<() => void>();

let snapshot: Snapshot = { isVisible: false };

/* =========================
   Hydration
   ========================= */
(async () => {
  const stored = await AsyncStorage.getItem(KEY);
  if (stored !== null) {
    isVisible = stored === 'true';
    snapshot = { isVisible };
    listeners.forEach(l => l());
  }
})();

export const privacyStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return snapshot;   // ✅ cached object
  },

  async toggle() {
    isVisible = !isVisible;
    await AsyncStorage.setItem(KEY, String(isVisible));

    snapshot = { isVisible };  // ✅ update snapshot here
    listeners.forEach(l => l());
  },
};
