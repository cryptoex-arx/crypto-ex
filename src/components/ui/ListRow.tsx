import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { IconTile } from './IconTile';
import { Text, type TextTone } from './Text';

export interface ListRowProps {
  /** Leading icon tile. Ignored when `leading` is provided. */
  icon?: IconName;
  iconColor?: string;
  iconBackground?: string;
  /** Replaces the icon tile — used for coin avatars and status dots. */
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  /** Right-hand primary line. */
  value?: string;
  valueTone?: TextTone;
  /** Right-hand secondary line, under `value`. */
  meta?: string;
  metaTone?: TextTone;
  /** Fully custom right-hand content, replacing value/meta. */
  trailing?: ReactNode;
  showChevron?: boolean;
  /** Hairline under the row — pass on every row except the last one. */
  divider?: boolean;
  onPress?: () => void;
}

/** The grouped-list row shared by settings, history and asset lists. */
export function ListRow({
  icon,
  iconColor,
  iconBackground,
  leading,
  title,
  subtitle,
  value,
  valueTone = 'default',
  meta,
  metaTone = 'muted',
  trailing,
  showChevron = false,
  divider = false,
  onPress,
}: ListRowProps) {
  const theme = useTheme();

  const content = (
    <View
      style={[
        styles.container,
        divider && [styles.divider, { borderBottomColor: theme.colors.border }],
      ]}
    >
      {leading ??
        (icon ? (
          <IconTile name={icon} color={iconColor} background={iconBackground} />
        ) : null)}

      <View style={styles.body}>
        <Text variant="body" style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {trailing ??
        (value || meta ? (
          <View style={styles.valueColumn}>
            {value ? (
              <Text variant="label" tone={valueTone}>
                {value}
              </Text>
            ) : null}
            {meta ? (
              <Text variant="caption" tone={metaTone} style={styles.subtitle}>
                {meta}
              </Text>
            ) : null}
          </View>
        ) : null)}

      {showChevron ? (
        <Icon name="chevron-right" size={16} color={theme.colors.textMuted} />
      ) : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
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
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  body: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.semiBold,
  },
  subtitle: {
    marginTop: 1,
  },
  valueColumn: {
    alignItems: 'flex-end',
  },
  divider: {
    borderBottomWidth: 1,
  },
  pressed: {
    opacity: 0.6,
  },
});
