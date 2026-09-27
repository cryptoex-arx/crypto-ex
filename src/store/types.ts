import type { Dispatch } from 'react';

/**
 * Application-level state only — anything that belongs to a single screen
 * should stay in that screen's local state.
 */
export interface AppState {
  /** Placeholder session flag driving the root navigator. No auth logic yet. */
  isSignedIn: boolean;
}

export type AppAction =
  | { type: 'session/signIn' }
  | { type: 'session/signOut' };

export interface AppStateContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}
