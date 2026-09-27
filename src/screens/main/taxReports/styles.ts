import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  download: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  downloadLabel: {
    fontFamily: fonts.semiBold,
  },
  trailing: {
    alignItems: 'flex-end',
  },
});
