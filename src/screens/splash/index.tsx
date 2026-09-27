import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/ui/Icon';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { useTheme } from '../../hooks/useTheme';
import { FOOTER_SPACING, styles } from './styles';

const SPLASH_DURATION_MS = 1800;
const DOT_COUNT = 3;
const DOT_DELAY_MS = 160;

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
            duration: 320,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 320,
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

/** Branded launch screen shown while the app boots. */
export function SplashScreen({ onFinish }: SplashScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dots = useDotAnimation();

  useEffect(() => {
    const timeout = setTimeout(onFinish, SPLASH_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [onFinish]);

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} style={styles.container}>
      <View style={styles.rings}>
        <View
          style={[
            styles.outerRing,
            { borderColor: theme.colors.surfaceStrong },
          ]}
        />
        <View
          style={[
            styles.innerRing,
            { borderColor: theme.colors.surfaceStrong },
          ]}
        />
        <View style={[styles.mark, { backgroundColor: theme.colors.primary }]}>
          <Icon name="trending-up" size={24} color={theme.colors.success} />
          <Text variant="label" tone="inverted" style={styles.markLabel}>
            CryptoEx
          </Text>
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
                      outputRange: [0, -10],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>

      <Text
        variant="caption"
        tone="muted"
        style={[styles.footer, { bottom: insets.bottom + FOOTER_SPACING }]}
      >
        Secured · FIU Registered · ISO 27001
      </Text>
    </Screen>
  );
}
