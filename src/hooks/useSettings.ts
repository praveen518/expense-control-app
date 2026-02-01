import { useSyncExternalStore } from 'react';
import { getSalary, subscribeSettings } from '../store/settingsStore';

export function useSalary() {
  return useSyncExternalStore(
    subscribeSettings,
    getSalary
  );
}
