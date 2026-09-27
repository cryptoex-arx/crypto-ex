import { type PropsWithChildren, useMemo, useReducer } from 'react';

import { AppStateContext } from './appStateContext';
import type { AppAction, AppState } from './types';

const initialState: AppState = {
  isSignedIn: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'session/signIn':
      return state.isSignedIn ? state : { ...state, isSignedIn: true };
    case 'session/signOut':
      return state.isSignedIn ? { ...state, isSignedIn: false } : state;
  }
}

/**
 * Holds application-level state with React's own primitives.
 * A state-management library should only be introduced if this stops scaling.
 */
export function AppStateProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}
