import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { Text } from './Text';

export interface SegmentedOption<Value extends string> {
  value: Value;
  label: string;
  icon?: IconName;
}

export interface SegmentedControlProps<Value extends string> {
  options: readonly SegmentedOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  /** `track` is the filled pill group, `outline` the bordered button pair. */
  variant?: 'track' | 'outline';
}

/** Tab switcher used for report types, fee types, order states and alerts. */
export function SegmentedControl<Value extends string>({
  options,
  value,
  onChange,
  variant = 'track',
}: SegmentedControlProps<Value>) {
  const theme = useTheme();
  const isTrack = variant === 'track';

  return (
    <View
      style={[
        styles.container,
        isTrack && [
          styles.track,
          { backgroundColor: theme.colors.surfaceStrong },
        ],
      ]}
    >
      {options.map(option => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              isTrack
                ? selected && {
                    backgroundColor: theme.colors.background,
                    ...styles.selectedTrackSegment,
                  }
                : [
                    styles.outlineSegment,
                    {
                      backgroundColor: selected
                        ? theme.colors.surface
                        : theme.colors.background,
                      borderColor: selected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ],
            ]}
          >
            {option.icon ? (
              <Icon
                name={option.icon}
                size={14}
                color={selected ? theme.colors.primary : theme.colors.textMuted}
              />
            ) : null}
            <Text
              variant="label"
              tone={selected ? 'default' : 'muted'}
              style={selected ? styles.selectedLabel : undefined}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
  },
  track: {
    gap: 0,
    borderRadius: 8,
    padding: 3,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 30,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  outlineSegment: {
    borderWidth: 1,
    borderRadius: 8,
  },
  selectedTrackSegment: {
    shadowColor: '#0F1B2D',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  selectedLabel: {
    fontFamily: fonts.bold,
  },
});
