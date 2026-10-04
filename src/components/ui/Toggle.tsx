import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  /** Shows the toggle dimmed and ignores taps, e.g. while a check runs. */
  busy?: boolean;
  accessibilityLabel?: string;
}

const TRACK_WIDTH = 40;
const TRACK_HEIGHT = 24;
const THUMB_SIZE = 18;
const INSET = (TRACK_HEIGHT - THUMB_SIZE) / 2;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - INSET * 2;

/**
 * The app's on/off switch: a slim track with a sliding thumb, in the theme
 * colours instead of the platform's stock switch.
 */
export function Toggle({
  value,
  onValueChange,
  disabled = false,
  busy = false,
  accessibilityLabel,
}: ToggleProps) {
  const theme = useTheme();
  const position = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inactive = disabled || busy;

  useEffect(() => {
    Animated.timing(position, {
      toValue: value ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [position, value]);

  const trackColor = position.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.surfaceStrong, theme.colors.primary],
  });
  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRAVEL],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: inactive, busy }}
      disabled={inactive}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      style={inactive && styles.inactive}
    >
      <Animated.View
        style={[
          styles.track,
          { backgroundColor: trackColor, borderColor: theme.colors.border },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: theme.colors.background,
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    padding: INSET,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  inactive: {
    opacity: 0.5,
  },
});
