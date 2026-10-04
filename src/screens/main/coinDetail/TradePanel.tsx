import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ConfirmSheet } from '../../../components/common/ConfirmSheet';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Text } from '../../../components/ui/Text';
import type { MarketCoin } from '../../../constants/markets';
import { useAccount } from '../../../hooks/useAccount';
import { useLiveQuote } from '../../../hooks/useLiveQuotes';
import { useOrderBook } from '../../../hooks/useMarketDepth';
import { useTheme } from '../../../hooks/useTheme';
import {
  FEE_RATE,
  getAvailableInr,
  getAvailableQuantity,
  type OrderSide,
  type OrderType,
  placeOrder,
} from '../../../services/account';
import type { BookLevel, CoinQuote } from '../../../services/market';
import { fonts } from '../../../theme';
import {
  floorTo,
  formatInr,
  formatNumber,
  formatPrice,
  formatUsdt,
  parseAmount,
  priceDecimals,
  quantityDecimals,
  sanitizeDecimalInput,
} from '../../../utils/format';
import { PercentSlider } from './PercentSlider';

const ORDER_TYPES = [
  { value: 'market', label: 'Market' },
  { value: 'limit', label: 'Limit' },
  { value: 'stopLimit', label: 'Stop-limit' },
] as const;

/** Levels per side; seven keeps the book about as tall as the ticket. */
const BOOK_DEPTH = 7;

/** Stepper increment: about 0.01% of the price, rounded to a power of ten. */
function priceTick(price: number): number {
  return Math.max(
    10 ** -priceDecimals(price),
    10 ** Math.floor(Math.log10(price / 10_000)),
  );
}

export interface TradePanelProps {
  coin: MarketCoin;
  quote: CoinQuote;
  initialSide?: OrderSide;
  /** The "+" beside the balance: add INR to buy, deposit the coin to sell. */
  onAddFunds: (side: OrderSide) => void;
}

/** Live order book on the left, spot order ticket on the right. */
export function TradePanel({
  coin,
  quote,
  initialSide = 'buy',
  onAddFunds,
}: TradePanelProps) {
  const theme = useTheme();
  const { colors } = theme;
  const coinId = coin.id;
  const account = useAccount();
  const book = useOrderBook(coinId, BOOK_DEPTH);
  const usdInr = useLiveQuote('usdt')?.price;

  const [side, setSide] = useState<OrderSide>(initialSide);
  const [type, setType] = useState<OrderType>('market');
  const [priceText, setPriceText] = useState('');
  const [stopText, setStopText] = useState('');
  const [quantityText, setQuantityText] = useState('');
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [typeMenuTop, setTypeMenuTop] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();

  const isBuy = side === 'buy';
  const up = quote.change24h >= 0;
  const qtyDecimals = quantityDecimals(quote.price);
  const pxDecimals = priceDecimals(quote.price);
  const orderPrice = type === 'market' ? quote.price : parseAmount(priceText);
  const quantity = parseAmount(quantityText);
  const total =
    Number.isFinite(orderPrice) && Number.isFinite(quantity)
      ? orderPrice * quantity
      : 0;
  const fee = total * FEE_RATE;
  const availableInr = getAvailableInr(account);
  const availableCoin = getAvailableQuantity(account, coinId);
  const maxQuantity = floorTo(
    Math.max(
      0,
      isBuy
        ? orderPrice > 0
          ? availableInr / (orderPrice * (1 + FEE_RATE))
          : 0
        : availableCoin,
    ),
    qtyDecimals,
  );
  const typeLabel = ORDER_TYPES.find(item => item.value === type)!.label;

  const onChangeType = (next: OrderType) => {
    setType(next);
    setTypeMenuOpen(false);
    if (next !== 'market' && priceText === '') {
      setPriceText(quote.price.toFixed(pxDecimals));
    }
  };

  const onPickPercent = (fraction: number) => {
    const next = floorTo(maxQuantity * fraction, qtyDecimals);
    setQuantityText(next > 0 ? String(next) : '');
  };

  const onPickLevel = (price: number) => {
    if (type === 'market') {
      setType('limit');
    }
    setPriceText(price.toFixed(pxDecimals));
  };

  /** Moves a price field to the next tick above or below its value. */
  const stepPrice = (text: string, direction: 1 | -1) => {
    const tick = priceTick(quote.price);
    const current = parseAmount(text);
    const base = Number.isFinite(current) ? current : quote.price;
    const next =
      direction > 0
        ? Math.floor(base / tick + 1e-9) * tick + tick
        : Math.ceil(base / tick - 1e-9) * tick - tick;
    return Math.max(tick, next).toFixed(pxDecimals);
  };

  const onReview = () => {
    setError(undefined);
    setConfirming(true);
  };

  const onConfirm = () => {
    const result = placeOrder({
      coinId,
      side,
      type,
      quantity,
      price: type === 'market' ? undefined : orderPrice,
      stopPrice: type === 'stopLimit' ? parseAmount(stopText) : undefined,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setConfirming(false);
    setQuantityText('');
    showToast(
      result.value.status === 'filled' ? 'Order filled' : 'Order placed',
      'success',
      (isBuy ? 'Buy ' : 'Sell ') +
        formatNumber(result.value.quantity, 8) +
        ' ' +
        coin.symbol +
        ' @ ' +
        formatPrice(result.value.price),
    );
  };

  const confirmRows = [
    { label: 'Pair', value: coin.symbol + '/INR' },
    {
      label: 'Side',
      value: isBuy ? 'Buy' : 'Sell',
      tone: isBuy ? ('success' as const) : ('danger' as const),
    },
    { label: 'Type', value: typeLabel },
    ...(type === 'stopLimit'
      ? [{ label: 'Stop price', value: formatPrice(parseAmount(stopText)) }]
      : []),
    {
      label: 'Price',
      value:
        type === 'market'
          ? '≈ ' + formatPrice(quote.price)
          : formatPrice(orderPrice),
    },
    {
      label: 'Quantity',
      value: formatNumber(quantity, 8) + ' ' + coin.symbol,
    },
    { label: 'Fee (0.2%)', value: formatInr(fee, 'full') },
    {
      label: isBuy ? 'You pay' : 'You receive',
      value: formatInr(isBuy ? total + fee : total - fee, 'full'),
    },
  ];

  const maxBookQuantity = Math.max(
    ...book.asks.map(level => level.quantity),
    ...book.bids.map(level => level.quantity),
    1e-12,
  );

  const renderLevel = (level: BookLevel, bookSide: 'ask' | 'bid') => {
    const isAsk = bookSide === 'ask';
    return (
      <Pressable
        key={bookSide + '-' + level.price}
        accessibilityRole="button"
        accessibilityLabel={
          (isAsk ? 'Sell order at ' : 'Buy order at ') +
          formatPrice(level.price)
        }
        onPress={() => onPickLevel(level.price)}
        style={styles.level}
      >
        <View
          style={[
            styles.depth,
            {
              backgroundColor: isAsk
                ? colors.dangerSurface
                : colors.successSurface,
              width: `${(level.quantity / maxBookQuantity) * 100}%`,
            },
          ]}
        />
        <Text
          variant="caption"
          tone={isAsk ? 'danger' : 'success'}
          style={styles.levelPrice}
        >
          {formatNumber(level.price, pxDecimals)}
        </Text>
        <Text variant="caption">
          {formatNumber(level.quantity, qtyDecimals)}
        </Text>
      </Pressable>
    );
  };

  const fieldColors = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  };

  return (
    <View style={styles.container}>
      <View style={styles.book}>
        <View style={styles.bookHeader}>
          <Text variant="caption" tone="muted">
            Price
          </Text>
          <Text variant="caption" tone="muted">
            Amount ({coin.symbol})
          </Text>
        </View>
        {[...book.asks].reverse().map(level => renderLevel(level, 'ask'))}
        <View style={styles.mid}>
          <Text
            variant="subtitle"
            tone={up ? 'success' : 'danger'}
            style={styles.midPrice}
          >
            {formatNumber(quote.price, pxDecimals)}
          </Text>
          {usdInr ? (
            <Text variant="caption" tone="muted">
              ≈ {formatUsdt(quote.price / usdInr)}
            </Text>
          ) : null}
        </View>
        {book.bids.map(level => renderLevel(level, 'bid'))}
      </View>

      <View style={styles.ticket}>
        <View style={[styles.sides, { borderColor: colors.border }]}>
          {(['buy', 'sell'] as const).map(option => {
            const selected = option === side;
            const buy = option === 'buy';
            return (
              <Pressable
                key={option}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setSide(option)}
                style={[
                  styles.side,
                  selected && {
                    backgroundColor: buy
                      ? colors.successSurface
                      : colors.dangerSurface,
                    borderColor: buy ? colors.success : colors.danger,
                  },
                ]}
              >
                <Text
                  variant="label"
                  tone={selected ? (buy ? 'success' : 'danger') : 'muted'}
                  style={styles.sideLabel}
                >
                  {buy ? 'Buy' : 'Sell'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={'Order type: ' + typeLabel}
          accessibilityState={{ expanded: typeMenuOpen }}
          onLayout={event =>
            setTypeMenuTop(
              event.nativeEvent.layout.y + event.nativeEvent.layout.height + 4,
            )
          }
          onPress={() => setTypeMenuOpen(open => !open)}
          style={[styles.field, styles.select, fieldColors]}
        >
          <Text variant="label" style={styles.selectLabel}>
            {typeLabel}
          </Text>
          <Icon name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>

        {type === 'stopLimit' ? (
          <PriceField
            label="Stop price"
            value={stopText}
            onChangeText={text =>
              setStopText(sanitizeDecimalInput(text, pxDecimals))
            }
            onStep={direction => setStopText(stepPrice(stopText, direction))}
          />
        ) : null}

        {type === 'market' ? (
          <View style={[styles.field, fieldColors]}>
            <Text variant="label" tone="muted">
              Market price
            </Text>
          </View>
        ) : (
          <PriceField
            label="Limit price"
            value={priceText}
            onChangeText={text =>
              setPriceText(sanitizeDecimalInput(text, pxDecimals))
            }
            onStep={direction => setPriceText(stepPrice(priceText, direction))}
          />
        )}

        <View style={[styles.field, fieldColors]}>
          <View style={styles.fieldBody}>
            <Text variant="caption" tone="muted">
              Amount
            </Text>
            <TextInput
              accessibilityLabel={'Amount in ' + coin.symbol}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={quantityText}
              onChangeText={text =>
                setQuantityText(sanitizeDecimalInput(text, qtyDecimals))
              }
              style={[
                theme.typography.label,
                styles.fieldInput,
                { color: colors.text },
              ]}
            />
          </View>
          <Text variant="label" tone="muted">
            {coin.symbol}
          </Text>
        </View>

        <View style={styles.meta}>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            ≈ {formatInr(total, 'full')}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            Max {formatNumber(maxQuantity, qtyDecimals)}
          </Text>
        </View>

        <PercentSlider
          value={maxQuantity > 0 && quantity > 0 ? quantity / maxQuantity : 0}
          onChange={onPickPercent}
        />

        <View style={styles.meta}>
          <Text variant="caption" tone="muted">
            Available
          </Text>
          <View style={styles.metaValue}>
            <Text variant="caption" style={styles.strong} numberOfLines={1}>
              {isBuy
                ? formatInr(availableInr, 'full')
                : formatNumber(availableCoin, qtyDecimals) + ' ' + coin.symbol}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isBuy ? 'Add INR' : 'Deposit ' + coin.symbol}
              hitSlop={8}
              onPress={() => onAddFunds(side)}
            >
              <Icon name="plus" size={14} color={colors.primary} />
            </Pressable>
          </View>
        </View>
        <View style={styles.meta}>
          <Text variant="caption" tone="muted">
            Fee (0.2%)
          </Text>
          <Text variant="caption" style={styles.strong}>
            {formatInr(fee, 'full')}
          </Text>
        </View>

        <Button
          label={(isBuy ? 'Buy ' : 'Sell ') + coin.symbol}
          variant={isBuy ? 'success' : 'danger'}
          disabled={!(quantity > 0) || !(orderPrice > 0)}
          onPress={onReview}
          style={styles.submit}
        />

        {typeMenuOpen ? (
          <>
            <Pressable
              accessibilityLabel="Close order types"
              style={StyleSheet.absoluteFill}
              onPress={() => setTypeMenuOpen(false)}
            />
            <View
              style={[
                styles.menu,
                {
                  top: typeMenuTop,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {ORDER_TYPES.map(option => {
                const selected = option.value === type;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => onChangeType(option.value)}
                    style={styles.menuItem}
                  >
                    <Text
                      variant="label"
                      tone={selected ? 'primary' : 'default'}
                    >
                      {option.label}
                    </Text>
                    {selected ? (
                      <Icon name="check" size={14} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
      </View>

      <ConfirmSheet
        visible={confirming}
        title={'Confirm ' + (isBuy ? 'buy' : 'sell') + ' order'}
        rows={confirmRows}
        confirmLabel={(isBuy ? 'Buy ' : 'Sell ') + coin.symbol}
        confirmVariant={isBuy ? 'success' : 'danger'}
        error={error}
        onConfirm={onConfirm}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}

interface PriceFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onStep: (direction: 1 | -1) => void;
}

/** Price input with − / + buttons that move it one tick. */
function PriceField({ label, value, onChangeText, onStep }: PriceFieldProps) {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        styles.field,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.fieldBody}>
        <Text variant="caption" tone="muted">
          {label}
        </Text>
        <TextInput
          accessibilityLabel={label}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={value}
          onChangeText={onChangeText}
          style={[
            theme.typography.label,
            styles.fieldInput,
            { color: colors.text },
          ]}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={'Lower ' + label.toLowerCase()}
        hitSlop={4}
        onPress={() => onStep(-1)}
        style={styles.stepButton}
      >
        <Icon name="minus" size={16} color={colors.textMuted} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={'Raise ' + label.toLowerCase()}
        hitSlop={4}
        onPress={() => onStep(1)}
        style={styles.stepButton}
      >
        <Icon name="plus" size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  book: {
    flex: 1,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  level: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  depth: {
    position: 'absolute',
    right: 0,
    top: 1,
    bottom: 1,
    borderRadius: 2,
  },
  levelPrice: {
    fontFamily: fonts.semiBold,
  },
  mid: {
    paddingVertical: 8,
  },
  midPrice: {
    fontFamily: fonts.bold,
  },
  ticket: {
    flex: 1.25,
    gap: 8,
  },
  sides: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    padding: 2,
  },
  side: {
    flex: 1,
    minHeight: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideLabel: {
    fontFamily: fonts.bold,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  select: {
    minHeight: 40,
  },
  selectLabel: {
    flex: 1,
  },
  fieldBody: {
    flex: 1,
    paddingVertical: 5,
  },
  fieldInput: {
    padding: 0,
    fontFamily: fonts.semiBold,
  },
  stepButton: {
    width: 28,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  metaValue: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  strong: {
    flexShrink: 1,
    fontFamily: fonts.semiBold,
  },
  submit: {
    minHeight: 44,
    marginTop: 2,
  },
  menu: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
    paddingHorizontal: 10,
  },
});
