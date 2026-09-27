import { useState } from 'react';
import { ScrollView } from 'react-native';

import { EmptyState } from '../../../components/common/EmptyState';
import { OrderRow } from '../../../components/common/OrderRow';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { COIN_ORDERS, type OrderTab } from '../../../constants/orders';
import type { AppStackScreenProps } from '../../../navigation/types';
import { styles } from './styles';

const TABS = [
  { value: 'pending', label: 'Pending', icon: 'clock' },
  { value: 'history', label: 'History', icon: 'history' },
] as const;

/** Open and completed spot orders. */
export function CoinOrdersScreen({
  navigation,
}: AppStackScreenProps<'CoinOrders'>) {
  const [tab, setTab] = useState<OrderTab>('pending');
  const orders = COIN_ORDERS[tab];

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
            message="Orders you place appear here."
          />
        ) : (
          <Card>
            {orders.map((order, index) => (
              <OrderRow
                key={order.id}
                order={order}
                divider={index < orders.length - 1}
              />
            ))}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
