import { logger } from '../utils/logger';
import { accountStore, hydrateAccount } from './account';
import { alertsStore, hydrateAlerts } from './alerts';
import { notificationsStore } from './notifications';
import { clearSecureStorage, wipeAfterReinstall } from './secureStorage';
import { hydrateSecurity, securityStore } from './security';
import { endSession, restoreSession } from './session';
import { settingsStore } from './settings';
import { hydrateUser, userStore } from './user';

/** Restores every saved store. Called once while the splash screen shows. */
export async function hydrateStores(): Promise<void> {
  // First, so nothing reads keychain items left over from a deleted install.
  await wipeAfterReinstall().catch(error =>
    logger.error('Failed to check for a fresh install', error),
  );
  await Promise.all([
    settingsStore.hydrate(),
    notificationsStore.hydrate(),
    hydrateSecurity(),
    hydrateUser(),
    restoreSession(),
  ]);
  // Account last: settling deposits may need the restored KYC state.
  await hydrateAccount();
  await hydrateAlerts();
}

/** Puts balances, orders, alerts and notifications back to the demo seed. */
export function resetDemoData() {
  accountStore.reset();
  alertsStore.reset();
  notificationsStore.reset();
}

/** Forgets everything saved on the device, e.g. when the account is closed. */
export function resetAllStores() {
  resetDemoData();
  securityStore.reset();
  settingsStore.reset();
  userStore.reset();
  endSession()
    .then(clearSecureStorage)
    .catch(error => logger.error('Failed to clear secure storage', error));
}
