import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';

import { EmptyState } from '../../../components/common/EmptyState';
import { OrderRow } from '../../../components/common/OrderRow';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { useAccount } from '../../../hooks/useAccount';
import type { AppStackScreenProps } from '../../../navigation/types';
import { cancelOrder } from '../../../services/account';
import { styles } from './styles';

type OrderTab = 'pending' | 'history';

const TABS = [
  { value: 'pending', label: 'Pending', icon: 'clock' },
  { value: 'history', label: 'History', icon: 'history' },
] as const;

/** Open and completed spot orders, with cancel. */
export function CoinOrdersScreen({
  navigation,
}: AppStackScreenProps<'CoinOrders'>) {
  const [tab, setTab] = useState<OrderTab>('pending');
  const account = useAccount();
  const orders = account.orders.filter(order =>
    tab === 'pending' ? order.status === 'open' : order.status !== 'open',
  );

  const onCancelAll = () =>
    Alert.alert(
      'Cancel all open orders?',
      'Funds they lock will be released.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel all',
          style: 'destructive',
          onPress: () => {
            const count = orders.filter(order => cancelOrder(order.id)).length;
            showToast(count + ' orders cancelled');
          },
        },
      ],
    );

  return (
    <Screen>
      <ScreenHeader title="Coin Orders" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <SegmentedControl
          options={TABS}
          value={tab}
          onChange={setTab}
          variant="outline"
        />

        {orders.length === 0 ? (
          <EmptyState
            title="No orders"
            message={
              tab === 'pending'
                ? 'Limit and stop-limit orders wait here until they fill.'
                : 'Filled and cancelled orders appear here.'
            }
          />
        ) : (
          <Card>
            {orders.map((order, index) => (
              <OrderRow
                key={order.id}
                order={order}
                divider={index < orders.length - 1}
                onPress={() =>
                  navigation.navigate('OrderDetail', { orderId: order.id })
                }
              />
            ))}
          </Card>
        )}

        {tab === 'pending' && orders.length > 1 ? (
          <Button
            label="Cancel all"
            variant="secondary"
            onPress={onCancelAll}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
