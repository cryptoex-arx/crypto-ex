import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Chip } from '../../../components/ui/Chip';
import { Icon } from '../../../components/ui/Icon';
import { Screen, TAB_SCREEN_EDGES } from '../../../components/ui/Screen';
import { SearchField } from '../../../components/ui/SearchField';
import { Text } from '../../../components/ui/Text';
import { MARKET_COINS, type MarketCoin } from '../../../constants/markets';
import { useAccount } from '../../../hooks/useAccount';
import { useLiveQuotes } from '../../../hooks/useLiveQuotes';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import type { MainTabScreenProps } from '../../../navigation/types';
import { toggleFavourite } from '../../../services/account';
import { settingsStore } from '../../../services/settings';
import {
  formatInr,
  formatPercent,
  formatUsdCompact,
  formatUsdt,
} from '../../../utils/format';
import { styles } from './styles';

type MarketTab = 'favourites' | 'inr' | 'usdt';
type MarketFilter = 'all' | 'gainers' | 'losers' | 'volume';
type SortKey = 'name' | 'price' | 'change';

const TABS: readonly { value: MarketTab; label: string }[] = [
  { value: 'favourites', label: '★ Favourites' },
  { value: 'inr', label: 'INR' },
  { value: 'usdt', label: 'USDT' },
];

const FILTERS: readonly { value: MarketFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'gainers', label: 'Gainers' },
  { value: 'losers', label: 'Losers' },
  { value: 'volume', label: 'Volume' },
];

interface LiveCoin extends MarketCoin {
  quotePrice: number;
}

function applyFilter(
  coins: readonly LiveCoin[],
  filter: MarketFilter,
): LiveCoin[] {
  switch (filter) {
    case 'gainers':
      return coins.filter(coin => coin.change24h >= 0);
    case 'losers':
      return coins.filter(coin => coin.change24h < 0);
    case 'volume':
      return [...coins].sort((a, b) => b.volumeUsd - a.volumeUsd);
    case 'all':
      return [...coins];
  }
}

const SORTERS: Record<SortKey, (a: LiveCoin, b: LiveCoin) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  price: (a, b) => a.quotePrice - b.quotePrice,
  change: (a, b) => a.change24h - b.change24h,
};

/** Searchable, sortable market list with favourites and quote tabs. */
export function MarketsScreen({ navigation }: MainTabScreenProps<'Markets'>) {
  const theme = useTheme();
  const account = useAccount();
  const { compactList } = useStore(settingsStore);
  const [tab, setTab] = useState<MarketTab>('inr');
  const [filter, setFilter] = useState<MarketFilter>('all');
  const [sort, setSort] = useState<{ key: SortKey; ascending: boolean }>();
  const [query, setQuery] = useState('');
  const quotes = useLiveQuotes();
  const usdtPrice = quotes.usdt?.price ?? 1;

  const coins = useMemo(() => {
    const search = query.trim().toLowerCase();
    const listed = MARKET_COINS.filter(coin => {
      if (tab === 'favourites') {
        return account.favourites.includes(coin.id);
      }
      return tab === 'usdt' ? !coin.stable : true;
    }).map(coin => {
      const live = { ...coin, ...quotes[coin.id] };
      return {
        ...live,
        quotePrice: tab === 'usdt' ? live.price / usdtPrice : live.price,
      };
    });
    let result = applyFilter(listed, filter);
    if (search.length > 0) {
      result = result.filter(
        coin =>
          coin.name.toLowerCase().includes(search) ||
          coin.symbol.toLowerCase().includes(search),
      );
    }
    if (sort) {
      const direction = sort.ascending ? 1 : -1;
      result.sort((a, b) => SORTERS[sort.key](a, b) * direction);
    }
    return result;
  }, [account.favourites, filter, query, quotes, sort, tab, usdtPrice]);

  const onSort = (key: SortKey) =>
    setSort(current =>
      current?.key === key
        ? current.ascending
          ? { key, ascending: false }
          : undefined
        : { key, ascending: true },
    );

  const sortMark = (key: SortKey) =>
    sort?.key === key ? (sort.ascending ? ' ▲' : ' ▼') : '';

  const quoteSymbol = tab === 'usdt' ? 'USDT' : 'INR';

  return (
    <Screen edges={TAB_SCREEN_EDGES}>
      <ScreenHeader
        title="Markets"
        onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Price alerts"
            hitSlop={10}
            onPress={() => navigation.navigate('PriceAlerts')}
          >
            <Icon name="bell" size={18} color={theme.colors.textMuted} />
          </Pressable>
        }
      />

      <View style={styles.header}>
        <View style={styles.tabs}>
          {TABS.map(option => {
            const selected = option.value === tab;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setTab(option.value)}
                style={[
                  styles.tab,
                  selected && {
                    borderBottomColor: theme.colors.primary,
                  },
                ]}
              >
                <Text
                  variant="label"
                  tone={selected ? 'primary' : 'muted'}
                  style={styles.tabLabel}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <SearchField
          placeholder="Search coins..."
          autoCapitalize="none"
          autoCorrect={false}
          value={query}
          onChangeText={setQuery}
        />
        <View style={styles.filters}>
          {FILTERS.map(option => (
            <Chip
              key={option.value}
              label={option.label}
              selected={filter === option.value}
              onPress={() => setFilter(option.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.columns}>
        <View style={styles.starColumn} />
        {compactList ? null : <View style={styles.avatarColumn} />}
        <Pressable
          accessibilityRole="button"
          onPress={() => onSort('name')}
          style={styles.coinColumn}
        >
          <Text variant="caption" tone="muted">
            COIN{sortMark('name')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onSort('price')}
          style={styles.priceColumn}
        >
          <Text variant="caption" tone="muted" style={styles.alignRight}>
            PRICE ({quoteSymbol}){sortMark('price')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onSort('change')}
          style={styles.changeHeader}
        >
          <Text variant="caption" tone="muted" style={styles.alignRight}>
            24H{sortMark('change')}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={coins}
        keyExtractor={coin => coin.id}
        style={styles.list}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            {tab === 'favourites' && account.favourites.length === 0 ? (
              <EmptyState
                title="No favourites yet"
                message="Tap the ☆ next to a coin to pin it here."
              />
            ) : (
              <EmptyState
                title="No coins found"
                message="Try a different symbol or clear the filter."
              />
            )}
          </View>
        }
        renderItem={({ item }) => {
          const favourite = account.favourites.includes(item.id);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.name}
              onPress={() =>
                navigation.navigate('CoinDetail', { coinId: item.id })
              }
              style={({ pressed }) => [
                styles.row,
                compactList && styles.rowCompact,
                { borderBottomColor: theme.colors.border },
                pressed && styles.pressed,
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  favourite ? 'Remove from favourites' : 'Add to favourites'
                }
                hitSlop={8}
                onPress={() => toggleFavourite(item.id)}
                style={styles.starColumn}
              >
                <Icon
                  name={favourite ? 'star-filled' : 'star'}
                  size={14}
                  color={favourite ? '#F5A524' : theme.colors.disabled}
                />
              </Pressable>

              {compactList ? null : (
                <CoinAvatar symbol={item.symbol} color={item.color} size={30} />
              )}

              <View style={styles.coinColumn}>
                <Text variant="body" numberOfLines={1} style={styles.coinName}>
                  {item.symbol}
                  <Text variant="caption" tone="muted">
                    {' / ' + quoteSymbol}
                  </Text>
                </Text>
                {compactList ? null : (
                  <Text variant="caption" tone="muted" style={styles.coinPair}>
                    {item.name}
                  </Text>
                )}
              </View>

              <View style={styles.priceColumn}>
                <Text variant="label" numberOfLines={1} style={styles.price}>
                  {tab === 'usdt'
                    ? formatUsdt(item.quotePrice)
                    : formatInr(item.quotePrice)}
                </Text>
                {compactList ? null : (
                  <Text variant="caption" tone="muted" style={styles.coinPair}>
                    Vol {formatUsdCompact(item.volumeUsd)}
                  </Text>
                )}
              </View>

              <View style={styles.changeColumn}>
                <View
                  style={[
                    styles.changePill,
                    {
                      backgroundColor:
                        item.change24h >= 0
                          ? theme.colors.successSurface
                          : theme.colors.dangerSurface,
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    tone={item.change24h >= 0 ? 'success' : 'danger'}
                    style={styles.changeLabel}
                  >
                    {formatPercent(item.change24h)}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
