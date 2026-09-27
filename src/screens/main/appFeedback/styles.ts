import { StyleSheet } from 'react-native';

import { fonts } from '../../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    textAlign: 'center',
    fontFamily: fonts.bold,
  },
  subtitle: {
    marginTop: 4,
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  textArea: {
    minHeight: 96,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  submit: {
    marginTop: 18,
  },
});
