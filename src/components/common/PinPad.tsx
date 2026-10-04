import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme';
import { Icon } from '../ui/Icon';
import { Text } from '../ui/Text';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

export interface PinPadProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  /** Shown under the dots in red. */
  error?: string;
}

/** PIN dots with an on-screen keypad, so the system keyboard never opens. */
export function PinPad({ length, value, onChange, error }: PinPadProps) {
  const theme = useTheme();
  const dotColor = error ? theme.colors.danger : theme.colors.primary;

  const onKey = (key: string) => {
    if (key === 'delete') {
      onChange(value.slice(0, -1));
    } else if (key && value.length < length) {
      onChange(value + key);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {Array.from({ length }, (_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { borderColor: dotColor },
              index < value.length && { backgroundColor: dotColor },
            ]}
          />
        ))}
      </View>
      <Text variant="caption" tone="danger" style={styles.error}>
        {error ?? ' '}
      </Text>

      <View style={styles.keys}>
        {KEYS.map((key, index) => (
          <Pressable
            key={key || 'blank-' + index}
            accessibilityRole="button"
            accessibilityLabel={key === 'delete' ? 'Delete' : key || undefined}
            disabled={!key}
            onPress={() => onKey(key)}
            style={({ pressed }) => [
              styles.key,
              pressed && key ? { backgroundColor: theme.colors.surface } : null,
            ]}
          >
            {key === 'delete' ? (
              <Icon name="delete" size={22} color={theme.colors.text} />
            ) : (
              <Text style={styles.keyLabel}>{key}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 18,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  error: {
    marginTop: 12,
    minHeight: 16,
  },
  keys: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 276,
    marginTop: 20,
  },
  key: {
    width: 92,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyLabel: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: fonts.semiBold,
  },
});
