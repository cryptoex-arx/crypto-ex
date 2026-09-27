import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  glyphTile: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontFamily: fonts.semiBold,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
