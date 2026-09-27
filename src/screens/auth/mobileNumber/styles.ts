import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  markLabel: {
    fontSize: 8,
    lineHeight: 10,
    fontFamily: fonts.bold,
  },
  wordmark: {
    fontFamily: fonts.bold,
  },
  title: {
    marginTop: 32,
    fontSize: 28,
    lineHeight: 36,
    fontFamily: fonts.bold,
  },
  subtitle: {
    marginTop: 4,
  },
  fieldLabel: {
    marginTop: 28,
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 96,
    minHeight: 42,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  flag: {
    fontSize: 15,
  },
  countryCode: {
    fontFamily: fonts.semiBold,
  },
  numberBox: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  input: {
    padding: 0,
    fontSize: 15,
    fontFamily: fonts.regular,
    letterSpacing: 0.5,
  },
  action: {
    marginTop: 12,
    minHeight: 42,
    borderRadius: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 8,
  },
  googleMark: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: '#4285F4',
  },
  googleLabel: {
    fontFamily: fonts.semiBold,
  },
  compliance: {
    marginTop: 20,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  complianceDivider: {
    borderBottomWidth: 1,
  },
  complianceLabel: {
    flex: 1,
    fontFamily: fonts.semiBold,
  },
  legal: {
    marginTop: 16,
    textAlign: 'center',
  },
  legalLink: {
    fontFamily: fonts.semiBold,
  },
});
