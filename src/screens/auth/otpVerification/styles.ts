import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: {
    marginTop: 16,
    fontSize: 30,
    lineHeight: 38,
    fontFamily: fonts.bold,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
  },
  subtitleNumber: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  codeWrapper: {
    marginTop: 28,
  },
  boxes: {
    flexDirection: 'row',
    gap: 10,
  },
  box: {
    flex: 1,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
  },
  digit: {
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  caret: {
    width: 2,
    height: 26,
    borderRadius: 1,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0,
  },
  action: {
    marginTop: 20,
    minHeight: 44,
    borderRadius: 8,
  },
  resend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  resendValue: {
    fontFamily: fonts.bold,
  },
  notice: {
    marginTop: 18,
  },
});
