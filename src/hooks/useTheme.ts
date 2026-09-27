import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import type { ColorPalette, ColorSchemeName } from '../theme';
import { colors, typography } from '../theme';

export interface Theme {
  scheme: ColorSchemeName;
  colors: ColorPalette;
  typography: typeof typography;
}

/**
 * Resolves the active theme from the OS color scheme.
 * The returned object is stable per scheme, so it is safe in dependency arrays.
 */
export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const scheme: ColorSchemeName = systemScheme === 'dark' ? 'dark' : 'light';

  return useMemo(
    () => ({
      scheme,
      colors: colors[scheme],
      typography,
    }),
    [scheme],
  );
}
