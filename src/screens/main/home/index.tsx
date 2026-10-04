import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { EmptyState } from '../../../components/common/EmptyState';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import type { IconName } from '../../../components/ui/icons';
import { Screen, TAB_SCREEN_EDGES } from '../../../components/ui/Screen';
import { SearchField } from '../../../components/ui/SearchField';
import { Text } from '../../../components/ui/Text';
import { BASKETS } from '../../../constants/baskets';
import { findCoin, MARKET_COINS } from '../../../constants/markets';
import { useLiveQuotes } from '../../../hooks/useLiveQuotes';
import { useMoney } from '../../../hooks/useMoney';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import type {
  MainTabScreenProps,
  ParamlessRoute,
} from '../../../navigation/types';
import { useOpenRoute } from '../../../navigation/useOpenRoute';
import {
  basketChange,
  getMarkPrice,
  type PositionSide,
} from '../../../services/account';
import {
  notificationsStore,
  unreadCount,
} from '../../../services/notifications';
import { settingsStore } from '../../../services/settings';
import { formatInr, formatPercent, formatUsdt } from '../../../utils/format';
import { styles } from './styles';

type Surface = 'exchange' | 'web3';

interface QuickAction {
  label: string;
  icon: IconName;
  tint?: 'success' | 'warning';
  route?: ParamlessRoute;
  tab?: 'Markets' | 'Futures';
}

const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: 'Coins', icon: 'dollar-sign', tab: 'Markets' },
  { label: 'SIP', icon: 'trending-up', tint: 'success', route: 'Sip' },
  { label: 'Futures', icon: 'bar-chart', tab: 'Futures' },
  { label: 'Earn', icon: 'zap', tint: 'warning', route: 'Earn' },
  { label: 'More', icon: 'more', route: 'More' },
];

interface ExpertPick {
  id: string;
  coinId: string;
  side: PositionSide;
  leverage: number;
  validTill: string;
  expected: string;
}

const EXPERT_PICKS: readonly ExpertPick[] = [
  {
    id: 'eth-short',
    coinId: 'eth',
    side: 'short',
    leverage: 14,
    validTill: 'Valid till 30 Sep',
    expected: '+39% expected',
  },
  {
    id: 'sol-long',
    coinId: 'sol',
    side: 'long',
    leverage: 8,
    validTill: 'Valid till 2 Oct',
    expected: '+24% expected',
  },
];

const HIDDEN_VALUE = '••••';

/** The top gainer right now, shown as a trending hint in the search box. */
function topGainer(quotes: ReturnType<typeof useLiveQuotes>) {
  return MARKET_COINS.filter(coin => !coin.stable).reduce((best, coin) =>
    (quotes[coin.id]?.change24h ?? 0) > (quotes[best.id]?.change24h ?? 0)
      ? coin
      : best,
  );
}

/** Landing tab: PNL, shortcuts, curated baskets and expert trade ideas. */
export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const theme = useTheme();
  const money = useMoney();
  const quotes = useLiveQuotes();
  const portfolio = usePortfolio();
  const openRoute = useOpenRoute();
  const { hideBalances } = useStore(settingsStore);
  const unread = unreadCount(useStore(notificationsStore));
  const [surface, setSurface] = useState<Surface>('exchange');
  const trending = topGainer(quotes);
  const up = portfolio.dayChange >= 0;

  const tintFor = (tint: QuickAction['tint']) => {
    if (tint === 'success') {
      return theme.colors.success;
    }

    return tint === 'warning' ? '#F5A524' : theme.colors.primary;
  };

  const onQuickAction = (action: QuickAction) => {
    if (action.tab) {
      navigation.navigate(action.tab);
    } else if (action.route) {
      openRoute(action.route);
    }
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
          accessibilityLabel={
            unread > 0 ? unread + ' unread notifications' : 'Notifications'
          }
          hitSlop={10}
          onPress={() => navigation.navigate('Notifications')}
          style={styles.bell}
        >
          <View>
            <Icon name="bell" size={20} />
            {unread > 0 ? (
              <View
                style={[
                  styles.bellDot,
                  { backgroundColor: theme.colors.danger },
                ]}
              />
            ) : null}
          </View>
        </Pressable>
      </View>

      {surface === 'web3' ? (
        <View style={styles.web3}>
          <EmptyState
            title="Web3 wallet is coming soon"
            message="A self-custody wallet for DeFi and NFTs will live here. Your exchange account is unaffected."
          />
          <Button
            label="Back to Exchange"
            variant="secondary"
            onPress={() => setSurface('exchange')}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Portfolio')}
            style={[
              styles.pnlCard,
              {
                backgroundColor: up
                  ? theme.colors.successSurface
                  : theme.colors.dangerSurface,
                borderColor: up
                  ? theme.colors.successSurface
                  : theme.colors.dangerSurface,
              },
            ]}
          >
            <View style={styles.pnlBody}>
              <Text variant="caption" tone="muted">
                Today&apos;s PNL
              </Text>
              <Text style={styles.pnlValue}>
                {hideBalances
                  ? HIDDEN_VALUE
                  : money.formatSigned(portfolio.dayChange)}
              </Text>
            </View>
            <View
              style={[
                styles.pnlPill,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Text
                variant="body"
                tone={up ? 'success' : 'danger'}
                style={styles.pnlPillLabel}
              >
                {up ? '▲ ' : '▼ '}
                {formatPercent(Math.abs(portfolio.dayChangePercent))}
              </Text>
            </View>
          </Pressable>

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
                    🔥 {trending.symbol}
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
                onPress={() => onQuickAction(action)}
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
              onPress={() => navigation.navigate('AddInr')}
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
                  {hideBalances
                    ? HIDDEN_VALUE
                    : formatInr(portfolio.availableInr) + ' balance'}
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate('SelectAsset', { mode: 'deposit' })
              }
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
                <Icon
                  name="arrow-down"
                  size={18}
                  color={theme.colors.success}
                />
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
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Baskets')}
            >
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
            {BASKETS.map(basket => {
              const change = basketChange(basket.id, quotes);
              const open = () =>
                navigation.navigate('BasketDetail', { basketId: basket.id });
              return (
                <Pressable
                  key={basket.id}
                  accessibilityRole="button"
                  onPress={open}
                >
                  <Card style={styles.basketCard}>
                    <View style={styles.stack}>
                      {basket.components.slice(0, 4).map(component => {
                        const coin = findCoin(component.coinId);
                        return (
                          <View
                            key={component.coinId}
                            style={styles.stackAvatar}
                          >
                            <CoinAvatar
                              symbol={coin?.symbol ?? ''}
                              color={coin?.color}
                              size={22}
                            />
                          </View>
                        );
                      })}
                      {basket.components.length > 4 ? (
                        <Text
                          variant="caption"
                          tone="muted"
                          style={styles.stackMore}
                        >
                          +{basket.components.length - 4}
                        </Text>
                      ) : null}
                    </View>

                    <Text variant="body" style={styles.basketName}>
                      {basket.name}
                    </Text>
                    <Text
                      variant="caption"
                      tone="muted"
                      style={styles.basketMeta}
                    >
                      {basket.components.length} coins
                    </Text>

                    <View style={styles.basketStats}>
                      <Text
                        variant="label"
                        tone={change >= 0 ? 'success' : 'danger'}
                        style={styles.basketChange}
                      >
                        {formatPercent(change)} 24h
                      </Text>
                      <Text variant="caption" tone="muted">
                        Min {formatInr(basket.minInvestment)}
                      </Text>
                    </View>

                    <Button
                      label="Invest"
                      variant="secondary"
                      onPress={open}
                      style={[
                        styles.investButton,
                        { backgroundColor: theme.colors.surfaceStrong },
                      ]}
                    />
                  </Card>
                </Pressable>
              );
            })}
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
            {EXPERT_PICKS.map(pick => {
              const coin = findCoin(pick.coinId);
              const mark = getMarkPrice(pick.coinId, quotes);
              const long = pick.side === 'long';
              return (
                <Pressable
                  key={pick.id}
                  accessibilityRole="button"
                  onPress={() =>
                    navigation.navigate('Futures', {
                      coinId: pick.coinId,
                      side: pick.side,
                      leverage: pick.leverage,
                    })
                  }
                >
                  <Card style={styles.pickCard}>
                    <View style={styles.pickHeader}>
                      <CoinAvatar
                        symbol={coin?.symbol ?? ''}
                        color={coin?.color}
                        size={28}
                      />
                      <Text variant="body" style={styles.pickSymbol}>
                        {coin?.symbol}
                      </Text>
                      <Badge
                        label={
                          (long ? 'Long ' : 'Short ') + pick.leverage + 'x'
                        }
                        tone={long ? 'success' : 'danger'}
                      />
                    </View>

                    <Text
                      variant="caption"
                      tone="muted"
                      style={styles.pickMeta}
                    >
                      {pick.validTill}
                    </Text>
                    <Text
                      variant="caption"
                      tone="muted"
                      style={styles.pickEntry}
                    >
                      Mark{' '}
                      <Text variant="caption" style={styles.pickValue}>
                        {mark !== undefined ? formatUsdt(mark) : '—'}
                      </Text>
                    </Text>

                    <Text
                      variant="label"
                      tone="success"
                      style={styles.pickExpected}
                    >
                      {pick.expected}
                    </Text>
                  </Card>
                </Pressable>
              );
            })}
          </ScrollView>
        </ScrollView>
      )}
    </Screen>
  );
}
