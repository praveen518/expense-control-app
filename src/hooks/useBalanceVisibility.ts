import { useSyncExternalStore } from 'react';
import { privacyStore } from '../store/settings/privacyStore';

export const useBalanceVisibility = () =>
  useSyncExternalStore(
    privacyStore.subscribe,
    privacyStore.getSnapshot
  );
