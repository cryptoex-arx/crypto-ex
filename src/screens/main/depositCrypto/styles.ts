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
  // QR codes need a light quiet zone to scan, in either theme.
  qr: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  address: {
    marginVertical: 8,
    textAlign: 'center',
  },
  testCard: {
    gap: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
});
