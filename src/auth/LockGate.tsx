// src/auth/LockGate.tsx
import React from 'react';
import { useSyncExternalStore } from 'react';
import { authLockStore } from './authLock.store';

import { SetPinScreen } from '../screens/SetPinScreen';
import { PinLockScreen } from '../screens/PinLockScreen';

export function LockGate({ children }: { children: React.ReactNode }) {
  const { unlocked, hasPin } = useSyncExternalStore(
    authLockStore.subscribe.bind(authLockStore),
    authLockStore.getSnapshot.bind(authLockStore)
  );

  if (!hasPin) {
    return <SetPinScreen />;
  }

  if (!unlocked) {
    return <PinLockScreen />;
  }

  return <>{children}</>;
}
