import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { CoinChart } from '../../../components/common/CoinChart';
import { DetailRows } from '../../../components/common/DetailRows';
import { EmptyState } from '../../../components/common/EmptyState';
import { OrderRow } from '../../../components/common/OrderRow';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { findCoin } from '../../../constants/markets';
import { useAccount } from '../../../hooks/useAccount';
import { useLiveQuote } from '../../../hooks/useLiveQuotes';
import { useRecentTrades } from '../../../hooks/useMarketDepth';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { cancelOrder, toggleFavourite } from '../../../services/account';
import {
  formatInr,
  formatNumber,
  formatPercent,
  formatPrice,
  formatSignedInr,
  formatTime,
  formatUsdCompact,
  priceDecimals,
  quantityDecimals,
} from '../../../utils/format';
import { styles } from './styles';
import { TradePanel } from './TradePanel';

const TOP_TABS = [
  { value: 'chart', label: 'Chart' },
  { value: 'stats', label: 'Stats' },
  { value: 'trades', label: 'Trades' },
] as const;

type TopTab = (typeof TOP_TABS)[number]['value'];

type BottomTab = 'trade' | 'holdings' | 'orders';

/** Market trades listed under the Trades tab. */
const RECENT_TRADES = 15;

/**
 * One coin: live price, chart / stats / market trades on top, and the order
 * book, order ticket, holding and open orders below.
 */
export function CoinDetailScreen({
  navigation,
  route,
}: AppStackScreenProps<'CoinDetail'>) {
  const theme = useTheme();
  const { coinId, side } = route.params;
  const coin = findCoin(coinId);
  const quote = useLiveQuote(coinId);
  const account = useAccount();
  const [topTab, setTopTab] = useState<TopTab>('chart');
  // Buy / Sell buttons elsewhere land here: fold the chart so the ticket shows.
  const [collapsed, setCollapsed] = useState(side !== undefined);
  const [bottomTab, setBottomTab] = useState<BottomTab>('trade');

  if (!coin || !quote) {
    return (
      <Screen>
        <ScreenHeader onBack={navigation.goBack} />
        <EmptyState
          title="Coin not found"
          message="This coin is not listed on the exchange."
        />
      </Screen>
    );
  }

  const up = quote.change24h >= 0;
  const isFavourite = account.favourites.includes(coinId);
  const holding = account.holdings[coinId];
  const openOrders = account.orders.filter(
    order => order.coinId === coinId && order.status === 'open',
  );
  const stats = [
    { label: '24h High', value: formatPrice(quote.high24h) },
    { label: '24h Low', value: formatPrice(quote.low24h) },
    { label: '24h Volume', value: formatUsdCompact(coin.volumeUsd) },
    { label: '24h Change', value: formatPercent(quote.change24h) },
    { label: 'Pair', value: coin.symbol + '/INR' },
  ];

  const holdingRows = holding
    ? (() => {
        const value = holding.quantity * quote.price;
        const invested = holding.quantity * holding.avgPrice;
        const pnl = value - invested;
        return [
          {
            label: 'Holding',
            value: formatNumber(holding.quantity, 8) + ' ' + coin.symbol,
          },
          { label: 'Current value', value: formatInr(value, 'full') },
          { label: 'Avg. buy price', value: formatPrice(holding.avgPrice) },
          {
            label: 'P&L',
            value:
              formatSignedInr(pnl) +
              (invested > 0
                ? ' (' + formatPercent((pnl / invested) * 100) + ')'
                : ''),
            tone: pnl >= 0 ? ('success' as const) : ('danger' as const),
          },
        ];
      })()
    : undefined;

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          onPress={navigation.goBack}
        >
          <Icon name="chevron-left" size={22} color={theme.colors.textMuted} />
        </Pressable>
        <CoinAvatar symbol={coin.symbol} color={coin.color} size={28} />
        <View style={styles.headerTitle}>
          <Text variant="subtitle" numberOfLines={1} style={styles.pair}>
            {coin.symbol}/INR
          </Text>
          <View style={styles.headerQuote}>
            <Text variant="label">{formatPrice(quote.price)}</Text>
            <Text variant="label" tone={up ? 'success' : 'danger'}>
              ({formatPercent(quote.change24h)})
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isFavourite ? 'Remove from favourites' : 'Add to favourites'
          }
          hitSlop={8}
          onPress={() => toggleFavourite(coinId)}
        >
          <Icon
            name={isFavourite ? 'star-filled' : 'star'}
            size={20}
            color={isFavourite ? '#F5A524' : theme.colors.textMuted}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add price alert"
          hitSlop={8}
          onPress={() =>
            navigation.navigate('AddPriceAlert', { coinId, market: 'spot' })
          }
        >
          <Icon name="bell" size={20} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextTabs
          options={TOP_TABS}
          value={topTab}
          onChange={tab => {
            setTopTab(tab);
            setCollapsed(false);
          }}
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={collapsed ? 'Show chart' : 'Hide chart'}
              hitSlop={12}
              onPress={() => setCollapsed(value => !value)}
            >
              <Icon
                name={collapsed ? 'chevron-down' : 'chevron-up'}
                size={20}
                color={theme.colors.textMuted}
              />
            </Pressable>
          }
        />

        {collapsed ? null : (
          <View style={styles.topPanel}>
            {topTab === 'chart' ? (
              <View style={styles.fullBleed}>
                <CoinChart coinId={coin.id} />
              </View>
            ) : null}
            {topTab === 'stats' ? (
              <Card padded style={styles.stats}>
                {stats.map(stat => (
                  <View key={stat.label} style={styles.stat}>
                    <Text variant="caption" tone="muted">
                      {stat.label}
                    </Text>
                    <Text variant="label" style={styles.statValue}>
                      {stat.value}
                    </Text>
                  </View>
                ))}
              </Card>
            ) : null}
            {topTab === 'trades' ? (
              <MarketTrades
                coinId={coin.id}
                symbol={coin.symbol}
                price={quote.price}
              />
            ) : null}
          </View>
        )}

        <View
          style={[
            styles.sectionBreak,
            { backgroundColor: theme.colors.border },
          ]}
        />

        <TextTabs
          options={[
            { value: 'trade', label: 'Trade' },
            { value: 'holdings', label: 'Holdings' },
            { value: 'orders', label: `Orders (${openOrders.length})` },
          ]}
          value={bottomTab}
          onChange={setBottomTab}
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Order history"
              hitSlop={12}
              onPress={() => navigation.navigate('CoinOrders')}
            >
              <Icon name="history" size={18} color={theme.colors.textMuted} />
            </Pressable>
          }
        />

        <View style={styles.bottomPanel}>
          {/* Hidden rather than unmounted, so a half-filled ticket survives. */}
          <View style={bottomTab !== 'trade' && styles.hidden}>
            <TradePanel
              coin={coin}
              quote={quote}
              initialSide={side}
              onAddFunds={fundsSide =>
                fundsSide === 'buy'
                  ? navigation.navigate('AddInr')
                  : navigation.navigate('DepositCrypto', { coinId })
              }
            />
          </View>

          {bottomTab === 'holdings' ? (
            holdingRows ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('AssetDetail', { coinId })}
              >
                <Card padded>
                  <DetailRows rows={holdingRows} />
                </Card>
              </Pressable>
            ) : (
              <EmptyState
                title={'No ' + coin.symbol + ' yet'}
                message={'Buy ' + coin.symbol + ' to see your holding here.'}
              />
            )
          ) : null}

          {bottomTab === 'orders' ? (
            openOrders.length === 0 ? (
              <EmptyState
                title="No open orders"
                message="Limit and stop-limit orders wait here until they fill."
              />
            ) : (
              <Card>
                {openOrders.map((order, index) => (
                  <View key={order.id}>
                    <OrderRow
                      order={order}
                      divider={false}
                      onPress={() =>
                        navigation.navigate('OrderDetail', {
                          orderId: order.id,
                        })
                      }
                    />
                    <View
                      style={[
                        styles.cancelRow,
                        index < openOrders.length - 1 && [
                          styles.divider,
                          { borderBottomColor: theme.colors.border },
                        ],
                      ]}
                    >
                      <Button
                        label="Cancel"
                        variant="secondary"
                        style={styles.cancel}
                        onPress={() => {
                          if (cancelOrder(order.id)) {
                            showToast('Order cancelled');
                          }
                        }}
                      />
                    </View>
                  </View>
                ))}
              </Card>
            )
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

interface TextTabsProps<Value extends string> {
  options: readonly { value: Value; label: string }[];
  value: Value;
  onChange: (value: Value) => void;
  /** Icon button at the right end of the row. */
  trailing?: ReactNode;
}

/** Underlined text tabs, as on exchange trading screens. */
function TextTabs<Value extends string>({
  options,
  value,
  onChange,
  trailing,
}: TextTabsProps<Value>) {
  const theme = useTheme();

  return (
    <View style={[styles.tabs, { borderBottomColor: theme.colors.border }]}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={styles.tab}
          >
            <Text
              variant="subtitle"
              tone={selected ? 'default' : 'muted'}
              style={selected && styles.selectedTab}
            >
              {option.label}
            </Text>
            <View
              style={[
                styles.tabIndicator,
                selected && { backgroundColor: theme.colors.primary },
              ]}
            />
          </Pressable>
        );
      })}
      <View style={styles.tabsSpacer} />
      {trailing}
    </View>
  );
}

interface MarketTradesProps {
  coinId: string;
  symbol: string;
  /** Live price, for the table's decimal places. */
  price: number;
}

/** Latest exchange trades; mounted only while its tab is open. */
function MarketTrades({ coinId, symbol, price }: MarketTradesProps) {
  const trades = useRecentTrades(coinId, RECENT_TRADES);
  /** Feed trade sizes are USD; convert through the live USDT/INR rate. */
  const usdInr = useLiveQuote('usdt')?.price ?? 1;
  const pxDecimals = priceDecimals(price);
  const qtyDecimals = quantityDecimals(price);

  return (
    <Card padded>
      <View style={styles.tradeRow}>
        <Text variant="caption" tone="muted" style={styles.tradeCell}>
          Time
        </Text>
        <Text variant="caption" tone="muted" style={styles.tradeCell}>
          Price (INR)
        </Text>
        <Text
          variant="caption"
          tone="muted"
          style={[styles.tradeCell, styles.tradeRight]}
        >
          Amount ({symbol})
        </Text>
      </View>
      {trades.map((trade, index) => (
        <View key={trade.timestamp + '-' + index} style={styles.tradeRow}>
          <Text variant="caption" tone="muted" style={styles.tradeCell}>
            {formatTime(trade.timestamp)}
          </Text>
          <Text
            variant="caption"
            tone={trade.side === 'buy' ? 'success' : 'danger'}
            style={styles.tradeCell}
          >
            {formatNumber(trade.price, pxDecimals)}
          </Text>
          <Text variant="caption" style={[styles.tradeCell, styles.tradeRight]}>
            {formatNumber((trade.size * usdInr) / trade.price, qtyDecimals)}
          </Text>
        </View>
      ))}
    </Card>
  );
}
