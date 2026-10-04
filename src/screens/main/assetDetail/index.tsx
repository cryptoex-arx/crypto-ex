import { ScrollView, View } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { DetailRows } from '../../../components/common/DetailRows';
import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { TransactionRow } from '../../../components/common/TransactionRow';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { EARN_PRODUCTS } from '../../../constants/earn';
import { findCoin } from '../../../constants/markets';
import { NETWORKS } from '../../../constants/networks';
import { useAccount } from '../../../hooks/useAccount';
import { useLiveQuote } from '../../../hooks/useLiveQuotes';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  getAvailableInr,
  getAvailableQuantity,
  getLockedQuantity,
} from '../../../services/account';
import {
  formatInr,
  formatNumber,
  formatPercent,
  formatPrice,
  formatSignedInr,
} from '../../../utils/format';
import { styles } from './styles';

/** One wallet — INR or a coin: balance breakdown, actions and history. */
export function AssetDetailScreen({
  navigation,
  route,
}: AppStackScreenProps<'AssetDetail'>) {
  const { coinId } = route.params;
  const isInr = coinId === 'inr';
  const coin = findCoin(coinId);
  const quote = useLiveQuote(coinId);
  const account = useAccount();
  const transactions = account.transactions.filter(
    transaction => transaction.asset === coinId,
  );

  if (!isInr && !coin) {
    return (
      <Screen>
        <ScreenHeader onBack={navigation.goBack} />
        <EmptyState title="Asset not found" />
      </Screen>
    );
  }

  const holding = account.holdings[coinId];
  const quantity = isInr ? account.inrBalance : holding?.quantity ?? 0;
  const price = quote?.price ?? 0;
  const value = isInr ? quantity : quantity * price;
  const invested = holding ? holding.quantity * holding.avgPrice : 0;
  const pnl = value - invested;
  const symbol = isInr ? 'INR' : coin!.symbol;
  const canTransfer = !isInr && NETWORKS[coinId] !== undefined;
  const earnProduct = EARN_PRODUCTS.find(product => product.coinId === coinId);

  const rows = isInr
    ? [
        { label: 'Total', value: formatInr(account.inrBalance, 'full') },
        {
          label: 'Available',
          value: formatInr(getAvailableInr(account), 'full'),
        },
        {
          label: 'In open orders',
          value: formatInr(
            account.inrBalance - getAvailableInr(account),
            'full',
          ),
        },
      ]
    : [
        { label: 'Quantity', value: formatNumber(quantity, 8) + ' ' + symbol },
        {
          label: 'Available',
          value:
            formatNumber(getAvailableQuantity(account, coinId), 8) +
            ' ' +
            symbol,
        },
        {
          label: 'Locked (orders, staking)',
          value:
            formatNumber(getLockedQuantity(account, coinId), 8) + ' ' + symbol,
        },
        { label: 'Live price', value: formatPrice(price) },
        ...(holding
          ? [
              { label: 'Avg. buy price', value: formatPrice(holding.avgPrice) },
              { label: 'Invested', value: formatInr(invested, 'full') },
              {
                label: 'P&L',
                value:
                  formatSignedInr(pnl) +
                  (invested > 0
                    ? ' (' + formatPercent((pnl / invested) * 100) + ')'
                    : ''),
                tone: pnl >= 0 ? ('success' as const) : ('danger' as const),
              },
            ]
          : []),
      ];

  return (
    <Screen>
      <ScreenHeader
        title={isInr ? 'Indian Rupee' : coin!.name}
        onBack={navigation.goBack}
        leading={
          <CoinAvatar
            symbol={isInr ? '₹' : symbol}
            color={isInr ? '#1B8A5A' : coin!.color}
            size={22}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.center}>
          <Text variant="caption" tone="muted">
            Current value
          </Text>
          <Text variant="display">{formatInr(value, 'full')}</Text>
        </View>

        <Card padded>
          <DetailRows rows={rows} />
        </Card>

        {isInr ? (
          <View style={styles.row}>
            <Button
              label="Add INR"
              style={styles.grow}
              onPress={() => navigation.navigate('AddInr')}
            />
            <Button
              label="Withdraw"
              variant="secondary"
              style={styles.grow}
              onPress={() => navigation.navigate('WithdrawInr')}
            />
          </View>
        ) : (
          <>
            <View style={styles.row}>
              <Button
                label="Buy"
                variant="success"
                style={styles.grow}
                onPress={() =>
                  navigation.navigate('CoinDetail', { coinId, side: 'buy' })
                }
              />
              <Button
                label="Sell"
                variant="danger"
                style={styles.grow}
                onPress={() =>
                  navigation.navigate('CoinDetail', { coinId, side: 'sell' })
                }
              />
            </View>
            {canTransfer ? (
              <View style={styles.row}>
                <Button
                  label="Deposit"
                  variant="secondary"
                  icon="arrow-down"
                  style={styles.grow}
                  onPress={() =>
                    navigation.navigate('DepositCrypto', { coinId })
                  }
                />
                <Button
                  label="Withdraw"
                  variant="secondary"
                  icon="arrow-up"
                  style={styles.grow}
                  onPress={() =>
                    navigation.navigate('WithdrawCrypto', { coinId })
                  }
                />
              </View>
            ) : null}
            {earnProduct ? (
              <Button
                label={'Earn up to ' + earnProduct.apy + '% on ' + symbol}
                variant="secondary"
                icon="zap"
                onPress={() => navigation.navigate('Earn')}
              />
            ) : null}
            <Button
              label="View chart"
              variant="secondary"
              icon="bar-chart"
              onPress={() => navigation.navigate('CoinDetail', { coinId })}
            />
          </>
        )}

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          TRANSACTIONS
        </Text>
        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions"
            message={'Deposits and withdrawals of ' + symbol + ' appear here.'}
          />
        ) : (
          <Card>
            {transactions.map((transaction, index) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                divider={index < transactions.length - 1}
              />
            ))}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
