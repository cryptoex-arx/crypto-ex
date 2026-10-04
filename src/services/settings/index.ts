import { createPersistentStore } from '../storage/persistentStore';

export type ThemePreference = 'light' | 'dark' | 'system';
export type BaseCurrency = 'INR' | 'USDT';

export interface SettingsState {
  theme: ThemePreference;
  baseCurrency: BaseCurrency;
  /** Tighter rows on the Markets list. */
  compactList: boolean;
  /** Masks balances on Home and Portfolio. */
  hideBalances: boolean;
}

export const settingsStore = createPersistentStore<SettingsState>(
  'cryptoex/settings/v1',
  {
    theme: 'system',
    baseCurrency: 'INR',
    compactList: false,
    hideBalances: false,
  },
);

export function updateSettings(patch: Partial<SettingsState>) {
  settingsStore.update(state => ({ ...state, ...patch }));
}
