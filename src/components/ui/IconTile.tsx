import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';
import type { IconName } from './icons';

export interface IconTileProps {
  name: IconName;
  size?: number;
  color?: string;
  background?: string;
  style?: StyleProp<ViewStyle>;
}

/** Rounded square that holds a single icon — the leading element of most rows. */
export function IconTile({
  name,
  size = 32,
  color,
  background,
  style,
}: IconTileProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor: background ?? theme.colors.surfaceStrong,
        },
        style,
      ]}
    >
      <Icon name={name} size={size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
