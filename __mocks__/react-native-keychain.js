/**
 * In-memory stand-in for the native keychain, which does not exist under
 * Jest. Jest picks this file up automatically for the package.
 *
 * Items live on `global` so they survive `jest.resetModules()`, the way the
 * real keychain survives an app restart. Tests can also set
 * `global.__keychainBiometry` (e.g. 'FaceID') and
 * `global.__keychainDenyBiometrics` to simulate the device.
 */
global.__keychainItems = global.__keychainItems || new Map();
const items = global.__keychainItems;

const serviceOf = options => (options && options.service) || 'default';

module.exports = {
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
    AFTER_FIRST_UNLOCK: 'AccessibleAfterFirstUnlock',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY:
      'AccessibleAfterFirstUnlockThisDeviceOnly',
  },
  ACCESS_CONTROL: {
    USER_PRESENCE: 'UserPresence',
    BIOMETRY_ANY: 'BiometryAny',
    BIOMETRY_CURRENT_SET: 'BiometryCurrentSet',
    DEVICE_PASSCODE: 'DevicePasscode',
  },
  STORAGE_TYPE: {
    AES_GCM_NO_AUTH: 'KeystoreAESGCM_NoAuth',
    AES_GCM: 'KeystoreAESGCM',
    RSA: 'KeystoreRSAECB',
  },
  BIOMETRY_TYPE: {
    TOUCH_ID: 'TouchID',
    FACE_ID: 'FaceID',
    OPTIC_ID: 'OpticID',
    FINGERPRINT: 'Fingerprint',
    FACE: 'Face',
    IRIS: 'Iris',
  },

  setGenericPassword: jest.fn(async (username, password, options) => {
    const service = serviceOf(options);
    items.set(service, {
      username,
      password,
      service,
      biometric: Boolean(options && options.accessControl),
    });
    return { service, storage: 'KeystoreAESGCM_NoAuth' };
  }),

  getGenericPassword: jest.fn(async options => {
    const item = items.get(serviceOf(options));
    if (!item) {
      return false;
    }
    if (item.biometric && global.__keychainDenyBiometrics) {
      throw new Error('User canceled the authentication');
    }
    return { ...item, storage: 'KeystoreAESGCM_NoAuth' };
  }),

  hasGenericPassword: jest.fn(async options => items.has(serviceOf(options))),

  resetGenericPassword: jest.fn(async options => {
    items.delete(serviceOf(options));
    return true;
  }),

  getSupportedBiometryType: jest.fn(
    async () => global.__keychainBiometry || null,
  ),
};
