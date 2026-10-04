import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import { Icon } from '../../components/ui/Icon';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { useTheme } from '../../hooks/useTheme';
import { RIPPLE_START_SCALE, styles } from './styles';

const SPLASH_DURATION_MS = 1800;
const DOT_COUNT = 3;
const DOT_DELAY_MS = 160;
const RIPPLE_COUNT = 3;
const RIPPLE_DURATION_MS = 2400;

export interface SplashScreenProps {
  /** Called once the branded hold is over and the app can render. */
  onFinish: () => void;
}

function useDotAnimation() {
  const values = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * DOT_DELAY_MS),
          Animated.timing(value, {
            toValue: 1,
            duration: 360,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 360,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay((DOT_COUNT - index) * DOT_DELAY_MS),
        ]),
      ),
    );

    animations.forEach(animation => animation.start());

    return () => animations.forEach(animation => animation.stop());
  }, [values]);

  return values;
}

/** Rings expand outward from the mark and fade, staggered so one is always in flight. */
function useRippleAnimation() {
  const values = useRef(
    Array.from({ length: RIPPLE_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = values.map((value, index) =>
      Animated.sequence([
        Animated.delay((index * RIPPLE_DURATION_MS) / RIPPLE_COUNT),
        Animated.loop(
          Animated.timing(value, {
            toValue: 1,
            duration: RIPPLE_DURATION_MS,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
      ]),
    );

    animations.forEach(animation => animation.start());

    return () => animations.forEach(animation => animation.stop());
  }, [values]);

  return values;
}

/** Branded launch screen shown while the app boots. */
export function SplashScreen({ onFinish }: SplashScreenProps) {
  const theme = useTheme();
  const dots = useDotAnimation();
  const ripples = useRippleAnimation();

  useEffect(() => {
    const timeout = setTimeout(onFinish, SPLASH_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [onFinish]);

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} style={styles.container}>
      <View style={styles.rings}>
        {ripples.map((value, index) => (
          <Animated.View
            key={index}
            style={[
              styles.ripple,
              {
                borderColor: theme.colors.primary,
                opacity: value.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 0],
                }),
                transform: [
                  {
                    scale: value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [RIPPLE_START_SCALE, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
        <View style={[styles.mark, { backgroundColor: theme.colors.primary }]}>
          <Icon name="trending-up" size={26} color={theme.colors.success} />
        </View>
      </View>

      <Text variant="display" tone="primary" style={styles.wordmark}>
        CryptoEx
      </Text>
      <Text variant="overline" tone="muted" style={styles.tagline}>
        TRADE. INVEST. GROW.
      </Text>

      <View style={styles.dots}>
        {dots.map((value, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: theme.colors.primary,
                transform: [
                  {
                    translateY: value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -6],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </Screen>
  );
}
