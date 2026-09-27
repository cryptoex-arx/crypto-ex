import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import type { TypographyVariant } from '../../theme';

export type TextTone =
  | 'default'
  | 'muted'
  | 'inverted'
  | 'danger'
  | 'success'
  | 'primary';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  tone?: TextTone;
}

export function Text({
  variant = 'body',
  tone = 'default',
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();

  const color = {
    default: theme.colors.text,
    muted: theme.colors.textMuted,
    inverted: theme.colors.textInverted,
    danger: theme.colors.danger,
    success: theme.colors.success,
    primary: theme.colors.primary,
  }[tone];

  return (
    <RNText {...rest} style={[theme.typography[variant], { color }, style]} />
  );
}
