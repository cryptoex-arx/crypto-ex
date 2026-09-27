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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  summaryDivider: {
    borderBottomWidth: 1,
  },
  summaryValue: {
    fontFamily: fonts.bold,
  },
});
