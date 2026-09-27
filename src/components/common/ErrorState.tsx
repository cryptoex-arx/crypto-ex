import { StyleSheet, View } from 'react-native';

import { ERROR_MESSAGES } from '../../constants/messages';
import { Button } from '../ui/Button';
import { Text } from '../ui/Text';

export interface ErrorStateProps {
  title?: string;
  /** Must already be user-facing copy — never a raw error message. */
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = ERROR_MESSAGES.unknown,
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text variant="subtitle" style={styles.title}>
        {title}
      </Text>
      <Text tone="muted" style={styles.message}>
        {message}
      </Text>
      {onRetry ? (
        <Button label={retryLabel} variant="secondary" onPress={onRetry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
});
