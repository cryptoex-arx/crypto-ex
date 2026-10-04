import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    flex: 1,
  },
  pair: {
    fontFamily: fonts.bold,
  },
  headerQuote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderBottomWidth: 1,
  },
  tab: {
    paddingTop: 10,
  },
  selectedTab: {
    fontFamily: fonts.bold,
  },
  tabIndicator: {
    height: 2,
    marginTop: 8,
    borderRadius: 1,
  },
  tabsSpacer: {
    flex: 1,
  },
  /** Cancels the content gutter so the chart runs edge to edge. */
  fullBleed: {
    marginHorizontal: -16,
  },
  topPanel: {
    paddingTop: 12,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  stat: {
    width: '50%',
  },
  statValue: {
    marginTop: 2,
    fontFamily: fonts.semiBold,
  },
  tradeRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  tradeCell: {
    flex: 1,
  },
  tradeRight: {
    textAlign: 'right',
  },
  sectionBreak: {
    height: 6,
    marginTop: 12,
    marginHorizontal: -16,
  },
  bottomPanel: {
    paddingTop: 12,
  },
  hidden: {
    display: 'none',
  },
  cancelRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  cancel: {
    minHeight: 32,
  },
  divider: {
    borderBottomWidth: 1,
  },
});
