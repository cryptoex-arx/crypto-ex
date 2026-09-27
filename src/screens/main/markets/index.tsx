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
import { useTheme } from '../../../hooks/useTheme';
import type { MainTabScreenProps } from '../../../navigation/types';
import { styles } from './styles';

type MarketFilter = 'all' | 'gainers' | 'losers' | 'volume';

const FILTERS: readonly { value: MarketFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'gainers', label: 'Gainers' },
  { value: 'losers', label: 'Losers' },
  { value: 'volume', label: 'Volume' },
];

function applyFilter(
  coins: readonly MarketCoin[],
  filter: MarketFilter,
): readonly MarketCoin[] {
  switch (filter) {
    case 'gainers':
      return coins.filter(coin => coin.up);
    case 'losers':
      return coins.filter(coin => !coin.up);
    case 'volume':
      return [...coins].sort((a, b) => b.volumeUsd - a.volumeUsd);
    case 'all':
      return coins;
  }
}

/** Searchable coin list with the gainers, losers and volume filters. */
export function MarketsScreen({ navigation }: MainTabScreenProps<'Markets'>) {
  const theme = useTheme();
  const [filter, setFilter] = useState<MarketFilter>('all');
  const [query, setQuery] = useState('');

  const coins = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = applyFilter(MARKET_COINS, filter);

    if (search.length === 0) {
      return filtered;
    }

    return filtered.filter(
      coin =>
        coin.name.toLowerCase().includes(search) ||
        coin.symbol.toLowerCase().includes(search),
    );
  }, [filter, query]);

  return (
    <Screen edges={TAB_SCREEN_EDGES}>
      <ScreenHeader
        title="Markets"
        onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Market filters"
            hitSlop={10}
          >
            <Icon name="filter" size={18} color={theme.colors.textMuted} />
          </Pressable>
        }
      />

      <View style={styles.header}>
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
        <View style={styles.avatarColumn} />
        <Text variant="caption" tone="muted" style={styles.coinColumn}>
          COIN
        </Text>
        <Text variant="caption" tone="muted" style={styles.priceColumn}>
          PRICE (INR) / VOL
        </Text>
        <Text variant="caption" tone="muted" style={styles.changeHeader}>
          24H
        </Text>
      </View>

      <FlatList
        data={coins}
        keyExtractor={coin => coin.id}
        style={styles.list}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            <EmptyState
              title="No coins found"
              message="Try a different symbol or clear the filter."
            />
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[styles.row, { borderBottomColor: theme.colors.border }]}
          >
            <CoinAvatar symbol={item.symbol} color={item.color} size={30} />

            <View style={styles.coinColumn}>
              <Text variant="body" numberOfLines={1} style={styles.coinName}>
                {item.name}
              </Text>
              <Text variant="caption" tone="muted" style={styles.coinPair}>
                {item.pair}
              </Text>
            </View>

            <View style={styles.priceColumn}>
              <Text variant="label" numberOfLines={1} style={styles.price}>
                {item.price}
              </Text>
              <Text variant="caption" tone="muted" style={styles.coinPair}>
                Vol {item.volume}
              </Text>
            </View>

            <View style={styles.changeColumn}>
              <View
                style={[
                  styles.changePill,
                  {
                    backgroundColor: item.up
                      ? theme.colors.successSurface
                      : theme.colors.dangerSurface,
                  },
                ]}
              >
                <Text
                  variant="caption"
                  tone={item.up ? 'success' : 'danger'}
                  style={styles.changeLabel}
                >
                  {item.change}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}
