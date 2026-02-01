import { useSyncExternalStore } from 'react';
import { pocketStore } from '../store/pocket/pocketStore.instance';

export function usePockets() {
  return useSyncExternalStore(
    pocketStore.subscribe.bind(pocketStore),
    pocketStore.getSnapshot.bind(pocketStore)
  );
}
