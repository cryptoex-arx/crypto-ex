import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  ticker: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  tickerCell: {
    flex: 1,
    paddingHorizontal: 12,
  },
  tickerDivider: {
    borderLeftWidth: 1,
  },
  tickerValue: {
    marginTop: 2,
    fontFamily: fonts.bold,
  },
  segments: {
    marginTop: 16,
  },
  sides: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  sideButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  sideLabel: {
    fontFamily: fonts.bold,
  },
  fieldLabel: {
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  selectValue: {
    fontFamily: fonts.bold,
  },
  selectHint: {
    flex: 1,
  },
  summary: {
    marginTop: 16,
  },
  tickerCard: {
    marginTop: 12,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 4,
  },
  grow: {
    flex: 1,
  },
  bold: {
    fontFamily: fonts.bold,
  },
  percent: {
    marginTop: 8,
  },
  targets: {
    flexDirection: 'row',
    gap: 10,
  },
  submit: {
    marginTop: 16,
    minHeight: 46,
  },
  tabs: {
    marginTop: 24,
    marginBottom: 12,
  },
  positionCard: {
    marginBottom: 10,
  },
  positionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  closeButton: {
    marginTop: 10,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  divider: {
    borderBottomWidth: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 12,
  },
  stepButton: {
    width: 56,
  },
  stepValue: {
    minWidth: 72,
    textAlign: 'center',
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  warning: {
    marginTop: 10,
  },
});
