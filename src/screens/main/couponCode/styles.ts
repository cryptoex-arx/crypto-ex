import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  hero: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    marginTop: 16,
    fontFamily: fonts.bold,
  },
  heroSubtitle: {
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  field: {
    flex: 1,
  },
  applyButton: {
    minWidth: 96,
    minHeight: 40,
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  useLabel: {
    fontFamily: fonts.bold,
  },
});
