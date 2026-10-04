import { Pressable, ScrollView, Switch, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import type { IconName } from '../../../components/ui/icons';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  settingsStore,
  type ThemePreference,
  updateSettings,
} from '../../../services/settings';
import { styles } from './styles';

const THEME_OPTIONS: readonly {
  value: ThemePreference;
  label: string;
  icon: IconName;
}[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'smartphone' },
];

/** Theme and display preferences, saved on the device. */
export function AppearanceScreen({
  navigation,
}: AppStackScreenProps<'Appearance'>) {
  const theme = useTheme();
  const { theme: choice, compactList, hideBalances } = useStore(settingsStore);

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
                onPress={() => updateSettings({ theme: option.value })}
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
                onValueChange={value => updateSettings({ compactList: value })}
                trackColor={switchColors}
              />
            }
          />
          <ListRow
            title="Show Portfolio Balance"
            subtitle="Show balances on Home and Portfolio"
            trailing={
              <Switch
                accessibilityLabel="Show portfolio balance"
                value={!hideBalances}
                onValueChange={value =>
                  updateSettings({ hideBalances: !value })
                }
                trackColor={switchColors}
              />
            }
          />
        </Card>

        <View style={styles.banner}>
          <InfoBanner message="System follows your device's light or dark setting." />
        </View>
      </ScrollView>
    </Screen>
  );
}
