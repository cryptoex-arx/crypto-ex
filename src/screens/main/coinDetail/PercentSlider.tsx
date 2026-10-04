import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../../hooks/useTheme';

const STOPS = [0, 0.25, 0.5, 0.75, 1] as const;

/** Width of each stop's touch target; the track runs between their centres. */
const STOP_WIDTH = 28;

export interface PercentSliderProps {
  /** Share of the maximum already entered, 0–1; fills the track. */
  value: number;
  /** Called with 0, 0.25, 0.5, 0.75 or 1. */
  onChange: (fraction: number) => void;
}

/** 0–100% track with five tap stops that fill an amount from a balance. */
export function PercentSlider({ value, onChange }: PercentSliderProps) {
  const theme = useTheme();
  const filled = Math.min(Math.max(value, 0), 1);

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${filled * 100}%`,
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      </View>
      <View style={styles.stops}>
        {STOPS.map(stop => {
          const active = filled >= stop - 1e-9;
          return (
            <Pressable
              key={stop}
              accessibilityRole="button"
              accessibilityLabel={stop * 100 + '% of available'}
              hitSlop={{ top: 8, bottom: 8 }}
              onPress={() => onChange(stop)}
              style={styles.stop}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: active
                      ? theme.colors.primary
                      : theme.colors.background,
                    borderColor: active
                      ? theme.colors.primary
                      : theme.colors.textMuted,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 24,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: STOP_WIDTH / 2,
    right: STOP_WIDTH / 2,
    height: 2,
    borderRadius: 1,
  },
  fill: {
    height: 2,
    borderRadius: 1,
  },
  stops: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stop: {
    width: STOP_WIDTH,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});
