import { StyleSheet } from 'react-native';

const MARK_SIZE = 64;

/** Ripples are absolutely positioned, so the wrapper has to carry their full size. */
const RIPPLE_SIZE = 168;

/** Ripples start just behind the mark and grow out to RIPPLE_SIZE. */
export const RIPPLE_START_SCALE = MARK_SIZE / RIPPLE_SIZE;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  rings: {
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    borderRadius: RIPPLE_SIZE / 2,
    borderWidth: 1.5,
  },
  mark: {
    width: MARK_SIZE,
    height: MARK_SIZE,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    marginTop: 8,
    fontSize: 26,
    lineHeight: 32,
  },
  tagline: {
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 2.5,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 28,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
