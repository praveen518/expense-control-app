import AsyncStorage from '@react-native-async-storage/async-storage';

const SALARY_KEY = 'settings.salary';

/**
 * NOTE:
 * Salary here is a LEGACY user setting.
 * Real money flow lives in TransactionStore.
 */

let salary = 0;
const listeners = new Set<() => void>();

/* =========================
   Hydration
   ========================= */

export async function loadSettings() {
  const raw = await AsyncStorage.getItem(SALARY_KEY);
  salary = raw ? Number(raw) : 0;
}

/* =========================
   Read
   ========================= */

export function getSalary() {
  return salary;
}

/* =========================
   Subscription
   ========================= */

export function subscribeSettings(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  for (const l of listeners) l();
}

/* =========================
   Write
   ========================= */

export async function setSalary(value: number) {
  // Keep this minimal and side-effect free.
  salary = value;

  await AsyncStorage.setItem(
    SALARY_KEY,
    String(value)
  );

  emit();
}
