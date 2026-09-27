import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { Screen, TAB_SCREEN_EDGES } from '../../../components/ui/Screen';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { Text, type TextTone } from '../../../components/ui/Text';
import { useTheme } from '../../../hooks/useTheme';
import type { MainTabScreenProps } from '../../../navigation/types';
import { styles } from './styles';

type OrderType = 'market' | 'limit' | 'stop';
type PositionSide = 'long' | 'short';

const ORDER_TYPES = [
  { value: 'market', label: 'Market' },
  { value: 'limit', label: 'Limit' },
  { value: 'stop', label: 'Stop' },
] as const;

const TICKER: readonly { label: string; value: string; tone: TextTone }[] = [
  { label: 'Mark Price', value: '$84,230', tone: 'default' },
  { label: '24h Change', value: '-2.14%', tone: 'danger' },
  { label: 'Funding', value: '+0.01%', tone: 'success' },
];

const SUMMARY: readonly { label: string; value: string; tone: TextTone }[] = [
  { label: 'Position Size', value: '$10,000', tone: 'default' },
  { label: 'Margin', value: '$1,000', tone: 'default' },
  { label: 'Liq Price', value: '$75,807', tone: 'danger' },
  { label: 'Est. Profit', value: '+$2,140', tone: 'success' },
];

/** Perpetual futures order ticket for the BTC/USDT contract. */
export function FuturesScreen(_props: MainTabScreenProps<'Futures'>) {
  const theme = useTheme();
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [side, setSide] = useState<PositionSide>('long');
  const [amount, setAmount] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');

  const isLong = side === 'long';

  return (
    <Screen edges={TAB_SCREEN_EDGES}>
      <ScreenHeader
        title="BTC/USDT Perp"
        leading={<CoinAvatar symbol="B" color="#F7931A" size={22} />}
        trailing={<Icon name="info" size={18} color={theme.colors.textMuted} />}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <View style={styles.ticker}>
            {TICKER.map((item, index) => (
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
                  tone={item.tone}
                  style={styles.tickerValue}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.segments}>
          <SegmentedControl
            options={ORDER_TYPES}
            value={orderType}
            onChange={setOrderType}
          />
        </View>

        <View style={styles.sides}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isLong }}
            onPress={() => setSide('long')}
            style={[
              styles.sideButton,
              {
                backgroundColor: isLong
                  ? theme.colors.success
                  : theme.colors.surface,
                borderColor: isLong
                  ? theme.colors.success
                  : theme.colors.border,
              },
            ]}
          >
            <Text
              variant="body"
              tone={isLong ? 'inverted' : 'muted'}
              style={styles.sideLabel}
            >
              Long / Buy
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: !isLong }}
            onPress={() => setSide('short')}
            style={[
              styles.sideButton,
              {
                backgroundColor: isLong
                  ? theme.colors.surface
                  : theme.colors.danger,
                borderColor: isLong ? theme.colors.border : theme.colors.danger,
              },
            ]}
          >
            <Text
              variant="body"
              tone={isLong ? 'muted' : 'inverted'}
              style={styles.sideLabel}
            >
              Short / Sell
            </Text>
          </Pressable>
        </View>

        <Text variant="overline" tone="muted" style={styles.fieldLabel}>
          LEVERAGE
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change leverage"
          style={[
            styles.select,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text variant="body" style={styles.selectValue}>
            10x
          </Text>
          <Text variant="body" tone="muted" style={styles.selectHint}>
            leverage
          </Text>
          <Icon name="chevron-down" size={18} color={theme.colors.textMuted} />
        </Pressable>

        <Text variant="overline" tone="muted" style={styles.fieldLabel}>
          AMOUNT (USDT)
        </Text>
        <Input
          accessibilityLabel="Amount in USDT"
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Text variant="overline" tone="muted" style={styles.fieldLabel}>
          TAKE PROFIT
        </Text>
        <Input
          accessibilityLabel="Take profit price"
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={takeProfit}
          onChangeText={setTakeProfit}
        />

        <Text variant="overline" tone="muted" style={styles.fieldLabel}>
          STOP LOSS
        </Text>
        <Input
          accessibilityLabel="Stop loss price"
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={stopLoss}
          onChangeText={setStopLoss}
        />

        <Card style={styles.summary}>
          {SUMMARY.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.summaryRow,
                index < SUMMARY.length - 1 && [
                  styles.summaryDivider,
                  { borderBottomColor: theme.colors.border },
                ],
              ]}
            >
              <Text variant="body" tone="muted">
                {item.label}
              </Text>
              <Text variant="body" tone={item.tone} style={styles.summaryValue}>
                {item.value}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
