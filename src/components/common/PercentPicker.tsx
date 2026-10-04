import { StyleSheet, View } from 'react-native';

import { Chip } from '../ui/Chip';

const OPTIONS = [
  { fraction: 0.25, label: '25%' },
  { fraction: 0.5, label: '50%' },
  { fraction: 0.75, label: '75%' },
  { fraction: 1, label: 'MAX' },
] as const;

export interface PercentPickerProps {
  /** Called with 0.25, 0.5, 0.75 or 1. */
  onPick: (fraction: number) => void;
}

/** 25 / 50 / 75 / MAX shortcuts that fill an amount from a balance. */
export function PercentPicker({ onPick }: PercentPickerProps) {
  return (
    <View style={styles.row}>
      {OPTIONS.map(option => (
        <View key={option.label} style={styles.cell}>
          <Chip label={option.label} onPress={() => onPick(option.fraction)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  cell: {
    flex: 1,
    alignItems: 'stretch',
  },
});
