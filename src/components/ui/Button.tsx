import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps
  extends Pick<PressableProps, 'onPress' | 'testID' | 'accessibilityLabel'> {
  label: string;
  variant?: ButtonVariant;
  /** Optional leading icon, e.g. the paper plane on "Share Invite Link". */
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  style,
  onPress,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';
  const contentColor = isPrimary
    ? theme.colors.textInverted
    : theme.colors.text;

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isPrimary
            ? pressed
              ? theme.colors.primaryPressed
              : theme.colors.primary
            : 'transparent',
          borderColor: isPrimary ? 'transparent' : theme.colors.border,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? theme.colors.textInverted : theme.colors.primary}
        />
      ) : (
        <>
          {icon ? <Icon name={icon} size={15} color={contentColor} /> : null}
          <Text variant="label" tone={isPrimary ? 'inverted' : 'default'}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
