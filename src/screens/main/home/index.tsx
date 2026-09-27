import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import type { IconName } from '../../../components/ui/icons';
import { Screen, TAB_SCREEN_EDGES } from '../../../components/ui/Screen';
import { SearchField } from '../../../components/ui/SearchField';
import { Text } from '../../../components/ui/Text';
import { useTheme } from '../../../hooks/useTheme';
import type { MainTabScreenProps } from '../../../navigation/types';
import { styles } from './styles';

type Surface = 'exchange' | 'web3';

interface QuickAction {
  label: string;
  icon: IconName;
  tint?: 'success' | 'warning';
  /** The only destination that exists so far; the rest await their screens. */
  opensMarkets?: boolean;
}

const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: 'Coins', icon: 'dollar-sign', opensMarkets: true },
  { label: 'SIP', icon: 'trending-up', tint: 'success' },
  { label: 'Markets', icon: 'bar-chart', opensMarkets: true },
  { label: 'Earn', icon: 'zap', tint: 'warning' },
  { label: 'More', icon: 'more' },
];

interface BasketHolding {
  symbol: string;
  color?: string;
}

interface CoinBasket {
  id: string;
  name: string;
  coins: string;
  change: string;
  minimum: string;
  holdings: readonly BasketHolding[];
}

const BASKETS: readonly CoinBasket[] = [
  {
    id: 'defi-top-5',
    name: 'DeFi Top 5',
    coins: '5 coins',
    change: '+4.2% 24h',
    minimum: 'Min ₹500',
    holdings: [
      { symbol: 'UNI' },
      { symbol: 'AAVE', color: '#B6509E' },
      { symbol: 'ETH', color: '#627EEA' },
      { symbol: 'MKR' },
    ],
  },
  {
    id: 'layer-1-leaders',
    name: 'Layer 1 Leaders',
    coins: '5 coins',
    change: '+2.8% 24h',
    minimum: 'Min ₹1,000',
    holdings: [
      { symbol: 'BTC', color: '#F7931A' },
      { symbol: 'ETH', color: '#627EEA' },
      { symbol: 'SOL', color: '#9945FF' },
      { symbol: 'ADA', color: '#0033AD' },
    ],
  },
  {
    id: 'metaverse',
    name: 'Metaverse Bets',
    coins: '4 coins',
    change: '+1.6% 24h',
    minimum: 'Min ₹500',
    holdings: [
      { symbol: 'SAND' },
      { symbol: 'MANA' },
      { symbol: 'AXS', color: '#0055D5' },
      { symbol: 'IMX' },
    ],
  },
];

const EXPERT_PICKS = [
  {
    id: 'eth-short',
    symbol: 'ETH',
    color: '#627EEA',
    position: 'Short 14x',
    long: false,
    validTill: 'Valid till 28 Mar',
    entry: '$1,842',
    expected: '+39% expected',
  },
  {
    id: 'sol-long',
    symbol: 'SOL',
    color: '#9945FF',
    position: 'Long 8x',
    long: true,
    validTill: 'Valid till 30 Mar',
    entry: '$132.50',
    expected: '+24% expected',
  },
] as const;

/** Landing tab: PNL, shortcuts, curated baskets and expert trade ideas. */
export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const theme = useTheme();
  const [surface, setSurface] = useState<Surface>('exchange');

  const tintFor = (tint: QuickAction['tint']) => {
    if (tint === 'success') {
      return theme.colors.success;
    }

    return tint === 'warning' ? '#F5A524' : theme.colors.primary;
  };

  return (
    <Screen edges={TAB_SCREEN_EDGES}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account"
          onPress={() => navigation.navigate('Account')}
          style={[
            styles.avatar,
            { backgroundColor: theme.colors.surfaceStrong },
          ]}
        >
          <Icon name="user" size={18} />
        </Pressable>

        <View style={styles.segments}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: surface === 'exchange' }}
            onPress={() => setSurface('exchange')}
          >
            <Text
              variant="subtitle"
              tone={surface === 'exchange' ? 'default' : 'muted'}
              style={styles.segmentLabel}
            >
              Exchange
            </Text>
          </Pressable>
          <View
            style={[
              styles.segmentSeparator,
              { backgroundColor: theme.colors.border },
            ]}
          />
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: surface === 'web3' }}
            onPress={() => setSurface('web3')}
          >
            <Text
              variant="subtitle"
              tone={surface === 'web3' ? 'default' : 'muted'}
              style={styles.segmentLabel}
            >
              Web3
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Price alerts"
          hitSlop={10}
          onPress={() => navigation.navigate('PriceAlerts')}
          style={styles.bell}
        >
          <View>
            <Icon name="bell" size={20} />
            <View
              style={[styles.bellDot, { backgroundColor: theme.colors.danger }]}
            />
          </View>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.pnlCard,
            {
              backgroundColor: theme.colors.successSurface,
              borderColor: theme.colors.successSurface,
            },
          ]}
        >
          <View style={styles.pnlBody}>
            <Text variant="caption" tone="muted">
              Today&apos;s PNL
            </Text>
            <Text style={styles.pnlValue}>₹4.46</Text>
          </View>
          <View
            style={[
              styles.pnlPill,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <Text variant="body" tone="success" style={styles.pnlPillLabel}>
              ▲ 0.76%
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="search"
          accessibilityLabel="Search coins and pairs"
          style={styles.search}
          onPress={() => navigation.navigate('Markets')}
        >
          <View pointerEvents="none">
            <SearchField
              placeholder="Search coins, pairs..."
              editable={false}
              trailing={
                <Text variant="label" tone="success" style={styles.trending}>
                  🔥 LPT
                </Text>
              }
            />
          </View>
        </Pressable>

        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map(action => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              style={styles.quickAction}
              onPress={
                action.opensMarkets
                  ? () => navigation.navigate('Markets')
                  : undefined
              }
            >
              <View
                style={[
                  styles.quickActionTile,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Icon
                  name={action.icon}
                  size={20}
                  color={tintFor(action.tint)}
                />
              </View>
              <Text variant="caption" style={styles.quickActionLabel}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.fundingRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Portfolio')}
            style={[
              styles.fundingCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.fundingTile,
                { backgroundColor: theme.colors.surfaceStrong },
              ]}
            >
              <Text variant="body" tone="primary" style={styles.fundingGlyph}>
                ₹
              </Text>
            </View>
            <View>
              <Text variant="body" tone="primary" style={styles.fundingTitle}>
                Add INR
              </Text>
              <Text variant="caption" tone="muted">
                ₹598 balance
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Portfolio')}
            style={[
              styles.fundingCard,
              {
                backgroundColor: theme.colors.successSurface,
                borderColor: theme.colors.successSurface,
              },
            ]}
          >
            <View
              style={[
                styles.fundingTile,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Icon name="arrow-up" size={18} color={theme.colors.success} />
            </View>
            <View>
              <Text variant="body" tone="success" style={styles.fundingTitle}>
                Deposit Crypto
              </Text>
              <Text variant="caption" tone="muted">
                Instant
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            Coin Basket
          </Text>
          <Pressable accessibilityRole="button">
            <Text variant="label" tone="primary" style={styles.sectionAction}>
              See all
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carouselScroll}
          contentContainerStyle={styles.carousel}
        >
          {BASKETS.map(basket => (
            <Card key={basket.id} style={styles.basketCard}>
              <View style={styles.stack}>
                {basket.holdings.map(holding => (
                  <View key={holding.symbol} style={styles.stackAvatar}>
                    <CoinAvatar
                      symbol={holding.symbol}
                      color={holding.color}
                      size={22}
                    />
                  </View>
                ))}
                <Text variant="caption" tone="muted" style={styles.stackMore}>
                  +1
                </Text>
              </View>

              <Text variant="body" style={styles.basketName}>
                {basket.name}
              </Text>
              <Text variant="caption" tone="muted" style={styles.basketMeta}>
                {basket.coins}
              </Text>

              <View style={styles.basketStats}>
                <Text
                  variant="label"
                  tone="success"
                  style={styles.basketChange}
                >
                  {basket.change}
                </Text>
                <Text variant="caption" tone="muted">
                  {basket.minimum}
                </Text>
              </View>

              <Button
                label="Invest"
                variant="secondary"
                style={[
                  styles.investButton,
                  { backgroundColor: theme.colors.surfaceStrong },
                ]}
              />
            </Card>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            Expert Picks
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carouselScroll}
          contentContainerStyle={styles.carousel}
        >
          {EXPERT_PICKS.map(pick => (
            <Card key={pick.id} style={styles.pickCard}>
              <View style={styles.pickHeader}>
                <CoinAvatar symbol={pick.symbol} color={pick.color} size={28} />
                <Text variant="body" style={styles.pickSymbol}>
                  {pick.symbol}
                </Text>
                <Badge
                  label={pick.position}
                  tone={pick.long ? 'success' : 'danger'}
                />
              </View>

              <Text variant="caption" tone="muted" style={styles.pickMeta}>
                {pick.validTill}
              </Text>
              <Text variant="caption" tone="muted" style={styles.pickEntry}>
                Entry{' '}
                <Text variant="caption" style={styles.pickValue}>
                  {pick.entry}
                </Text>
              </Text>

              <Text variant="label" tone="success" style={styles.pickExpected}>
                {pick.expected}
              </Text>
            </Card>
          ))}
        </ScrollView>
      </ScrollView>
    </Screen>
  );
}
