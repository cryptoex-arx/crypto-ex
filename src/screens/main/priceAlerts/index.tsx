import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { Text } from '../../../components/ui/Text';
import { findCoin } from '../../../constants/markets';
import { useLiveQuotes } from '../../../hooks/useLiveQuotes';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { getMarkPrice } from '../../../services/account';
import {
  type AlertMarket,
  alertsStore,
  formatAlertPrice,
  removeAlert,
} from '../../../services/alerts';
import { formatDateTime } from '../../../utils/format';
import { styles } from './styles';

const TABS = [
  { value: 'spot', label: 'Coins' },
  { value: 'futures', label: 'Futures' },
] as const;

/** Active and triggered price alerts, split by market. */
export function PriceAlertsScreen({
  navigation,
}: AppStackScreenProps<'PriceAlerts'>) {
  const theme = useTheme();
  const quotes = useLiveQuotes();
  const { alerts } = useStore(alertsStore);
  const [market, setMarket] = useState<AlertMarket>('spot');
  const visible = alerts.filter(alert => alert.market === market);
  const addLabel = market === 'spot' ? 'Add Coin Alert' : 'Add Futures Alert';

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
            {visible.map((alert, index) => {
              const coin = findCoin(alert.coinId);
              const symbol =
                (coin?.symbol ?? alert.coinId) +
                (market === 'futures' ? 'USDT Perp' : '');
              const current =
                market === 'spot'
                  ? quotes[alert.coinId]?.price
                  : getMarkPrice(alert.coinId, quotes);
              const triggered = alert.status === 'triggered';
              return (
                <ListRow
                  key={alert.id}
                  leading={
                    <CoinAvatar
                      symbol={coin?.symbol ?? '?'}
                      color={coin?.color}
                    />
                  }
                  title={symbol}
                  subtitle={
                    'Price ' +
                    alert.direction +
                    ' ' +
                    formatAlertPrice(market, alert.price) +
                    '\n' +
                    (triggered && alert.triggeredAt
                      ? 'Triggered ' + formatDateTime(alert.triggeredAt)
                      : current !== undefined
                      ? 'Now ' + formatAlertPrice(market, current)
                      : '')
                  }
                  divider={index < visible.length - 1}
                  trailing={
                    <View style={styles.trailing}>
                      <Badge
                        label={triggered ? 'Triggered' : 'Active'}
                        tone={triggered ? 'success' : 'neutral'}
                      />
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={'Delete ' + symbol + ' alert'}
                        hitSlop={10}
                        onPress={() => removeAlert(alert.id)}
                      >
                        <Icon
                          name="trash"
                          size={16}
                          color={theme.colors.textMuted}
                        />
                      </Pressable>
                    </View>
                  }
                />
              );
            })}
          </Card>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('AddPriceAlert', { market })}
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
