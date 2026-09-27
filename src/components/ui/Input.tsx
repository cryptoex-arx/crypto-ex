import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  /** Validation message shown under the field. */
  errorMessage?: string;
}

export function Input({ label, errorMessage, style, ...rest }: InputProps) {
  const theme = useTheme();
  const hasError = Boolean(errorMessage);

  return (
    <View style={styles.container}>
      {label ? (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        {...rest}
        accessibilityLabel={rest.accessibilityLabel ?? label}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          theme.typography.body,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
            borderColor: hasError ? theme.colors.danger : theme.colors.border,
          },
          style,
        ]}
      />
      {errorMessage ? (
        <Text variant="caption" tone="danger" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 4,
  },
  input: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  error: {
    marginTop: 4,
  },
});
