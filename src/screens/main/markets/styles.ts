import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 14,
  },
  filters: {
    flexDirection: 'row',
    gap: 10,
  },
  // Mirrors `row` (padding, gap, avatar width) so headers sit over values.
  columns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  avatarColumn: {
    width: 30,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  coinColumn: {
    flex: 1,
  },
  coinName: {
    fontFamily: fonts.semiBold,
  },
  coinPair: {
    marginTop: 1,
  },
  priceColumn: {
    width: 96,
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  price: {
    fontFamily: fonts.bold,
  },
  changeColumn: {
    width: 72,
    alignItems: 'flex-end',
  },
  changeHeader: {
    width: 72,
    textAlign: 'right',
  },
  changePill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  changeLabel: {
    fontFamily: fonts.semiBold,
  },
  empty: {
    paddingTop: 40,
  },
});
