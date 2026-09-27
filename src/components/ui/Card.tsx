import type { PropsWithChildren } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

export interface CardProps extends PropsWithChildren {
  /** Adds the standard inner padding. Row lists keep it off. */
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Surface container used for every grouped block in the app. */
export function Card({ children, padded = false, style }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  padded: {
    padding: 12,
  },
});
