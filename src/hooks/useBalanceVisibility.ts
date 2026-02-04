import { useSyncExternalStore } from 'react';
import { privacyStore } from '../store/settings/privacyStore';

export const useBalanceVisibility = () => {
  const snapshot = useSyncExternalStore(
    privacyStore.subscribe,
    privacyStore.getSnapshot
  );

  return snapshot.isVisible;
};
