import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerRow: {
    paddingVertical: 12,
  },
  divider: {
    borderBottomWidth: 1,
  },
  tierColumn: {
    flex: 1.4,
  },
  valueColumn: {
    flex: 1,
  },
  tierName: {
    fontFamily: fonts.semiBold,
  },
  tierRange: {
    marginTop: 2,
  },
});
