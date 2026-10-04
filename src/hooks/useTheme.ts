import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { settingsStore } from '../services/settings';
import type { ColorPalette, ColorSchemeName } from '../theme';
import { colors, typography } from '../theme';
import { useStore } from './useStore';

export interface Theme {
  scheme: ColorSchemeName;
  colors: ColorPalette;
  typography: typeof typography;
}

/**
 * Resolves the active theme from the Appearance preference, falling back to
 * the OS colour scheme for "System". Stable per scheme, so it is safe in
 * dependency arrays.
 */
export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const { theme: preference } = useStore(settingsStore);
  const scheme: ColorSchemeName =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  return useMemo(
    () => ({
      scheme,
      colors: colors[scheme],
      typography,
    }),
    [scheme],
  );
}
