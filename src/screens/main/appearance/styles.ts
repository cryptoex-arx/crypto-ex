import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  sectionLabel: {
    marginLeft: 4,
  },
  displayLabel: {
    marginTop: 12,
    marginLeft: 4,
  },
  themes: {
    flexDirection: 'row',
    gap: 10,
  },
  themeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 76,
    borderWidth: 1.5,
    borderRadius: 10,
  },
  themeLabel: {
    fontFamily: fonts.semiBold,
  },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    marginTop: 8,
  },
});
