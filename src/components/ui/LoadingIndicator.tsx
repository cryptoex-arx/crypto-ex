import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

export interface LoadingIndicatorProps {
  label?: string;
  /** Fills the available space and centres the spinner. */
  fullScreen?: boolean;
}

export function LoadingIndicator({
  label,
  fullScreen = false,
}: LoadingIndicatorProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator color={theme.colors.primary} />
      {label ? (
        <Text variant="caption" tone="muted" style={styles.label}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fullScreen: {
    flex: 1,
  },
  label: {
    marginTop: 8,
  },
});
