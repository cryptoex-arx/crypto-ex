import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import type { IconName } from '../../../components/ui/icons';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen, TAB_SCREEN_EDGES } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useTheme } from '../../../hooks/useTheme';
import type { MainTabScreenProps } from '../../../navigation/types';
import { styles } from './styles';

const HIDDEN_VALUE = '••••••';

const QUICK_ACTIONS: readonly {
  label: string;
  icon?: IconName;
  glyph?: string;
  tone?: 'success' | 'danger';
}[] = [
  { label: 'Add INR', glyph: '₹' },
  { label: 'Deposit', icon: 'arrow-down', tone: 'success' },
  { label: 'Withdraw', icon: 'arrow-up', tone: 'danger' },
  { label: 'Transfer', icon: 'transfer' },
];

const ALLOCATION = [
  { label: 'BTC', percent: 65, color: '#F7931A' },
  { label: 'ETH', percent: 18, color: '#627EEA' },
  { label: 'SOL', percent: 12, color: '#9945FF' },
  { label: 'Others', percent: 5, color: '#FFB020' },
] as const;

const ASSETS = [
  {
    symbol: 'B',
    name: 'Bitcoin',
    color: '#F7931A',
    holding: '0.0142 BTC',
    value: '₹99,845',
    change: '+₹2,340',
    up: true,
  },
  {
    symbol: 'E',
    name: 'Ethereum',
    color: '#627EEA',
    holding: '0.45 ETH',
    value: '₹18,234',
    change: '-₹412',
    up: false,
  },
  {
    symbol: 'S',
    name: 'Solana',
    color: '#9945FF',
    holding: '2.5 SOL',
    value: '₹5,521',
    change: '+₹890',
    up: true,
  },
  {
    symbol: 'T',
    name: 'USDT',
    color: '#26A17B',
    holding: '12.40 USDT',
    value: '₹982',
    change: '₹0',
    up: true,
  },
] as const;

const DONUT_RADIUS = 46;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

/** Total balance, allocation breakdown and per-asset holdings. */
export function PortfolioScreen(_props: MainTabScreenProps<'Portfolio'>) {
  const theme = useTheme();
  const [visible, setVisible] = useState(true);

  let sweptPercent = 0;

  return (
    <Screen edges={TAB_SCREEN_EDGES}>
      <ScreenHeader
        title="Portfolio"
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide balances' : 'Show balances'}
            hitSlop={10}
            onPress={() => setVisible(current => !current)}
          >
            <Icon name="eye" size={18} color={theme.colors.textMuted} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="overline" tone="muted" style={styles.balanceLabel}>
          TOTAL BALANCE
        </Text>
        <Text variant="display" style={styles.balance}>
          {visible ? '₹1,24,582.40' : HIDDEN_VALUE}
        </Text>
        <Text variant="body" tone="muted" style={styles.balanceAlt}>
          {visible ? '≈ $1,481.93' : HIDDEN_VALUE}
        </Text>
        <Text variant="label" tone="success" style={styles.change}>
          ▲ ₹4.46 +0.76% today
        </Text>

        <View style={styles.actions}>
          {QUICK_ACTIONS.map(action => (
            <Card key={action.label} style={styles.action}>
              <View>
                {action.glyph ? (
                  <Text variant="subtitle" style={styles.actionGlyph}>
                    {action.glyph}
                  </Text>
                ) : (
                  <Icon
                    name={action.icon as IconName}
                    size={18}
                    color={
                      action.tone === 'success'
                        ? theme.colors.success
                        : action.tone === 'danger'
                        ? theme.colors.danger
                        : theme.colors.primary
                    }
                  />
                )}
              </View>
              <Text variant="caption" style={styles.actionLabel}>
                {action.label}
              </Text>
            </Card>
          ))}
        </View>

        <Card style={styles.allocation}>
          <View style={styles.donut}>
            <Svg width={96} height={96} viewBox="0 0 120 120">
              {ALLOCATION.map(slice => {
                const length = (slice.percent / 100) * DONUT_CIRCUMFERENCE;
                const offset = (-sweptPercent / 100) * DONUT_CIRCUMFERENCE;
                sweptPercent += slice.percent;

                return (
                  <Circle
                    key={slice.label}
                    cx={60}
                    cy={60}
                    r={DONUT_RADIUS}
                    stroke={slice.color}
                    strokeWidth={14}
                    fill="none"
                    strokeDasharray={
                      length + ' ' + (DONUT_CIRCUMFERENCE - length)
                    }
                    strokeDashoffset={offset}
                    transform="rotate(-90 60 60)"
                  />
                );
              })}
            </Svg>
            <View style={styles.donutCenter}>
              <Text variant="caption" tone="muted">
                Total
              </Text>
              <Text variant="label" style={styles.donutTotal}>
                {visible ? '₹1.24L' : HIDDEN_VALUE}
              </Text>
            </View>
          </View>

          <View style={styles.legend}>
            {ALLOCATION.map(slice => (
              <View key={slice.label} style={styles.legendRow}>
                <View
                  style={[styles.legendDot, { backgroundColor: slice.color }]}
                />
                <Text variant="body" style={styles.legendLabel}>
                  {slice.label}
                </Text>
                <Text variant="body" tone="muted">
                  {slice.percent}%
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Text variant="subtitle" style={styles.assetsTitle}>
          My Assets
        </Text>
        <Card>
          {ASSETS.map((asset, index) => (
            <ListRow
              key={asset.name}
              leading={<CoinAvatar symbol={asset.symbol} color={asset.color} />}
              title={asset.name}
              subtitle={asset.holding}
              value={visible ? asset.value : HIDDEN_VALUE}
              meta={visible ? asset.change : undefined}
              metaTone={asset.up ? 'success' : 'danger'}
              divider={index < ASSETS.length - 1}
            />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
