/**
 * Launch flow: a session saved in the keychain skips sign-in, and an app PIN
 * (also in the keychain) puts the lock screen in front of the app.
 */
import { sha1, toHex, utf8 } from '../src/utils/hash';

jest.useFakeTimers();
// Each test cold-loads the whole app; the first load alone takes seconds.
jest.setTimeout(30_000);
// Without a native layout pass the real provider renders nothing.
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

interface KeychainGlobals {
  __keychainItems?: Map<string, object>;
}
const device = globalThis as typeof globalThis & KeychainGlobals;

const LOCK_TEXT = 'Enter your 4-digit PIN to unlock CryptoEx';

function asyncStorage(): { __INTERNAL_MOCK_STORAGE__: Record<string, string> } {
  return require('@react-native-async-storage/async-storage');
}

/** Renders the app and waits past hydration and the splash screen. */
async function launch(): Promise<string> {
  // A cold start: fresh modules, so nothing carries over in memory. The
  // renderer comes from the same registry so it shares the app's React.
  const App = require('../src/App').default;
  const ReactTestRenderer: typeof import('react-test-renderer') = require('react-test-renderer');
  let renderer: import('react-test-renderer').ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  for (let round = 0; round < 3; round += 1) {
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(1000);
      for (let i = 0; i < 20; i += 1) {
        await Promise.resolve();
      }
    });
  }
  const tree = JSON.stringify(renderer!.toJSON());
  await ReactTestRenderer.act(async () => renderer!.unmount());
  return tree;
}

function saveSession() {
  device.__keychainItems!.set('cryptoex.session', {
    service: 'cryptoex.session',
    username: '9876543210',
    password: JSON.stringify({ token: 'abc', startedAt: 1 }),
  });
}

function savePin(pin: string) {
  device.__keychainItems!.set('cryptoex.secrets', {
    service: 'cryptoex.secrets',
    username: 'secrets',
    password: JSON.stringify({
      pinHash: toHex(sha1(utf8('cryptoex-pin:' + pin))),
      twoFactor: { enabled: false, backupCodes: [] },
    }),
  });
}

beforeEach(() => {
  jest.resetModules();
  device.__keychainItems?.clear();
  // Not a fresh install, so the keychain is kept.
  asyncStorage().__INTERNAL_MOCK_STORAGE__['cryptoex/installed/v1'] = '1';
});

test('without a saved session the sign-in screen shows', async () => {
  const tree = await launch();
  expect(tree).toContain('Continue');
  expect(tree).not.toContain(LOCK_TEXT);
});

test('a saved session with a PIN opens on the lock screen', async () => {
  saveSession();
  savePin('2580');
  const tree = await launch();
  expect(tree).toContain(LOCK_TEXT);
});

test('a saved session without a PIN goes straight into the app', async () => {
  saveSession();
  const tree = await launch();
  expect(tree).toContain("Today's PNL");
  expect(tree).not.toContain(LOCK_TEXT);
});

test('a fresh install ignores a session left in the keychain', async () => {
  saveSession();
  delete asyncStorage().__INTERNAL_MOCK_STORAGE__['cryptoex/installed/v1'];
  const tree = await launch();
  expect(tree).toContain('Continue');
  expect(device.__keychainItems!.has('cryptoex.session')).toBe(false);
});
