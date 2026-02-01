import AsyncStorage from '@react-native-async-storage/async-storage';
import { ensureSalaryTransaction } from '../finance/ensureSalaryTransaction';

const SALARY_KEY = 'settings.salary';

let salary = 0;
const listeners = new Set<() => void>();

export async function loadSettings() {
  const raw = await AsyncStorage.getItem(SALARY_KEY);
  salary = raw ? Number(raw) : 0;
}

export function getSalary() {
  return salary;
}

/* 🔔 subscription (same pattern as ExpenseStore) */
export function subscribeSettings(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  for (const l of listeners) l();
}

export async function setSalary(value: number) {
  salary = value;
  await AsyncStorage.setItem(SALARY_KEY, String(value));
  emit(); // 🔥 notify subscribers
  ensureSalaryTransaction();
}
