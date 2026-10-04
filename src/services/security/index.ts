import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { findNetwork, validateAddress } from '../../constants/networks';
import { sha1, toHex, utf8 } from '../../utils/hash';
import { logger } from '../../utils/logger';
import { verifyTotp } from '../../utils/totp';
import {
  type BiometricResult,
  type BiometryType,
  clearSecrets,
  createBiometricKey,
  deleteBiometricKey,
  getBiometryType,
  hasBiometricKey,
  loadSecrets,
  readBiometricKey,
  saveSecrets,
} from '../secureStorage';
import { createPersistentStore } from '../storage/persistentStore';

export interface WhitelistAddress {
  id: string;
  label: string;
  coinId: string;
  networkId: string;
  address: string;
  createdAt: number;
}

export interface ActivityEvent {
  id: string;
  title: string;
  detail: string;
  at: number;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  lastActiveAt: number;
  current: boolean;
}

export interface SecurityState {
  /** SHA-1 of the salted app PIN; unset means no PIN. Keychain only. */
  pinHash?: string;
  /** Keychain only. */
  twoFactor: {
    enabled: boolean;
    secret?: string;
    /** Unused one-time codes. */
    backupCodes: readonly string[];
  };
  /** Unlock with Face ID / fingerprint; the app PIN is the fallback. */
  biometricEnabled: boolean;
  antiPhishingCode?: string;
  whitelistEnabled: boolean;
  whitelist: readonly WhitelistAddress[];
  activity: readonly ActivityEvent[];
  devices: readonly Device[];
}

/** The fields kept in secure storage instead of AsyncStorage. */
type SecuritySecrets = Pick<SecurityState, 'pinHash' | 'twoFactor'>;

export type ActionResult = { ok: true } | { ok: false; error: string };

export type { BiometricResult, BiometryType };

export const PIN_LENGTH = 4;
/** Wrong PIN entries allowed before the lock screen signs the user out. */
export const MAX_PIN_ATTEMPTS = 5;
const BACKUP_CODE_COUNT = 8;
const MAX_ACTIVITY = 30;
/** v1 kept the PIN hash and 2FA secret in AsyncStorage; deleted on launch. */
const LEGACY_KEY = 'cryptoex/security/v1';

const now = Date.now();

export const securityStore = createPersistentStore<SecurityState>(
  'cryptoex/security/v2',
  {
    twoFactor: { enabled: false, backupCodes: [] },
    biometricEnabled: false,
    whitelistEnabled: false,
    whitelist: [],
    activity: [
      {
        id: 'seed-login',
        title: 'Signed in',
        detail: 'This device · Mumbai, IN',
        at: now - 86_400_000,
      },
    ],
    devices: [
      {
        id: 'this-device',
        name: 'This device',
        location: 'Mumbai, IN',
        lastActiveAt: now,
        current: true,
      },
      {
        id: 'chrome-windows',
        name: 'Chrome on Windows',
        location: 'Pune, IN',
        lastActiveAt: now - 3 * 86_400_000,
        current: false,
      },
    ],
  },
  {
    // Secrets go to the keychain (see `syncSecrets`), never to AsyncStorage;
    // JSON drops the undefined fields.
    serialize: state => ({
      ...state,
      pinHash: undefined,
      twoFactor: undefined,
    }),
  },
);

/** Set once `hydrateSecurity` has read the keychain; nothing is written before. */
let secretsLoaded = false;
/** Last secrets JSON written to the keychain, to skip identical writes. */
let savedSecrets = '';

function syncSecrets() {
  if (!secretsLoaded) {
    return;
  }
  const { pinHash, twoFactor } = securityStore.get();
  const secrets: SecuritySecrets = { pinHash, twoFactor };
  const json =
    pinHash !== undefined || twoFactor.enabled ? JSON.stringify(secrets) : '';
  if (json === savedSecrets) {
    return;
  }
  savedSecrets = json;
  (json ? saveSecrets(json) : clearSecrets()).catch(error =>
    logger.error('Failed to save security secrets', error),
  );
}

securityStore.subscribe(syncSecrets);

/**
 * Restores settings from AsyncStorage and secrets from the keychain, and turns
 * biometrics off if their key no longer exists (e.g. biometrics changed).
 */
export async function hydrateSecurity(): Promise<void> {
  AsyncStorage.removeItem(LEGACY_KEY).catch(error =>
    logger.warn('Failed to remove legacy security data', error),
  );
  await securityStore.hydrate();

  try {
    const json = await loadSecrets();
    savedSecrets = json ?? '';
    if (json) {
      const secrets = JSON.parse(json) as SecuritySecrets;
      securityStore.set({
        ...securityStore.get(),
        pinHash: secrets.pinHash,
        twoFactor: secrets.twoFactor,
      });
    }
  } catch (error) {
    logger.error('Failed to load security secrets', error);
  }
  secretsLoaded = true;

  const state = securityStore.get();
  if (
    state.biometricEnabled &&
    (!state.pinHash || !(await hasBiometricKey()))
  ) {
    securityStore.set({ ...securityStore.get(), biometricEnabled: false });
  }
}

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function hashPin(pin: string): string {
  return toHex(sha1(utf8('cryptoex-pin:' + pin)));
}

export function logActivity(title: string, detail: string) {
  securityStore.update(state => ({
    ...state,
    activity: [
      { id: newId(), title, detail, at: Date.now() },
      ...state.activity,
    ].slice(0, MAX_ACTIVITY),
  }));
}

export function setPin(pin: string): ActionResult {
  if (!new RegExp('^\\d{' + PIN_LENGTH + '}$').test(pin)) {
    return { ok: false, error: 'PIN must be ' + PIN_LENGTH + ' digits.' };
  }
  if (/^(\d)\1+$/.test(pin) || '0123456789'.includes(pin)) {
    return { ok: false, error: 'Avoid repeated or sequential digits.' };
  }
  const changed = securityStore.get().pinHash !== undefined;
  securityStore.update(state => ({ ...state, pinHash: hashPin(pin) }));
  logActivity(changed ? 'App PIN changed' : 'App PIN set', 'This device');
  return { ok: true };
}

export function verifyPin(pin: string): boolean {
  const { pinHash } = securityStore.get();
  return pinHash !== undefined && pinHash === hashPin(pin);
}

/** Removing the PIN also turns biometrics off: the PIN is their fallback. */
export function removePin() {
  if (securityStore.get().biometricEnabled) {
    disableBiometrics();
  }
  securityStore.update(state => ({ ...state, pinHash: undefined }));
  logActivity('App PIN removed', 'This device');
}

const BIOMETRY_LABELS: Record<BiometryType, string> = {
  TouchID: 'Touch ID',
  FaceID: 'Face ID',
  OpticID: 'Optic ID',
  Fingerprint: 'Fingerprint',
  Face: 'Face Unlock',
  Iris: 'Iris Unlock',
};

export function biometryLabel(type: BiometryType | undefined): string {
  return type ? BIOMETRY_LABELS[type] : 'Biometrics';
}

export { getBiometryType };

/**
 * Turns on biometric unlock: stores a key only a biometric check can read,
 * and makes the user pass that check once so a failing sensor is caught now.
 */
export async function enableBiometrics(): Promise<ActionResult> {
  if (!securityStore.get().pinHash) {
    return {
      ok: false,
      error: 'Set an app PIN first. It is the fallback if biometrics fail.',
    };
  }
  const type = await getBiometryType();
  if (!type) {
    return {
      ok: false,
      error: 'No Face ID or fingerprint is set up on this device.',
    };
  }

  try {
    // Android shows the biometric prompt while saving the key.
    await createBiometricKey();
  } catch (error) {
    logger.warn('Biometric setup failed', error);
    return { ok: false, error: 'Biometric check was cancelled.' };
  }
  // iOS only prompts when the key is read, so confirm it here.
  if (Platform.OS === 'ios' && (await readBiometricKey()) !== 'success') {
    await deleteBiometricKey().catch(() => undefined);
    return { ok: false, error: 'Biometric check was cancelled.' };
  }

  securityStore.update(state => ({ ...state, biometricEnabled: true }));
  logActivity(biometryLabel(type) + ' unlock turned on', 'This device');
  return { ok: true };
}

export function disableBiometrics() {
  securityStore.update(state => ({ ...state, biometricEnabled: false }));
  deleteBiometricKey().catch(error =>
    logger.warn('Failed to delete the biometric key', error),
  );
  logActivity('Biometric unlock turned off', 'This device');
}

/**
 * Shows the Face ID / fingerprint prompt. A key that has been invalidated
 * (biometrics changed on the device) turns biometric unlock off.
 */
export async function unlockWithBiometrics(): Promise<BiometricResult> {
  if (!securityStore.get().biometricEnabled) {
    return 'unavailable';
  }
  const result = await readBiometricKey();
  if (result === 'unavailable') {
    disableBiometrics();
  }
  return result;
}

function generateBackupCodes(): string[] {
  return Array.from({ length: BACKUP_CODE_COUNT }, () =>
    Math.random().toString(36).slice(2, 10).toUpperCase().padEnd(8, '0'),
  );
}

/** Turns on 2FA once the user proves their app holds `secret`. */
export function enableTwoFactor(secret: string, code: string): ActionResult {
  if (!verifyTotp(secret, code)) {
    return { ok: false, error: 'That code is wrong or expired. Try again.' };
  }
  securityStore.update(state => ({
    ...state,
    twoFactor: {
      enabled: true,
      secret,
      backupCodes: generateBackupCodes(),
    },
  }));
  logActivity('Google Authenticator enabled', 'This device');
  return { ok: true };
}

/**
 * Checks a 2FA code, accepting an authenticator code or an unused backup code
 * (which is then spent). Always true while 2FA is off.
 */
export function verifySecondFactor(code: string): boolean {
  const { twoFactor } = securityStore.get();
  if (!twoFactor.enabled || !twoFactor.secret) {
    return true;
  }
  const clean = code.trim().toUpperCase();
  if (verifyTotp(twoFactor.secret, clean)) {
    return true;
  }
  if (twoFactor.backupCodes.includes(clean)) {
    securityStore.update(state => ({
      ...state,
      twoFactor: {
        ...state.twoFactor,
        backupCodes: state.twoFactor.backupCodes.filter(item => item !== clean),
      },
    }));
    logActivity('Backup code used', 'This device');
    return true;
  }
  return false;
}

export function disableTwoFactor(code: string): ActionResult {
  if (!verifySecondFactor(code)) {
    return { ok: false, error: 'Enter a valid authenticator or backup code.' };
  }
  securityStore.update(state => ({
    ...state,
    twoFactor: { enabled: false, backupCodes: [] },
  }));
  logActivity('Google Authenticator disabled', 'This device');
  return { ok: true };
}

export function regenerateBackupCodes(code: string): ActionResult {
  if (!securityStore.get().twoFactor.enabled) {
    return { ok: false, error: 'Turn on Google Authenticator first.' };
  }
  if (!verifySecondFactor(code)) {
    return { ok: false, error: 'Enter a valid authenticator code.' };
  }
  securityStore.update(state => ({
    ...state,
    twoFactor: { ...state.twoFactor, backupCodes: generateBackupCodes() },
  }));
  return { ok: true };
}

export function setAntiPhishingCode(code: string): ActionResult {
  const clean = code.trim();
  if (!/^[A-Za-z0-9]{4,20}$/.test(clean)) {
    return {
      ok: false,
      error: 'Use 4 to 20 letters or digits, no spaces or symbols.',
    };
  }
  securityStore.update(state => ({ ...state, antiPhishingCode: clean }));
  logActivity('Anti-phishing code set', 'This device');
  return { ok: true };
}

export function setWhitelistEnabled(enabled: boolean) {
  securityStore.update(state => ({ ...state, whitelistEnabled: enabled }));
  logActivity(
    enabled ? 'Withdrawal whitelist on' : 'Withdrawal whitelist off',
    'This device',
  );
}

export function addWhitelistAddress(
  input: Omit<WhitelistAddress, 'id' | 'createdAt'>,
): ActionResult {
  const label = input.label.trim();
  const address = input.address.trim();
  if (label.length < 2) {
    return { ok: false, error: 'Give the address a label.' };
  }
  const network = findNetwork(input.coinId, input.networkId);
  if (!network) {
    return { ok: false, error: 'Choose a network.' };
  }
  const invalid = validateAddress(network, address);
  if (invalid) {
    return { ok: false, error: invalid };
  }
  if (
    securityStore
      .get()
      .whitelist.some(
        item => item.address === address && item.networkId === network.id,
      )
  ) {
    return { ok: false, error: 'This address is already whitelisted.' };
  }
  securityStore.update(state => ({
    ...state,
    whitelist: [
      ...state.whitelist,
      { ...input, label, address, id: newId(), createdAt: Date.now() },
    ],
  }));
  return { ok: true };
}

export function removeWhitelistAddress(id: string) {
  securityStore.update(state => ({
    ...state,
    whitelist: state.whitelist.filter(item => item.id !== id),
  }));
}

export function isWhitelisted(networkId: string, address: string): boolean {
  return securityStore
    .get()
    .whitelist.some(
      item => item.networkId === networkId && item.address === address.trim(),
    );
}

export function removeDevice(id: string) {
  securityStore.update(state => ({
    ...state,
    devices: state.devices.filter(device => device.current || device.id !== id),
  }));
  logActivity('Device removed', id);
}

export type SecurityLevel = 'Weak' | 'Medium' | 'Strong';

/** Rough score from the controls turned on. */
export function securityLevel(state: SecurityState): SecurityLevel {
  const score =
    (state.pinHash ? 1 : 0) +
    (state.twoFactor.enabled ? 2 : 0) +
    (state.antiPhishingCode ? 1 : 0) +
    (state.whitelistEnabled ? 1 : 0);
  if (score >= 4) {
    return 'Strong';
  }
  return score >= 2 ? 'Medium' : 'Weak';
}
