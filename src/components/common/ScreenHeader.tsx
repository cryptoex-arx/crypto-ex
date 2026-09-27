import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme';
import { Icon } from '../ui/Icon';
import { Text } from '../ui/Text';

export interface ScreenHeaderProps {
  /** Omitted when the bar only carries a back button. */
  title?: string;
  /** Omitted on tab roots, where there is nothing to go back to. */
  onBack?: () => void;
  /** Right-hand accessory, e.g. the balance visibility toggle. */
  trailing?: ReactNode;
  /** Extra leading content shown next to the title, e.g. a coin avatar. */
  leading?: ReactNode;
}

/** Centred title bar used instead of the native stack header. */
export function ScreenHeader({
  title,
  onBack,
  trailing,
  leading,
}: ScreenHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={onBack}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Icon
              name="chevron-left"
              size={22}
              color={theme.colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.titleGroup}>
        {leading}
        {title ? (
          <Text variant="subtitle" numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, styles.trailing]}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  side: {
    width: 36,
    justifyContent: 'center',
  },
  trailing: {
    alignItems: 'flex-end',
  },
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
