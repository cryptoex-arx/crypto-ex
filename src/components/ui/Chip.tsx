import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  icon?: IconName;
  selected?: boolean;
  /** Omitted for read-only chips such as the compliance badges. */
  onPress?: () => void;
}

/** Pill used for feedback categories and compliance badges. */
export function Chip({ label, icon, selected = false, onPress }: ChipProps) {
  const theme = useTheme();

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: selected
            ? theme.colors.primary
            : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      {icon ? (
        <Icon
          name={icon}
          size={12}
          color={selected ? theme.colors.textInverted : theme.colors.primary}
        />
      ) : null}
      <Text variant="label" tone={selected ? 'inverted' : 'default'}>
        {label}
      </Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 30,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.7,
  },
});
