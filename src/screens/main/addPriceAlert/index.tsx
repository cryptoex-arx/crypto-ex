import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { CoinSelector } from '../../../components/common/CoinSelector';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Input } from '../../../components/ui/Input';
import { Screen } from '../../../components/ui/Screen';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { Text } from '../../../components/ui/Text';
import { findCoin } from '../../../constants/markets';
import { useLiveQuotes } from '../../../hooks/useLiveQuotes';
import type { AppStackScreenProps } from '../../../navigation/types';
import { FUTURES_COINS, getMarkPrice } from '../../../services/account';
import {
  addAlert,
  type AlertDirection,
  type AlertMarket,
  formatAlertPrice,
} from '../../../services/alerts';
import {
  parseAmount,
  priceDecimals,
  sanitizeDecimalInput,
} from '../../../utils/format';
import { styles } from './styles';

const MARKETS = [
  { value: 'spot', label: 'Coins (INR)' },
  { value: 'futures', label: 'Futures (USDT)' },
] as const;

const DIRECTIONS = [
  { value: 'above', label: 'Goes above' },
  { value: 'below', label: 'Goes below' },
] as const;

const MOVES = [-10, -5, -2, 2, 5, 10] as const;

/** Creates a price alert that fires a notification when crossed. */
export function AddPriceAlertScreen({
  navigation,
  route,
}: AppStackScreenProps<'AddPriceAlert'>) {
  const quotes = useLiveQuotes();
  const [market, setMarket] = useState<AlertMarket>(
    route.params?.market ?? 'spot',
  );
  const [coinId, setCoinId] = useState(route.params?.coinId ?? 'btc');
  const [direction, setDirection] = useState<AlertDirection>('above');
  const [priceText, setPriceText] = useState('');
  const [error, setError] = useState<string>();

  const current =
    market === 'spot' ? quotes[coinId]?.price : getMarkPrice(coinId, quotes);
  const decimals = priceDecimals(current ?? 0);
  const coin = findCoin(coinId);

  const onChangeMarket = (next: AlertMarket) => {
    setMarket(next);
    setPriceText('');
    if (next === 'futures' && !FUTURES_COINS.some(item => item.id === coinId)) {
      setCoinId('btc');
    }
  };

  const onMove = (percent: number) => {
    if (current === undefined) {
      return;
    }
    setDirection(percent > 0 ? 'above' : 'below');
    setPriceText((current * (1 + percent / 100)).toFixed(decimals));
  };

  const onSave = () => {
    const result = addAlert({
      coinId,
      market,
      direction,
      price: parseAmount(priceText),
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast('Alert created', 'success');
    navigation.goBack();
  };

  return (
    <Screen>
      <ScreenHeader title="New Price Alert" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <SegmentedControl
          options={MARKETS}
          value={market}
          onChange={onChangeMarket}
        />
        <CoinSelector
          coins={market === 'futures' ? FUTURES_COINS : undefined}
          value={coinId}
          onChange={next => {
            setCoinId(next);
            setPriceText('');
          }}
          perpetual={market === 'futures'}
        />

        <Card padded style={styles.center}>
          <Text variant="caption" tone="muted">
            {coin?.symbol}
            {market === 'futures' ? 'USDT Perp mark price' : ' price'}
          </Text>
          <Text variant="title" style={styles.bold}>
            {current !== undefined ? formatAlertPrice(market, current) : '—'}
          </Text>
        </Card>

        <SegmentedControl
          options={DIRECTIONS}
          value={direction}
          onChange={setDirection}
          variant="outline"
        />
        <Input
          label={'Alert price (' + (market === 'spot' ? 'INR' : 'USDT') + ')'}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={priceText}
          onChangeText={text => {
            setPriceText(sanitizeDecimalInput(text, decimals));
            setError(undefined);
          }}
          errorMessage={error}
        />
        <View style={styles.wrap}>
          {MOVES.map(move => (
            <Chip
              key={move}
              label={(move > 0 ? '+' : '') + move + '%'}
              onPress={() => onMove(move)}
            />
          ))}
        </View>
        <Button
          label="Create alert"
          icon="bell"
          disabled={!(parseAmount(priceText) > 0)}
          onPress={onSave}
        />
      </ScrollView>
    </Screen>
  );
}
