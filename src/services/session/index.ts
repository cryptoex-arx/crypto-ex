import { logger } from '../../utils/logger';
import {
  clearSession,
  loadSession,
  saveSession,
  type StoredSession,
} from '../secureStorage';

/**
 * The signed-in session, kept in the keychain so it survives restarts without
 * ever sitting in plain-text storage. The token is simulated until the auth
 * API exists; `startSession` is where its sign-in response will be stored.
 */
let current: StoredSession | undefined;

export function getSession(): StoredSession | undefined {
  return current;
}

/** Reads the saved session, if any. Called once while the splash shows. */
export async function restoreSession(): Promise<StoredSession | undefined> {
  try {
    current = await loadSession();
  } catch (error) {
    logger.error('Failed to read the saved session', error);
    current = undefined;
  }
  return current;
}

function newToken(): string {
  let token = '';
  while (token.length < 32) {
    token += Math.floor(Math.random() * 16).toString(16);
  }
  return token;
}

export async function startSession(mobileNumber: string): Promise<void> {
  current = { mobileNumber, token: newToken(), startedAt: Date.now() };
  await saveSession(current);
}

export async function endSession(): Promise<void> {
  current = undefined;
  await clearSession();
}
