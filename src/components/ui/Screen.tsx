import type { PropsWithChildren } from 'react';
import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';

export interface ScreenProps extends PropsWithChildren {
  /** Safe-area edges to inset. Defaults to all four. */
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_EDGES: readonly Edge[] = ['top', 'bottom', 'left', 'right'];

/** Tab roots skip the bottom edge: the tab bar already insets itself. */
export const TAB_SCREEN_EDGES: readonly Edge[] = ['top', 'left', 'right'];

/** Screen-level container: safe-area insets plus the themed background. */
export function Screen({
  children,
  edges = DEFAULT_EDGES,
  style,
}: ScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
