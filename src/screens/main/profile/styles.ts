import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  avatarBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 4,
  },
  fieldLabel: {
    marginBottom: 6,
    marginLeft: 4,
  },
  field: {
    marginBottom: 16,
  },
  readOnlyInput: {
    borderWidth: 1,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  genderOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  genderLabel: {
    fontFamily: fonts.semiBold,
  },
  banner: {
    marginTop: 4,
  },
  save: {
    marginTop: 18,
  },
  error: {
    marginTop: 8,
  },
});
