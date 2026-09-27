import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    marginTop: 12,
    fontFamily: fonts.bold,
  },
  heroMeta: {
    marginTop: 2,
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 12,
    marginLeft: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
