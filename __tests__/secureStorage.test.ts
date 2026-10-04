/**
 * Login secrets (session, PIN hash, 2FA secret) live in the keychain, never in
 * AsyncStorage, and biometric unlock sits on top of the app PIN.
 */
type Security = typeof import('../src/services/security');
type Session = typeof import('../src/services/session');
type SecureStorage = typeof import('../src/services/secureStorage');

interface KeychainGlobals {
  __keychainItems?: Map<string, { username: string; password: string }>;
  __keychainBiometry?: string | null;
  __keychainDenyBiometrics?: boolean;
}

const device = globalThis as typeof globalThis & KeychainGlobals;

/** The AsyncStorage mock of the current module registry. */
function asyncStorage(): { __INTERNAL_MOCK_STORAGE__: Record<string, string> } {
  return require('@react-native-async-storage/async-storage');
}

const keychainItem = (service: string) => device.__keychainItems?.get(service);

async function flush() {
  for (let i = 0; i < 10; i += 1) {
    await Promise.resolve();
  }
}

/** A relaunch: fresh modules, AsyncStorage carried over, keychain kept. */
function relaunch() {
  const saved = { ...asyncStorage().__INTERNAL_MOCK_STORAGE__ };
  jest.resetModules();
  Object.assign(asyncStorage().__INTERNAL_MOCK_STORAGE__, saved);
}

beforeEach(() => {
  jest.resetModules();
  device.__keychainItems?.clear();
  device.__keychainBiometry = null;
  device.__keychainDenyBiometrics = false;
});

describe('secrets', () => {
  test('PIN and 2FA secrets go to the keychain, not AsyncStorage', async () => {
    const security: Security = require('../src/services/security');
    const { generateSecret, totp } = require('../src/utils/totp');
    await security.hydrateSecurity();

    security.setPin('2580');
    const secret = generateSecret();
    expect(security.enableTwoFactor(secret, totp(secret)).ok).toBe(true);
    await flush();

    const stored = JSON.parse(keychainItem('cryptoex.secrets')!.password);
    expect(stored.pinHash).toMatch(/^[0-9a-f]{40}$/);
    expect(stored.twoFactor.secret).toBe(secret);

    const plain =
      asyncStorage().__INTERNAL_MOCK_STORAGE__['cryptoex/security/v2'];
    expect(plain).toBeDefined();
    expect(plain).not.toContain('pinHash');
    expect(plain).not.toContain(secret);
  });

  test('secrets come back on the next launch', async () => {
    const security: Security = require('../src/services/security');
    await security.hydrateSecurity();
    security.setPin('2580');
    await flush();

    relaunch();
    const relaunched: Security = require('../src/services/security');
    expect(relaunched.verifyPin('2580')).toBe(false);
    await relaunched.hydrateSecurity();
    expect(relaunched.verifyPin('2580')).toBe(true);
    expect(relaunched.verifyPin('1111')).toBe(false);
  });

  test('removing every secret clears the keychain item', async () => {
    const security: Security = require('../src/services/security');
    await security.hydrateSecurity();
    security.setPin('2580');
    await flush();
    expect(keychainItem('cryptoex.secrets')).toBeDefined();

    security.removePin();
    await flush();
    expect(keychainItem('cryptoex.secrets')).toBeUndefined();
  });

  test('the old plain-text v1 security entry is deleted', async () => {
    asyncStorage().__INTERNAL_MOCK_STORAGE__['cryptoex/security/v1'] =
      '{"pinHash":"abc"}';
    const security: Security = require('../src/services/security');
    await security.hydrateSecurity();
    await flush();
    expect(
      asyncStorage().__INTERNAL_MOCK_STORAGE__['cryptoex/security/v1'],
    ).toBeUndefined();
  });
});

describe('session', () => {
  test('survives restarts in the keychain and ends on sign-out', async () => {
    const session: Session = require('../src/services/session');
    await session.startSession('9876543210');
    expect(keychainItem('cryptoex.session')?.username).toBe('9876543210');

    relaunch();
    const relaunched: Session = require('../src/services/session');
    expect(relaunched.getSession()).toBeUndefined();
    const restored = await relaunched.restoreSession();
    expect(restored).toMatchObject({ mobileNumber: '9876543210' });
    expect(restored?.token).toMatch(/^[0-9a-f]{32}$/);

    await relaunched.endSession();
    expect(keychainItem('cryptoex.session')).toBeUndefined();
    expect(await relaunched.restoreSession()).toBeUndefined();
  });

  test('a fresh install clears keychain items left behind', async () => {
    // iOS keeps keychain items after the app is deleted; AsyncStorage goes.
    const session: Session = require('../src/services/session');
    await session.startSession('9876543210');
    jest.resetModules();

    const secure: SecureStorage = require('../src/services/secureStorage');
    await secure.wipeAfterReinstall();
    expect(keychainItem('cryptoex.session')).toBeUndefined();

    // Later launches of the same install keep what they saved.
    const relaunchedSession: Session = require('../src/services/session');
    await relaunchedSession.startSession('9876543210');
    await secure.wipeAfterReinstall();
    expect(keychainItem('cryptoex.session')).toBeDefined();
  });
});

describe('biometric unlock', () => {
  async function withPin(): Promise<Security> {
    const security: Security = require('../src/services/security');
    await security.hydrateSecurity();
    security.setPin('2580');
    return security;
  }

  test('needs a PIN and a device with biometrics', async () => {
    const security: Security = require('../src/services/security');
    await security.hydrateSecurity();
    expect(await security.enableBiometrics()).toMatchObject({ ok: false });

    security.setPin('2580');
    expect(await security.enableBiometrics()).toEqual({
      ok: false,
      error: 'No Face ID or fingerprint is set up on this device.',
    });

    device.__keychainBiometry = 'FaceID';
    expect(await security.enableBiometrics()).toEqual({ ok: true });
    expect(security.securityStore.get().biometricEnabled).toBe(true);
    expect(keychainItem('cryptoex.biometric')).toBeDefined();
    expect(security.biometryLabel('FaceID' as never)).toBe('Face ID');
  });

  test('a cancelled setup leaves it off', async () => {
    const security = await withPin();
    device.__keychainBiometry = 'FaceID';
    device.__keychainDenyBiometrics = true;
    expect(await security.enableBiometrics()).toMatchObject({ ok: false });
    expect(security.securityStore.get().biometricEnabled).toBe(false);
    expect(keychainItem('cryptoex.biometric')).toBeUndefined();
  });

  test('unlocks, falls back on cancel, turns off when the key is gone', async () => {
    const security = await withPin();
    device.__keychainBiometry = 'Fingerprint';
    await security.enableBiometrics();

    expect(await security.unlockWithBiometrics()).toBe('success');

    device.__keychainDenyBiometrics = true;
    expect(await security.unlockWithBiometrics()).toBe('cancelled');
    expect(security.securityStore.get().biometricEnabled).toBe(true);

    // Enrolling a new fingerprint invalidates the key.
    device.__keychainDenyBiometrics = false;
    device.__keychainItems?.delete('cryptoex.biometric');
    expect(await security.unlockWithBiometrics()).toBe('unavailable');
    expect(security.securityStore.get().biometricEnabled).toBe(false);
  });

  test('removing the PIN turns biometrics off', async () => {
    const security = await withPin();
    device.__keychainBiometry = 'FaceID';
    await security.enableBiometrics();

    security.removePin();
    await flush();
    expect(security.securityStore.get().biometricEnabled).toBe(false);
    expect(keychainItem('cryptoex.biometric')).toBeUndefined();
  });

  test('turns itself off on launch if its key disappeared', async () => {
    const security = await withPin();
    device.__keychainBiometry = 'FaceID';
    await security.enableBiometrics();
    await flush();
    device.__keychainItems?.delete('cryptoex.biometric');

    relaunch();
    const relaunched: Security = require('../src/services/security');
    await relaunched.hydrateSecurity();
    expect(relaunched.securityStore.get().pinHash).toBeDefined();
    expect(relaunched.securityStore.get().biometricEnabled).toBe(false);
  });
});
