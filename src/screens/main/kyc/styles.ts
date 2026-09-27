import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  statusBody: {
    flex: 1,
  },
  statusTitle: {
    fontFamily: fonts.bold,
  },
  statusSubtitle: {
    marginTop: 2,
  },
  limits: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  limit: {
    flex: 1,
    alignItems: 'center',
  },
  limitValue: {
    fontFamily: fonts.bold,
  },
  limitLabel: {
    marginTop: 2,
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 4,
  },
  stepMark: {
    backgroundColor: 'transparent',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  cta: {
    marginTop: 18,
  },
  footnote: {
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
