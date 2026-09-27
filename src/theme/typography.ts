import type { TextStyle } from 'react-native';

import { fonts } from './fonts';

export type TypographyVariant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'label'
  | 'caption'
  | 'overline';

export const typography: Record<TypographyVariant, TextStyle> = {
  display: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: fonts.bold,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.semiBold,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.semiBold,
  },
  caption: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: fonts.regular,
  },
  overline: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.8,
  },
};
