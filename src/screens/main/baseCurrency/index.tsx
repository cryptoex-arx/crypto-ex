import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { styles } from './styles';

type CurrencyCode = 'INR' | 'USDT';

const CURRENCIES = [
  {
    code: 'INR' as const,
    glyph: '₹',
    title: 'Indian Rupee',
    subtitle: 'Default for Indian users',
  },
  {
    code: 'USDT' as const,
    glyph: '$',
    title: 'Tether (USDT)',
    subtitle: 'USD-pegged stablecoin',
  },
];

/** Chooses the currency every price and balance is displayed in. */
export function BaseCurrencyScreen({
  navigation,
}: AppStackScreenProps<'BaseCurrency'>) {
  const theme = useTheme();
  const [selected, setSelected] = useState<CurrencyCode>('INR');

  return (
    <Screen>
      <ScreenHeader title="Base Currency" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <InfoBanner message="All prices, balances and P&L will be shown in your selected base currency." />

        <Card>
          {CURRENCIES.map((currency, index) => (
            <ListRow
              key={currency.code}
              title={currency.title}
              subtitle={currency.subtitle}
              divider={index < CURRENCIES.length - 1}
              onPress={() => setSelected(currency.code)}
              leading={
                <View
                  style={[
                    styles.glyphTile,
                    { backgroundColor: theme.colors.surfaceStrong },
                  ]}
                >
                  <Text variant="body" tone="primary" style={styles.glyph}>
                    {currency.glyph}
                  </Text>
                </View>
              }
              trailing={
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor:
                        selected === currency.code
                          ? theme.colors.primary
                          : theme.colors.disabled,
                    },
                  ]}
                >
                  {selected === currency.code ? (
                    <View
                      style={[
                        styles.radioDot,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    />
                  ) : null}
                </View>
              }
            />
          ))}
        </Card>

        <Button label="Save Preference" onPress={navigation.goBack} />
      </ScrollView>
    </Screen>
  );
}
