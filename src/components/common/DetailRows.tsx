import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme';
import { Text, type TextTone } from '../ui/Text';

export interface DetailRow {
  label: string;
  value: string;
  tone?: TextTone;
}

export interface DetailRowsProps {
  rows: readonly DetailRow[];
}

/** Label / value pairs for order summaries, receipts and confirmations. */
export function DetailRows({ rows }: DetailRowsProps) {
  const theme = useTheme();

  return (
    <View>
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[
            styles.row,
            index < rows.length - 1 && [
              styles.divider,
              { borderBottomColor: theme.colors.border },
            ],
          ]}
        >
          <Text variant="body" tone="muted">
            {row.label}
          </Text>
          <Text
            variant="body"
            tone={row.tone ?? 'default'}
            style={styles.value}
            selectable
          >
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  divider: {
    borderBottomWidth: 1,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: fonts.semiBold,
  },
});
