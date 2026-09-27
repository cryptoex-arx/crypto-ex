import { StyleSheet, View } from 'react-native';

import { EMPTY_STATE_MESSAGE } from '../../constants/messages';
import { Text } from '../ui/Text';

export interface EmptyStateProps {
  title: string;
  message?: string;
}

export function EmptyState({
  title,
  message = EMPTY_STATE_MESSAGE,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text variant="subtitle" style={styles.title}>
        {title}
      </Text>
      <Text tone="muted" style={styles.message}>
        {message}
      </Text>
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
    textAlign: 'center',
  },
});
