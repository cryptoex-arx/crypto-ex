import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme';

/** Logos are always dark enough for white lettering. */
const SYMBOL_COLOR = '#FFFFFF';

export interface CoinAvatarProps {
  symbol: string;
  /** Brand colour. Without one the avatar falls back to a neutral placeholder. */
  color?: string;
  size?: number;
}

/** Coloured circle standing in for a coin logo until real assets are added. */
export function CoinAvatar({ symbol, color, size = 32 }: CoinAvatarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color ?? theme.colors.surfaceStrong,
        },
      ]}
    >
      <Text
        style={[
          styles.symbol,
          {
            fontSize: size * 0.42,
            color: color ? SYMBOL_COLOR : theme.colors.textMuted,
          },
        ]}
      >
        {color ? symbol.charAt(0) : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontFamily: fonts.bold,
  },
});
