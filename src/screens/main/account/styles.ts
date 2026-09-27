import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBody: {
    flex: 1,
  },
  profileName: {
    fontFamily: fonts.bold,
  },
  profileContact: {
    marginTop: 2,
    lineHeight: 18,
  },
  editButton: {
    minHeight: 40,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  kycLabel: {
    flex: 1,
    fontFamily: fonts.bold,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    marginLeft: 4,
  },
  rowTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 10,
  },
  logoutLabel: {
    fontFamily: fonts.bold,
  },
  version: {
    textAlign: 'center',
  },
});
