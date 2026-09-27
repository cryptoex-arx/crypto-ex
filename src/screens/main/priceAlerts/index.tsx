import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { Text } from '../../../components/ui/Text';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { styles } from './styles';

type AlertMarket = 'coins' | 'futures';

interface PriceAlert {
  id: string;
  market: AlertMarket;
  symbol: string;
  condition: string;
  triggered: boolean;
}

const TABS = [
  { value: 'coins', label: 'Coins' },
  { value: 'futures', label: 'Futures' },
] as const;

const INITIAL_ALERTS: readonly PriceAlert[] = [
  {
    id: 'btc-above',
    market: 'coins',
    symbol: 'BTC',
    condition: 'Price above ₹75,00,000',
    triggered: false,
  },
  {
    id: 'eth-below',
    market: 'coins',
    symbol: 'ETH',
    condition: 'Price below ₹1,40,000',
    triggered: false,
  },
  {
    id: 'sol-above',
    market: 'coins',
    symbol: 'SOL',
    condition: 'Price above ₹13,000',
    triggered: true,
  },
  {
    id: 'btc-perp',
    market: 'futures',
    symbol: 'BTC/USDT Perp',
    condition: 'Mark price below $80,000',
    triggered: false,
  },
];

/** Active and triggered price alerts, split by market. */
export function PriceAlertsScreen({
  navigation,
}: AppStackScreenProps<'PriceAlerts'>) {
  const theme = useTheme();
  const [market, setMarket] = useState<AlertMarket>('coins');
  const [alerts, setAlerts] = useState<readonly PriceAlert[]>(INITIAL_ALERTS);

  const visible = alerts.filter(alert => alert.market === market);
  const addLabel = market === 'coins' ? 'Add Coin Alert' : 'Add Futures Alert';

  const removeAlert = (id: string) =>
    setAlerts(current => current.filter(alert => alert.id !== id));

  return (
    <Screen>
      <ScreenHeader title="Price Alerts" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <SegmentedControl options={TABS} value={market} onChange={setMarket} />

        {visible.length === 0 ? (
          <EmptyState
            title="No alerts yet"
            message="Add an alert and we will notify you when the price moves."
          />
        ) : (
          <Card>
            {visible.map((alert, index) => (
              <ListRow
                key={alert.id}
                icon="bell"
                iconColor={alert.triggered ? theme.colors.success : undefined}
                iconBackground={
                  alert.triggered ? theme.colors.successSurface : undefined
                }
                title={alert.symbol}
                subtitle={alert.condition}
                divider={index < visible.length - 1}
                trailing={
                  <View style={styles.trailing}>
                    <Badge
                      label={alert.triggered ? 'Triggered' : 'Active'}
                      tone={alert.triggered ? 'success' : 'neutral'}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={'Delete alert for ' + alert.symbol}
                      hitSlop={8}
                      onPress={() => removeAlert(alert.id)}
                    >
                      <Icon
                        name="trash"
                        size={18}
                        color={theme.colors.danger}
                      />
                    </Pressable>
                  </View>
                }
              />
            ))}
          </Card>
        )}

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.addButton,
            {
              borderColor: theme.colors.primary,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Icon name="plus" size={20} />
          <Text variant="body" tone="primary" style={styles.addLabel}>
            {addLabel}
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
