import {
  DarkTheme,
  DefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';

import type { Theme } from '../hooks/useTheme';

/** Maps the app theme onto the shape React Navigation expects. */
export function toNavigationTheme(theme: Theme): NavigationTheme {
  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };
}
