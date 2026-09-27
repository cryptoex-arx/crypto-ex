import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  heroTitle: {
    marginTop: 12,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  heroBody: {
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 4,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  code: {
    flex: 1,
    fontSize: 17,
    letterSpacing: 2,
    fontFamily: fonts.semiBold,
  },
  copyButton: {
    minHeight: 40,
    paddingHorizontal: 14,
  },
  share: {
    marginTop: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  statValue: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.bold,
  },
  statLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
});
