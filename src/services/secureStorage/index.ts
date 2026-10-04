import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

/**
 * Login secrets live in the platform's secure storage — the iOS Keychain, or
 * on Android values encrypted with a hardware-backed Keystore key — instead of
 * AsyncStorage, which is plain text on disk. Items stay on this device: they
 * never sync to iCloud or restore onto a new phone.
 */

const SERVICES = {
  session: 'cryptoex.session',
  secrets: 'cryptoex.secrets',
  biometric: 'cryptoex.biometric',
} as const;

const ACCESSIBLE = Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY;

/** Written to AsyncStorage on the first launch of an install. */
const INSTALLED_KEY = 'cryptoex/installed/v1';

const BIOMETRIC_PROMPT: Keychain.AuthenticationPrompt = {
  title: 'Unlock CryptoEx',
  cancel: 'Use PIN',
};

export type BiometryType = Keychain.BIOMETRY_TYPE;

export interface StoredSession {
  mobileNumber: string;
  /** Simulated until the auth API issues real tokens. */
  token: string;
  startedAt: number;
}

async function readPassword(
  options: Keychain.GetOptions,
): Promise<Keychain.UserCredentials | undefined> {
  const credentials = await Keychain.getGenericPassword(options);
  return credentials === false ? undefined : credentials;
}

export async function saveSession(session: StoredSession): Promise<void> {
  await Keychain.setGenericPassword(
    session.mobileNumber,
    JSON.stringify({ token: session.token, startedAt: session.startedAt }),
    { service: SERVICES.session, accessible: ACCESSIBLE },
  );
}

export async function loadSession(): Promise<StoredSession | undefined> {
  const item = await readPassword({ service: SERVICES.session });
  if (!item) {
    return undefined;
  }
  try {
    const { token, startedAt } = JSON.parse(item.password);
    return { mobileNumber: item.username, token, startedAt };
  } catch {
    return undefined;
  }
}

export async function clearSession(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICES.session });
}

/** Opaque JSON owned by the security service: PIN hash and 2FA secrets. */
export async function saveSecrets(json: string): Promise<void> {
  await Keychain.setGenericPassword('secrets', json, {
    service: SERVICES.secrets,
    accessible: ACCESSIBLE,
  });
}

export async function loadSecrets(): Promise<string | undefined> {
  return (await readPassword({ service: SERVICES.secrets }))?.password;
}

export async function clearSecrets(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICES.secrets });
}

/** Face ID, Touch ID, fingerprint… or `undefined` when none is enrolled. */
export async function getBiometryType(): Promise<BiometryType | undefined> {
  try {
    return (await Keychain.getSupportedBiometryType()) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Stores a random key that only a biometric check can read back. Android
 * shows the biometric prompt while saving; iOS only when reading.
 */
export async function createBiometricKey(): Promise<void> {
  const key = Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  await Keychain.setGenericPassword('biometric', key, {
    service: SERVICES.biometric,
    accessible: ACCESSIBLE,
    // Enrolling a new fingerprint or face invalidates the key, like banking
    // apps do, so someone who adds their own biometrics can't get in.
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    authenticationPrompt: BIOMETRIC_PROMPT,
    storage: Keychain.STORAGE_TYPE.AES_GCM,
  });
}

/**
 * - `success`: the user passed the Face ID / fingerprint prompt.
 * - `cancelled`: they dismissed it or it failed; fall back to the PIN.
 * - `unavailable`: the key is gone or invalidated; biometrics must be set up
 *   again.
 */
export type BiometricResult = 'success' | 'cancelled' | 'unavailable';

/** Shows the system biometric prompt by reading the protected key. */
export async function readBiometricKey(): Promise<BiometricResult> {
  try {
    const item = await readPassword({
      service: SERVICES.biometric,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      authenticationPrompt: BIOMETRIC_PROMPT,
    });
    return item ? 'success' : 'unavailable';
  } catch (error) {
    return /invalidat/i.test(String(error)) ? 'unavailable' : 'cancelled';
  }
}

export async function hasBiometricKey(): Promise<boolean> {
  try {
    return await Keychain.hasGenericPassword({ service: SERVICES.biometric });
  } catch {
    return false;
  }
}

export async function deleteBiometricKey(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICES.biometric });
}

/** Removes every CryptoEx item from secure storage. */
export async function clearSecureStorage(): Promise<void> {
  await Promise.all(
    Object.values(SERVICES).map(service =>
      Keychain.resetGenericPassword({ service }),
    ),
  );
}

/**
 * iOS keeps Keychain items after the app is deleted, while AsyncStorage goes
 * with the app. On the first launch of a fresh install, clear secure storage
 * so an old session or PIN can't come back to life.
 */
export async function wipeAfterReinstall(): Promise<void> {
  if (await AsyncStorage.getItem(INSTALLED_KEY)) {
    return;
  }
  await clearSecureStorage();
  await AsyncStorage.setItem(INSTALLED_KEY, String(Date.now()));
}
