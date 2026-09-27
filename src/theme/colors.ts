export type ColorSchemeName = 'light' | 'dark';

export interface ColorPalette {
  background: string;
  /** Card / field fill. */
  surface: string;
  /** Icon tiles, segmented-control tracks — one step above `surface`. */
  surfaceStrong: string;
  border: string;
  text: string;
  textMuted: string;
  textInverted: string;
  primary: string;
  primaryPressed: string;
  danger: string;
  /** Tinted background for destructive badges and buttons. */
  dangerSurface: string;
  success: string;
  /** Tinted background for positive badges. */
  successSurface: string;
  disabled: string;
}

const lightColors: ColorPalette = {
  background: '#FFFFFF',
  surface: '#F7F9FC',
  surfaceStrong: '#E9EEF4',
  border: '#E8ECF2',
  text: '#0F1B2D',
  textMuted: '#8A94A6',
  textInverted: '#FFFFFF',
  primary: '#1B3A5F',
  primaryPressed: '#14304F',
  danger: '#EF4444',
  dangerSurface: '#FDECEC',
  success: '#00B37E',
  successSurface: '#E4F7F0',
  disabled: '#C3CAD4',
};

const darkColors: ColorPalette = {
  background: '#0E1116',
  surface: '#171B21',
  surfaceStrong: '#222831',
  border: '#2A2F37',
  text: '#E6EAEF',
  textMuted: '#98A2AD',
  textInverted: '#0E1116',
  primary: '#4C8DFF',
  primaryPressed: '#3B78E0',
  danger: '#F1707A',
  dangerSurface: '#2C1A1C',
  success: '#3FBF8F',
  successSurface: '#12291F',
  disabled: '#3A414A',
};

export const colors: Record<ColorSchemeName, ColorPalette> = {
  light: lightColors,
  dark: darkColors,
};
