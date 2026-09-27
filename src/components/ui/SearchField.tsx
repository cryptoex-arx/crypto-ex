import type { ReactNode } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';

export interface SearchFieldProps extends TextInputProps {
  /** Right-hand accessory, e.g. the trending pair shortcut on Home. */
  trailing?: ReactNode;
}

/** Rounded search box with a leading magnifier. */
export function SearchField({
  trailing,
  style,
  placeholder = 'Search',
  ...rest
}: SearchFieldProps) {
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
      <Icon name="search" size={15} color={theme.colors.textMuted} />
      <TextInput
        {...rest}
        accessibilityLabel={rest.accessibilityLabel ?? placeholder}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          theme.typography.body,
          { color: theme.colors.text },
          style,
        ]}
      />
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 38,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    padding: 0,
  },
});
