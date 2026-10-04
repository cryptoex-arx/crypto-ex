import { Alert, ScrollView } from 'react-native';

import { DetailRows } from '../../../components/common/DetailRows';
import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { findCoin } from '../../../constants/markets';
import { useAccount } from '../../../hooks/useAccount';
import type { AppStackScreenProps } from '../../../navigation/types';
import { cancelOrder, type SpotOrder } from '../../../services/account';
import {
  formatDateTime,
  formatInr,
  formatNumber,
  formatPrice,
} from '../../../utils/format';
import { styles } from './styles';

const TYPE_LABELS: Record<SpotOrder['type'], string> = {
  market: 'Market',
  limit: 'Limit',
  stopLimit: 'Stop-limit',
};

const STATUS_LABELS: Record<SpotOrder['status'], string> = {
  open: 'Open',
  filled: 'Filled',
  cancelled: 'Cancelled',
};

/** Everything about one spot order, with cancel while it is open. */
export function OrderDetailScreen({
  navigation,
  route,
}: AppStackScreenProps<'OrderDetail'>) {
  const account = useAccount();
  const order = account.orders.find(item => item.id === route.params.orderId);

  if (!order) {
    return (
      <Screen>
        <ScreenHeader title="Order" onBack={navigation.goBack} />
        <EmptyState title="Order not found" />
      </Screen>
    );
  }

  const symbol = findCoin(order.coinId)?.symbol ?? order.coinId;
  const isBuy = order.side === 'buy';
  const value = order.price * order.quantity;
  const filled = order.status === 'filled';
  const rows = [
    { label: 'Pair', value: symbol + '/INR' },
    {
      label: 'Side',
      value: isBuy ? 'Buy' : 'Sell',
      tone: isBuy ? ('success' as const) : ('danger' as const),
    },
    { label: 'Type', value: TYPE_LABELS[order.type] },
    {
      label: 'Status',
      value:
        order.status === 'open' && order.type === 'stopLimit'
          ? order.triggered
            ? 'Open (triggered)'
            : 'Waiting for stop'
          : STATUS_LABELS[order.status],
    },
    ...(order.stopPrice !== undefined
      ? [{ label: 'Stop price', value: formatPrice(order.stopPrice) }]
      : []),
    {
      label: filled ? 'Executed price' : 'Limit price',
      value: formatPrice(order.price),
    },
    {
      label: 'Quantity',
      value: formatNumber(order.quantity, 8) + ' ' + symbol,
    },
    { label: 'Value', value: formatInr(value, 'full') },
    { label: 'Fee', value: filled ? formatInr(order.fee, 'full') : '—' },
    ...(filled
      ? [
          {
            label: isBuy ? 'Total paid' : 'Total received',
            value: formatInr(
              isBuy ? value + order.fee : value - order.fee,
              'full',
            ),
          },
        ]
      : []),
    { label: 'Placed', value: formatDateTime(order.createdAt) },
    ...(order.closedAt
      ? [
          {
            label: filled ? 'Filled' : 'Cancelled',
            value: formatDateTime(order.closedAt),
          },
        ]
      : []),
    { label: 'Order ID', value: order.id.toUpperCase() },
  ];

  const onCancel = () =>
    Alert.alert('Cancel this order?', 'Locked funds will be released.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: () => {
          if (cancelOrder(order.id)) {
            showToast('Order cancelled');
          }
        },
      },
    ]);

  return (
    <Screen>
      <ScreenHeader title="Order Details" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card padded>
          <DetailRows rows={rows} />
        </Card>
        {order.status === 'open' ? (
          <Button label="Cancel Order" variant="danger" onPress={onCancel} />
        ) : null}
        <Button
          label={'Trade ' + symbol}
          variant="secondary"
          onPress={() =>
            navigation.navigate('CoinDetail', {
              coinId: order.coinId,
              side: order.side,
            })
          }
        />
      </ScrollView>
    </Screen>
  );
}
