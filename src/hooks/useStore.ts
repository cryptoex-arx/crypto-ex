import { useSyncExternalStore } from 'react';

import type { PersistentStore } from '../services/storage/persistentStore';

/** Subscribes a component to one of the app's persistent stores. */
export function useStore<T>(store: PersistentStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get);
}
