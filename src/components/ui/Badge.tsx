import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'success' | 'danger';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

/** Small status pill: Active, Triggered, Open, Paid, Pending. */
export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const theme = useTheme();

  const { backgroundColor, color } = {
    neutral: {
      backgroundColor: theme.colors.surfaceStrong,
      color: theme.colors.primary,
    },
    success: {
      backgroundColor: theme.colors.successSurface,
      color: theme.colors.success,
    },
    danger: {
      backgroundColor: theme.colors.dangerSurface,
      color: theme.colors.danger,
    },
  }[tone];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text variant="caption" style={[styles.label, { color }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  label: {
    fontFamily: fonts.semiBold,
  },
});
