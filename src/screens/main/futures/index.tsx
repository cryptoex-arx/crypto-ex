import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { CoinSelector } from '../../../components/common/CoinSelector';
import { ConfirmSheet } from '../../../components/common/ConfirmSheet';
import { DetailRows } from '../../../components/common/DetailRows';
import { EmptyState } from '../../../components/common/EmptyState';
import { PercentPicker } from '../../../components/common/PercentPicker';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { Screen, TAB_SCREEN_EDGES } from '../../../components/ui/Screen';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { Text } from '../../../components/ui/Text';
import { findCoin } from '../../../constants/markets';
import { useAccount } from '../../../hooks/useAccount';
import { useLiveQuotes } from '../../../hooks/useLiveQuotes';
import { useTheme } from '../../../hooks/useTheme';
import type { MainTabScreenProps } from '../../../navigation/types';
import {
  cancelFuturesOrder,
  closePosition,
  FUTURES_COINS,
  FUTURES_FEE_RATE,
  getAvailableMargin,
  getMarkPrice,
  liquidationPrice,
  MAX_LEVERAGE,
  placeFuturesOrder,
  type PositionSide,
  returnOnEquity,
  unrealizedPnl,
} from '../../../services/account';
import {
  floorTo,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatUsdt,
  parseAmount,
  priceDecimals,
  sanitizeDecimalInput,
} from '../../../utils/format';
import { styles } from './styles';

type OrderType = 'market' | 'limit';
type BottomTab = 'positions' | 'orders' | 'history';

const ORDER_TYPES = [
  { value: 'market', label: 'Market' },
  { value: 'limit', label: 'Limit' },
] as const;

const LEVERAGE_PRESETS = [1, 2, 3, 5, 10, 20, 25, 50] as const;

const CLOSE_REASONS = {
  manual: 'Closed',
  takeProfit: 'Take profit',
  stopLoss: 'Stop loss',
  liquidation: 'Liquidated',
} as const;

/** Optional price field: empty means "not set". */
function optionalPrice(text: string): number | undefined {
  return text.trim() === '' ? undefined : parseAmount(text);
}

/** USDT-margined perpetual ticket with positions, orders and history. */
export function FuturesScreen({
  navigation,
  route,
}: MainTabScreenProps<'Futures'>) {
  const theme = useTheme();
  const account = useAccount();
  const quotes = useLiveQuotes();
  const [coinId, setCoinId] = useState(route.params?.coinId ?? 'btc');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [side, setSide] = useState<PositionSide>(route.params?.side ?? 'long');
  const [leverage, setLeverage] = useState(route.params?.leverage ?? 10);
  const [draftLeverage, setDraftLeverage] = useState(leverage);
  const [pickingLeverage, setPickingLeverage] = useState(false);
  const [priceText, setPriceText] = useState('');
  const [marginText, setMarginText] = useState('');
  const [takeProfitText, setTakeProfitText] = useState('');
  const [stopLossText, setStopLossText] = useState('');
  const [tab, setTab] = useState<BottomTab>('positions');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();

  // Expert picks open this tab with a preset contract, side and leverage.
  useEffect(() => {
    const params = route.params;
    if (params?.coinId) {
      setCoinId(params.coinId);
    }
    if (params?.side) {
      setSide(params.side);
    }
    if (params?.leverage) {
      setLeverage(Math.min(MAX_LEVERAGE, params.leverage));
    }
  }, [route.params]);

  const coin = findCoin(coinId)!;
  const mark = getMarkPrice(coinId, quotes) ?? 0;
  const change = quotes[coinId]?.change24h ?? 0;
  const decimals = priceDecimals(mark);
  const available = getAvailableMargin(account);
  const isLong = side === 'long';
  const entry = orderType === 'limit' ? parseAmount(priceText) : mark;
  const margin = parseAmount(marginText);
  const notional = Number.isFinite(margin) ? margin * leverage : 0;
  const quantity = entry > 0 ? notional / entry : 0;
  const fee = notional * FUTURES_FEE_RATE;
  const liquidation = entry > 0 ? liquidationPrice(side, entry, leverage) : 0;
  const takeProfit = optionalPrice(takeProfitText);
  const stopLoss = optionalPrice(stopLossText);
  const direction = isLong ? 1 : -1;

  const summary = [
    {
      label: 'Position size',
      value:
        formatUsdt(notional) +
        ' (' +
        formatNumber(quantity, 6) +
        ' ' +
        coin.symbol +
        ')',
    },
    { label: 'Entry', value: entry > 0 ? formatUsdt(entry) : '—' },
    {
      label: 'Liq. price',
      value: liquidation > 0 ? formatUsdt(liquidation) : '—',
      tone: 'danger' as const,
    },
    { label: 'Fee (0.05%)', value: formatUsdt(fee) },
    ...(takeProfit
      ? [
          {
            label: 'Profit at TP',
            value: formatUsdt((takeProfit - entry) * quantity * direction),
            tone: 'success' as const,
          },
        ]
      : []),
    ...(stopLoss
      ? [
          {
            label: 'Loss at SL',
            value: formatUsdt((stopLoss - entry) * quantity * direction),
            tone: 'danger' as const,
          },
        ]
      : []),
  ];

  const positions = account.futures.positions;
  const openOrders = account.futures.orders.filter(
    order => order.status === 'open',
  );
  const history = account.futures.history;

  const onChangeType = (next: OrderType) => {
    setOrderType(next);
    if (next === 'limit' && priceText === '') {
      setPriceText(mark.toFixed(decimals));
    }
  };

  const onConfirm = () => {
    const result = placeFuturesOrder({
      coinId,
      side,
      type: orderType,
      leverage,
      margin,
      price: orderType === 'limit' ? entry : undefined,
      takeProfit,
      stopLoss,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setConfirming(false);
    setMarginText('');
    setTakeProfitText('');
    setStopLossText('');
    setTab(result.value.position ? 'positions' : 'orders');
    showToast(
      result.value.position ? 'Position opened' : 'Limit order placed',
      'success',
      coin.symbol + ' ' + side + ' ' + leverage + 'x',
    );
  };

  const onClose = (positionId: string) =>
    Alert.alert('Close position?', 'It will close at the current mark price.', [
      { text: 'Keep open', style: 'cancel' },
      {
        text: 'Close',
        style: 'destructive',
        onPress: () => {
          const result = closePosition(positionId);
          if (result.ok) {
            const net = result.value.pnl - result.value.closeFee;
            showToast(
              'Position closed',
              net >= 0 ? 'success' : 'danger',
              'Realised P&L ' + formatUsdt(net),
            );
          }
        },
      },
    ]);

  const onInfo = () =>
    Alert.alert(
      'USDT perpetuals',
      'Trade with up to ' +
        MAX_LEVERAGE +
        'x leverage using USDT margin from your futures wallet. Fees are 0.05% of position size on open and close. If the mark price reaches the liquidation price you lose the position margin.',
    );

  return (
    <Screen edges={TAB_SCREEN_EDGES}>
      <ScreenHeader
        title={coin.symbol + 'USDT Perp'}
        leading={
          <CoinAvatar symbol={coin.symbol} color={coin.color} size={22} />
        }
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="About futures"
            hitSlop={10}
            onPress={onInfo}
          >
            <Icon name="info" size={18} color={theme.colors.textMuted} />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <CoinSelector
          coins={FUTURES_COINS}
          value={coinId}
          onChange={next => {
            setCoinId(next);
            setPriceText('');
          }}
          perpetual
        />

        <Card style={styles.tickerCard}>
          <View style={styles.ticker}>
            {[
              { label: 'Mark Price', value: formatUsdt(mark), tone: 'default' },
              {
                label: '24h Change',
                value: formatPercent(change),
                tone: change >= 0 ? 'success' : 'danger',
              },
              { label: 'Funding', value: '+0.0100%', tone: 'success' },
            ].map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.tickerCell,
                  index > 0 && [
                    styles.tickerDivider,
                    { borderLeftColor: theme.colors.border },
                  ],
                ]}
              >
                <Text variant="caption" tone="muted">
                  {item.label}
                </Text>
                <Text
                  variant="body"
                  tone={item.tone as 'default' | 'success' | 'danger'}
                  style={styles.tickerValue}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.walletRow}>
          <Text variant="caption" tone="muted" style={styles.grow}>
            Available margin:{' '}
            <Text variant="caption" style={styles.bold}>
              {formatUsdt(available)}
            </Text>
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Transfer')}
          >
            <Text variant="label" tone="primary">
              Transfer
            </Text>
          </Pressable>
        </View>

        <View style={styles.segments}>
          <SegmentedControl
            options={ORDER_TYPES}
            value={orderType}
            onChange={onChangeType}
          />
        </View>

        <View style={styles.sides}>
          {(['long', 'short'] as const).map(option => {
            const selected = option === side;
            const color =
              option === 'long' ? theme.colors.success : theme.colors.danger;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSide(option)}
                style={[
                  styles.sideButton,
                  {
                    backgroundColor: selected ? color : theme.colors.surface,
                    borderColor: selected ? color : theme.colors.border,
                  },
                ]}
              >
                <Text
                  variant="body"
                  tone={selected ? 'inverted' : 'muted'}
                  style={styles.sideLabel}
                >
                  {option === 'long' ? 'Long / Buy' : 'Short / Sell'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text variant="overline" tone="muted" style={styles.fieldLabel}>
          LEVERAGE
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change leverage"
          onPress={() => {
            setDraftLeverage(leverage);
            setPickingLeverage(true);
          }}
          style={[
            styles.select,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text variant="body" style={styles.selectValue}>
            {leverage}x
          </Text>
          <Text variant="body" tone="muted" style={styles.selectHint}>
            leverage
          </Text>
          <Icon name="chevron-down" size={18} color={theme.colors.textMuted} />
        </Pressable>

        {orderType === 'limit' ? (
          <>
            <Text variant="overline" tone="muted" style={styles.fieldLabel}>
              LIMIT PRICE (USDT)
            </Text>
            <Input
              accessibilityLabel="Limit price in USDT"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={priceText}
              onChangeText={text =>
                setPriceText(sanitizeDecimalInput(text, decimals))
              }
            />
          </>
        ) : null}

        <Text variant="overline" tone="muted" style={styles.fieldLabel}>
          MARGIN (USDT)
        </Text>
        <Input
          accessibilityLabel="Margin in USDT"
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={marginText}
          onChangeText={text => setMarginText(sanitizeDecimalInput(text, 2))}
        />
        <View style={styles.percent}>
          <PercentPicker
            onPick={fraction =>
              setMarginText(
                String(
                  floorTo(
                    (available * fraction) / (1 + leverage * FUTURES_FEE_RATE),
                    2,
                  ),
                ),
              )
            }
          />
        </View>

        <View style={styles.targets}>
          <View style={styles.grow}>
            <Text variant="overline" tone="muted" style={styles.fieldLabel}>
              TAKE PROFIT
            </Text>
            <Input
              accessibilityLabel="Take profit price"
              placeholder="Optional"
              keyboardType="decimal-pad"
              value={takeProfitText}
              onChangeText={text =>
                setTakeProfitText(sanitizeDecimalInput(text, decimals))
              }
            />
          </View>
          <View style={styles.grow}>
            <Text variant="overline" tone="muted" style={styles.fieldLabel}>
              STOP LOSS
            </Text>
            <Input
              accessibilityLabel="Stop loss price"
              placeholder="Optional"
              keyboardType="decimal-pad"
              value={stopLossText}
              onChangeText={text =>
                setStopLossText(sanitizeDecimalInput(text, decimals))
              }
            />
          </View>
        </View>

        <Card padded style={styles.summary}>
          <DetailRows rows={summary} />
        </Card>

        <Button
          label={(isLong ? 'Open Long ' : 'Open Short ') + leverage + 'x'}
          variant={isLong ? 'success' : 'danger'}
          disabled={!(margin > 0) || !(entry > 0)}
          style={styles.submit}
          onPress={() => {
            setError(undefined);
            setConfirming(true);
          }}
        />

        <View style={styles.tabs}>
          <SegmentedControl
            options={[
              { value: 'positions', label: `Positions (${positions.length})` },
              { value: 'orders', label: `Orders (${openOrders.length})` },
              { value: 'history', label: 'History' },
            ]}
            value={tab}
            onChange={setTab}
            variant="outline"
          />
        </View>

        {tab === 'positions' ? (
          positions.length === 0 ? (
            <EmptyState
              title="No open positions"
              message="Positions you open appear here with live P&L."
            />
          ) : (
            positions.map(position => {
              const positionMark =
                getMarkPrice(position.coinId, quotes) ?? position.entryPrice;
              const pnl = unrealizedPnl(position, positionMark);
              const symbol = findCoin(position.coinId)?.symbol ?? '';
              return (
                <Card key={position.id} padded style={styles.positionCard}>
                  <View style={styles.positionHeader}>
                    <Text variant="subtitle" style={styles.bold}>
                      {symbol}USDT
                    </Text>
                    <Badge
                      label={
                        (position.side === 'long' ? 'Long ' : 'Short ') +
                        position.leverage +
                        'x'
                      }
                      tone={position.side === 'long' ? 'success' : 'danger'}
                    />
                    <View style={styles.grow} />
                    <Text
                      variant="label"
                      tone={pnl >= 0 ? 'success' : 'danger'}
                    >
                      {formatUsdt(pnl)} (
                      {formatPercent(returnOnEquity(position, positionMark))})
                    </Text>
                  </View>
                  <DetailRows
                    rows={[
                      {
                        label: 'Size',
                        value:
                          formatNumber(position.quantity, 6) + ' ' + symbol,
                      },
                      {
                        label: 'Entry',
                        value: formatUsdt(position.entryPrice),
                      },
                      { label: 'Mark', value: formatUsdt(positionMark) },
                      {
                        label: 'Liq. price',
                        value: formatUsdt(
                          liquidationPrice(
                            position.side,
                            position.entryPrice,
                            position.leverage,
                          ),
                        ),
                        tone: 'danger',
                      },
                      { label: 'Margin', value: formatUsdt(position.margin) },
                      {
                        label: 'TP / SL',
                        value:
                          (position.takeProfit
                            ? formatUsdt(position.takeProfit)
                            : '—') +
                          ' / ' +
                          (position.stopLoss
                            ? formatUsdt(position.stopLoss)
                            : '—'),
                      },
                    ]}
                  />
                  <Button
                    label="Close Position"
                    variant="secondary"
                    style={styles.closeButton}
                    onPress={() => onClose(position.id)}
                  />
                </Card>
              );
            })
          )
        ) : null}

        {tab === 'orders' ? (
          openOrders.length === 0 ? (
            <EmptyState
              title="No open orders"
              message="Limit orders wait here until the mark price reaches them."
            />
          ) : (
            openOrders.map(order => (
              <Card key={order.id} padded style={styles.positionCard}>
                <View style={styles.positionHeader}>
                  <Text variant="subtitle" style={styles.bold}>
                    {findCoin(order.coinId)?.symbol}USDT
                  </Text>
                  <Badge
                    label={
                      (order.side === 'long' ? 'Long ' : 'Short ') +
                      order.leverage +
                      'x'
                    }
                    tone={order.side === 'long' ? 'success' : 'danger'}
                  />
                </View>
                <DetailRows
                  rows={[
                    { label: 'Limit price', value: formatUsdt(order.price) },
                    { label: 'Margin', value: formatUsdt(order.margin) },
                    { label: 'Placed', value: formatDateTime(order.createdAt) },
                  ]}
                />
                <Button
                  label="Cancel"
                  variant="secondary"
                  style={styles.closeButton}
                  onPress={() => {
                    if (cancelFuturesOrder(order.id)) {
                      showToast('Order cancelled');
                    }
                  }}
                />
              </Card>
            ))
          )
        ) : null}

        {tab === 'history' ? (
          history.length === 0 ? (
            <EmptyState
              title="No closed positions"
              message="Closed, stopped and liquidated positions appear here."
            />
          ) : (
            <Card>
              {history.map((closed, index) => {
                const net = closed.pnl - closed.closeFee - closed.openFee;
                return (
                  <View
                    key={closed.id}
                    style={[
                      styles.historyRow,
                      index < history.length - 1 && [
                        styles.divider,
                        { borderBottomColor: theme.colors.border },
                      ],
                    ]}
                  >
                    <View style={styles.grow}>
                      <Text variant="label">
                        {findCoin(closed.coinId)?.symbol}USDT ·{' '}
                        {closed.side === 'long' ? 'Long' : 'Short'}{' '}
                        {closed.leverage}x
                      </Text>
                      <Text variant="caption" tone="muted">
                        {CLOSE_REASONS[closed.reason]} at{' '}
                        {formatUsdt(closed.exitPrice)} ·{' '}
                        {formatDateTime(closed.closedAt)}
                      </Text>
                    </View>
                    <Text
                      variant="label"
                      tone={net >= 0 ? 'success' : 'danger'}
                    >
                      {formatUsdt(net)}
                    </Text>
                  </View>
                );
              })}
            </Card>
          )
        ) : null}
      </ScrollView>

      <ConfirmSheet
        visible={confirming}
        title={'Open ' + side + ' ' + coin.symbol + 'USDT'}
        rows={[
          {
            label: 'Type',
            value: orderType === 'market' ? 'Market' : 'Limit',
          },
          { label: 'Leverage', value: leverage + 'x' },
          { label: 'Margin', value: formatUsdt(margin) },
          ...summary,
        ]}
        confirmLabel={isLong ? 'Open Long' : 'Open Short'}
        confirmVariant={isLong ? 'success' : 'danger'}
        error={error}
        onConfirm={onConfirm}
        onCancel={() => setConfirming(false)}
      />

      <ConfirmSheet
        visible={pickingLeverage}
        title={'Leverage: ' + draftLeverage + 'x'}
        confirmLabel="Apply"
        onConfirm={() => {
          setLeverage(draftLeverage);
          setPickingLeverage(false);
        }}
        onCancel={() => setPickingLeverage(false)}
      >
        <View style={styles.stepper}>
          <Button
            label="−"
            variant="secondary"
            style={styles.stepButton}
            onPress={() => setDraftLeverage(value => Math.max(1, value - 1))}
          />
          <Text variant="title" style={styles.stepValue}>
            {draftLeverage}x
          </Text>
          <Button
            label="+"
            variant="secondary"
            style={styles.stepButton}
            onPress={() =>
              setDraftLeverage(value => Math.min(MAX_LEVERAGE, value + 1))
            }
          />
        </View>
        <View style={styles.presets}>
          {LEVERAGE_PRESETS.map(preset => (
            <Chip
              key={preset}
              label={preset + 'x'}
              selected={preset === draftLeverage}
              onPress={() => setDraftLeverage(preset)}
            />
          ))}
        </View>
        {draftLeverage >= 20 ? (
          <Text variant="caption" tone="danger" style={styles.warning}>
            High leverage: a {formatNumber(100 / draftLeverage, 1)}% move
            against you liquidates the position.
          </Text>
        ) : null}
      </ConfirmSheet>
    </Screen>
  );
}
