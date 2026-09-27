import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { Text, type TextTone } from './Text';

export interface InfoBannerProps {
  message: string;
  icon?: IconName;
  tone?: TextTone;
  /** Colour of the icon and text — defaults to the muted body tone. */
  color?: string;
}

/** Explanatory strip shown above or below the content of many screens. */
export function InfoBanner({
  message,
  icon = 'alert-circle',
  tone = 'muted',
  color,
}: InfoBannerProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Icon name={icon} size={14} color={color ?? theme.colors.textMuted} />
      <Text
        variant="caption"
        tone={color ? undefined : tone}
        style={[styles.message, color ? { color } : null]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  message: {
    flex: 1,
    lineHeight: 16,
  },
});
