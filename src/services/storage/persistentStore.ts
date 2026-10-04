import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../../utils/logger';

export interface PersistentStore<T> {
  /** Latest snapshot. A new object after every change, stable in between. */
  get: () => T;
  set: (next: T) => void;
  update: (recipe: (current: T) => T) => void;
  subscribe: (listener: () => void) => () => void;
  /** Restores the saved snapshot. Leaves the state alone if it already changed. */
  hydrate: () => Promise<void>;
  /** Back to the seed, and forgets the saved copy. */
  reset: () => void;
}

export interface PersistentStoreOptions<T> {
  /**
   * What to write to AsyncStorage. Leave secrets out here and keep them in
   * secure storage instead; they then start from the seed on hydrate.
   */
  serialize?: (state: T) => Partial<T>;
}

/**
 * A module-level snapshot store saved to AsyncStorage under `key`, read with
 * `useSyncExternalStore`. Saved data is merged over `seed`, so fields added in
 * a later version start from their seed value.
 */
export function createPersistentStore<T extends object>(
  key: string,
  seed: T,
  { serialize }: PersistentStoreOptions<T> = {},
): PersistentStore<T> {
  let state = seed;
  let dirty = false;
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach(listener => listener());

  const set = (next: T) => {
    if (next === state) {
      return;
    }
    state = next;
    dirty = true;
    emit();
    AsyncStorage.setItem(
      key,
      JSON.stringify(serialize ? serialize(next) : next),
    ).catch(error => logger.error('Failed to save ' + key, error));
  };

  return {
    get: () => state,
    set,
    update: recipe => set(recipe(state)),
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async hydrate() {
      try {
        const saved = await AsyncStorage.getItem(key);
        if (saved && !dirty) {
          state = { ...seed, ...(JSON.parse(saved) as Partial<T>) };
          emit();
        }
      } catch (error) {
        logger.error('Failed to load ' + key, error);
      }
    },
    reset() {
      state = seed;
      dirty = true;
      emit();
      AsyncStorage.removeItem(key).catch(error =>
        logger.error('Failed to clear ' + key, error),
      );
    },
  };
}
