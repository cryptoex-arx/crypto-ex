import { StyleSheet } from 'react-native';

import { fonts } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    marginTop: 16,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 28,
    textAlign: 'center',
  },
  biometric: {
    marginTop: 12,
    alignSelf: 'stretch',
  },
  forgot: {
    marginTop: 12,
  },
});
