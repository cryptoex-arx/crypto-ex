import { StyleSheet } from 'react-native';

import { fonts } from '../../theme';

/** Both rings are absolutely positioned, so the wrapper has to carry the size. */
const OUTER_RING_SIZE = 208;
const INNER_RING_SIZE = 172;

/** Absolute children ignore the safe-area padding, so the screen adds the inset. */
export const FOOTER_SPACING = 40;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  rings: {
    width: OUTER_RING_SIZE,
    height: OUTER_RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: OUTER_RING_SIZE,
    height: OUTER_RING_SIZE,
    borderRadius: OUTER_RING_SIZE / 2,
    borderWidth: 2,
  },
  innerRing: {
    position: 'absolute',
    width: INNER_RING_SIZE,
    height: INNER_RING_SIZE,
    borderRadius: INNER_RING_SIZE / 2,
    borderWidth: 1,
  },
  mark: {
    width: 88,
    height: 88,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  markLabel: {
    fontFamily: fonts.bold,
  },
  wordmark: {
    marginTop: 20,
    fontSize: 32,
    lineHeight: 40,
  },
  tagline: {
    marginTop: 6,
    fontSize: 14,
    letterSpacing: 3,
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 40,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    position: 'absolute',
    letterSpacing: 0.4,
  },
});
