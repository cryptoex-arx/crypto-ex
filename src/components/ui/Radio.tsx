import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

export interface RadioProps {
  selected: boolean;
}

/** Radio indicator for single-choice list rows. */
export function Radio({ selected }: RadioProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.ring,
        {
          borderColor: selected ? theme.colors.primary : theme.colors.disabled,
        },
      ]}
    >
      {selected ? (
        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
