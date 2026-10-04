import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 14,
  },
  tabs: {
    flexDirection: 'row',
    gap: 20,
  },
  tab: {
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontFamily: fonts.bold,
  },
  filters: {
    flexDirection: 'row',
    gap: 10,
  },
  // Mirrors `row` (padding, gap) so headers sit over values.
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
  starColumn: {
    width: 16,
    alignItems: 'center',
  },
  alignRight: {
    textAlign: 'right',
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
  rowCompact: {
    paddingVertical: 6,
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
  pressed: {
    opacity: 0.6,
  },
});
