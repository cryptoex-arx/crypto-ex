import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  balanceLabel: {
    marginLeft: 4,
  },
  balance: {
    marginTop: 4,
  },
  balanceAlt: {
    marginTop: 2,
  },
  change: {
    marginTop: 6,
    fontFamily: fonts.semiBold,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  actionGlyph: {
    fontFamily: fonts.semiBold,
  },
  actionLabel: {
    textAlign: 'center',
  },
  allocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
    padding: 14,
  },
  donut: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  donutTotal: {
    fontFamily: fonts.bold,
  },
  legend: {
    flex: 1,
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontFamily: fonts.semiBold,
  },
  assetsTitle: {
    marginTop: 18,
    marginBottom: 12,
    fontFamily: fonts.bold,
  },
});
