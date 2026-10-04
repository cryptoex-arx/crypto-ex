import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

/** Mirrors the lock screen (`screens/pinLock`) so both feel like one flow. */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  title: {
    marginTop: 16,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
  },
  steps: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
    marginBottom: 24,
  },
  step: {
    width: 18,
    height: 4,
    borderRadius: 2,
  },
  footer: {
    minHeight: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
