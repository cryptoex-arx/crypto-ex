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
import { useMoney } from '../../../hooks/useMoney';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import type {
  MainTabScreenProps,
  ParamlessRoute,
} from '../../../navigation/types';
import { useOpenRoute } from '../../../navigation/useOpenRoute';
import { settingsStore, updateSettings } from '../../../services/settings';
import { formatNumber, formatPercent } from '../../../utils/format';
import { styles } from './styles';

const HIDDEN_VALUE = '••••••';
const INR_COLOR = '#1B8A5A';
const OTHERS_COLOR = '#FFB020';
/** Slices before the rest are grouped as "Others". */
const TOP_SLICES = 3;

type QuickAction = {
  label: string;
  icon?: IconName;
  glyph?: string;
  tone?: 'success' | 'danger';
} & ({ route: ParamlessRoute } | { select: 'deposit' | 'withdraw' });

const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: 'Add INR', glyph: '₹', route: 'AddInr' },
  { label: 'Deposit', icon: 'arrow-down', tone: 'success', select: 'deposit' },
  { label: 'Withdraw', icon: 'arrow-up', tone: 'danger', select: 'withdraw' },
  { label: 'Transfer', icon: 'transfer', route: 'Transfer' },
];

const DONUT_RADIUS = 46;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

/** Total balance, allocation breakdown and per-asset holdings. */
export function PortfolioScreen({
  navigation,
}: MainTabScreenProps<'Portfolio'>) {
  const theme = useTheme();
  const money = useMoney();
  const portfolio = usePortfolio();
  const openRoute = useOpenRoute();
  const { hideBalances } = useStore(settingsStore);
  const show = (text: string) => (hideBalances ? HIDDEN_VALUE : text);

  const slices = [
    { label: 'INR', value: portfolio.inrBalance, color: INR_COLOR },
    ...portfolio.assets.map(asset => ({
      label: asset.coin.symbol,
      value: asset.value,
      color: asset.coin.color ?? theme.colors.textMuted,
    })),
    ...(portfolio.futuresValue > 0
      ? [
          {
            label: 'Futures',
            value: portfolio.futuresValue,
            color: theme.colors.primary,
          },
        ]
      : []),
  ].sort((a, b) => b.value - a.value);
  const top = slices.slice(0, TOP_SLICES);
  const others = slices.slice(TOP_SLICES).reduce((sum, s) => sum + s.value, 0);
  const allocation = [
    ...top,
    ...(others > 0
      ? [{ label: 'Others', value: others, color: OTHERS_COLOR }]
      : []),
  ].map(slice => ({
    ...slice,
    percent: portfolio.total > 0 ? (slice.value / portfolio.total) * 100 : 0,
  }));
  let sweptPercent = 0;

  const up = portfolio.dayChange >= 0;

  return (
    <Screen edges={TAB_SCREEN_EDGES}>
      <ScreenHeader
        title="Portfolio"
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hideBalances ? 'Show balances' : 'Hide balances'
            }
            hitSlop={10}
            onPress={() => updateSettings({ hideBalances: !hideBalances })}
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
          {show(money.format(portfolio.total))}
        </Text>
        <Text
          variant="label"
          tone={up ? 'success' : 'danger'}
          style={styles.change}
        >
          {up ? '▲ ' : '▼ '}
          {show(money.formatSigned(portfolio.dayChange))}{' '}
          {formatPercent(portfolio.dayChangePercent)} today
        </Text>

        <View style={styles.actions}>
          {QUICK_ACTIONS.map(action => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              style={styles.actionPressable}
              onPress={() =>
                'route' in action
                  ? openRoute(action.route)
                  : navigation.navigate('SelectAsset', { mode: action.select })
              }
            >
              <Card style={styles.action}>
                <View>
                  {action.glyph ? (
                    <Text variant="subtitle" style={styles.actionGlyph}>
                      {action.glyph}
                    </Text>
                  ) : (
                    <Icon
                      name={action.icon!}
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
            </Pressable>
          ))}
        </View>

        {portfolio.total > 0 ? (
          <Card style={styles.allocation}>
            <View style={styles.donut}>
              <Svg width={96} height={96} viewBox="0 0 120 120">
                {allocation.map(slice => {
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
                  Assets
                </Text>
                <Text variant="label" style={styles.donutTotal}>
                  {slices.filter(slice => slice.value > 0).length}
                </Text>
              </View>
            </View>
            <View style={styles.legend}>
              {allocation.map(slice => (
                <View key={slice.label} style={styles.legendRow}>
                  <View
                    style={[styles.legendDot, { backgroundColor: slice.color }]}
                  />
                  <Text variant="body" style={styles.legendLabel}>
                    {slice.label}
                  </Text>
                  <Text variant="body" tone="muted">
                    {formatNumber(slice.percent, 1)}%
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        <View style={styles.assetsHeader}>
          <Text variant="subtitle" style={styles.assetsTitle}>
            My Assets
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Transactions')}
          >
            <Text variant="label" tone="primary">
              History
            </Text>
          </Pressable>
        </View>
        <Card>
          <ListRow
            leading={<CoinAvatar symbol="₹" color={INR_COLOR} />}
            title="Indian Rupee"
            subtitle={'Available ' + show(money.format(portfolio.availableInr))}
            value={show(money.format(portfolio.inrBalance))}
            showChevron
            divider
            onPress={() =>
              navigation.navigate('AssetDetail', { coinId: 'inr' })
            }
          />
          {portfolio.assets.map(asset => (
            <ListRow
              key={asset.coin.id}
              leading={
                <CoinAvatar
                  symbol={asset.coin.symbol}
                  color={asset.coin.color}
                />
              }
              title={asset.coin.name}
              subtitle={
                show(formatNumber(asset.quantity, 8)) + ' ' + asset.coin.symbol
              }
              value={show(money.format(asset.value))}
              meta={
                hideBalances
                  ? undefined
                  : money.formatSigned(asset.pnl) +
                    (asset.invested > 0
                      ? ' (' +
                        formatPercent((asset.pnl / asset.invested) * 100) +
                        ')'
                      : '')
              }
              metaTone={asset.pnl >= 0 ? 'success' : 'danger'}
              divider
              onPress={() =>
                navigation.navigate('AssetDetail', { coinId: asset.coin.id })
              }
            />
          ))}
          <ListRow
            icon="trending-up"
            title="Futures Wallet"
            subtitle="USDT margin + unrealised P&L"
            value={show(money.format(portfolio.futuresValue))}
            showChevron
            onPress={() => navigation.navigate('Futures')}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}
