import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  sectionLabel: {
    marginTop: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  grow: {
    flex: 1,
  },
  bold: {
    fontFamily: fonts.bold,
  },
  center: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  qr: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  secret: {
    marginVertical: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  codes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  code: {
    width: '50%',
    paddingVertical: 4,
    letterSpacing: 1,
  },
});
