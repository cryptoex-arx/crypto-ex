import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 42,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  addLabel: {
    fontFamily: fonts.semiBold,
  },
});
