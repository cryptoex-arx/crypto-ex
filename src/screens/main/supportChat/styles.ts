import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  grow: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 10,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  mine: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirs: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  time: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typing: {
    marginTop: 4,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
