import { ScrollView, StyleSheet } from 'react-native';

import { MARKET_COINS, type MarketCoin } from '../../constants/markets';
import { Chip } from '../ui/Chip';

export interface CoinSelectorProps {
  value: string;
  onChange: (coinId: string) => void;
  /** Defaults to every listed coin. */
  coins?: readonly MarketCoin[];
  /** Appends ` Perp` to each symbol, for futures contracts. */
  perpetual?: boolean;
}

/** Horizontal strip of coin chips for picking a pair or contract. */
export function CoinSelector({
  value,
  onChange,
  coins = MARKET_COINS,
  perpetual = false,
}: CoinSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {coins.map(coin => (
        <Chip
          key={coin.id}
          label={coin.symbol + (perpetual ? ' Perp' : '')}
          selected={coin.id === value}
          onPress={() => onChange(coin.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 2,
  },
});
