import { useState } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import type { IconName } from '../../../components/ui/icons';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { styles } from './styles';

type ThemeChoice = 'light' | 'dark' | 'system';

const THEME_OPTIONS: readonly {
  value: ThemeChoice;
  label: string;
  icon: IconName;
}[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'smartphone' },
];

/**
 * Theme and display preferences. The choice is local to the screen until a
 * preferences store exists — the app still follows the OS colour scheme.
 */
export function AppearanceScreen({
  navigation,
}: AppStackScreenProps<'Appearance'>) {
  const theme = useTheme();
  const [choice, setChoice] = useState<ThemeChoice>('light');
  const [compactList, setCompactList] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const switchColors = {
    false: theme.colors.disabled,
    true: theme.colors.primary,
  };

  return (
    <Screen>
      <ScreenHeader title="Appearance" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          THEME
        </Text>
        <View style={styles.themes}>
          {THEME_OPTIONS.map(option => {
            const selected = option.value === choice;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setChoice(option.value)}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: selected
                      ? theme.colors.background
                      : theme.colors.surface,
                    borderColor: selected
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
              >
                <Icon
                  name={option.icon}
                  size={20}
                  color={
                    selected ? theme.colors.primary : theme.colors.textMuted
                  }
                />
                <Text
                  variant="body"
                  tone={selected ? 'primary' : 'muted'}
                  style={styles.themeLabel}
                >
                  {option.label}
                </Text>
                {selected ? (
                  <View
                    style={[
                      styles.check,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Icon
                      name="check"
                      size={13}
                      color={theme.colors.textInverted}
                    />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Text variant="overline" tone="muted" style={styles.displayLabel}>
          DISPLAY
        </Text>
        <Card>
          <ListRow
            title="Compact Coin List"
            subtitle="Show more coins per screen"
            divider
            trailing={
              <Switch
                accessibilityLabel="Compact coin list"
                value={compactList}
                onValueChange={setCompactList}
                trackColor={switchColors}
              />
            }
          />
          <ListRow
            title="Show Portfolio Balance"
            subtitle="Display total value on home"
            trailing={
              <Switch
                accessibilityLabel="Show portfolio balance"
                value={showBalance}
                onValueChange={setShowBalance}
                trackColor={switchColors}
              />
            }
          />
        </Card>

        <View style={styles.banner}>
          <InfoBanner message="Dark mode is coming soon. System theme follows your device setting." />
        </View>
      </ScrollView>
    </Screen>
  );
}
