import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segments: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  segmentLabel: {
    fontFamily: fonts.bold,
  },
  segmentSeparator: {
    width: 1,
    height: 18,
  },
  // Same width as the avatar so the segment toggle sits dead centre.
  bell: {
    width: 36,
    alignItems: 'flex-end',
  },
  bellDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pnlCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  pnlBody: {
    flex: 1,
  },
  pnlValue: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.bold,
  },
  pnlPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pnlPillLabel: {
    fontFamily: fonts.bold,
  },
  search: {
    marginTop: 14,
  },
  trending: {
    fontFamily: fonts.bold,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  quickActionTile: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  quickActionLabel: {
    textAlign: 'center',
  },
  fundingRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  fundingCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  fundingTile: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundingGlyph: {
    fontFamily: fonts.semiBold,
  },
  fundingTitle: {
    fontFamily: fonts.bold,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
  },
  sectionAction: {
    fontFamily: fonts.semiBold,
  },
  // Bleeds past the content padding so cards scroll edge to edge.
  carouselScroll: {
    marginHorizontal: -16,
  },
  carousel: {
    gap: 12,
    paddingHorizontal: 16,
  },
  basketCard: {
    width: 208,
    padding: 12,
  },
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackAvatar: {
    marginRight: -8,
  },
  stackMore: {
    marginLeft: 14,
  },
  basketName: {
    marginTop: 12,
    fontFamily: fonts.bold,
  },
  basketMeta: {
    marginTop: 2,
  },
  basketStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  basketChange: {
    fontFamily: fonts.bold,
  },
  investButton: {
    marginTop: 12,
    minHeight: 36,
    borderRadius: 8,
    borderWidth: 0,
  },
  pickCard: {
    width: 208,
    padding: 12,
  },
  pickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickSymbol: {
    flex: 1,
    fontFamily: fonts.bold,
  },
  pickMeta: {
    marginTop: 12,
  },
  pickEntry: {
    marginTop: 2,
  },
  pickValue: {
    fontFamily: fonts.semiBold,
  },
  pickExpected: {
    marginTop: 8,
    fontFamily: fonts.bold,
  },
});
