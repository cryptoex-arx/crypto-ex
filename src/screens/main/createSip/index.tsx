import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { CoinSelector } from '../../../components/common/CoinSelector';
import { DetailRows } from '../../../components/common/DetailRows';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Input } from '../../../components/ui/Input';
import { Screen } from '../../../components/ui/Screen';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { Text } from '../../../components/ui/Text';
import { findCoin, MARKET_COINS } from '../../../constants/markets';
import { useAccount } from '../../../hooks/useAccount';
import { useLiveQuote } from '../../../hooks/useLiveQuotes';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  createSip,
  FEE_RATE,
  getAvailableInr,
  nextRunAfter,
  SIP_FREQUENCIES,
  SIP_MIN_AMOUNT,
  type SipFrequency,
} from '../../../services/account';
import {
  formatDate,
  formatInr,
  formatNumber,
  parseAmount,
  sanitizeDecimalInput,
} from '../../../utils/format';
import { styles } from './styles';

const SIP_COINS = MARKET_COINS.filter(coin => !coin.stable);
const QUICK_AMOUNTS = [500, 1000, 2500, 5000] as const;

/** Sets up a recurring buy of one coin. */
export function CreateSipScreen({
  navigation,
  route,
}: AppStackScreenProps<'CreateSip'>) {
  const account = useAccount();
  const [coinId, setCoinId] = useState(route.params?.coinId ?? 'btc');
  const [amountText, setAmountText] = useState('1000');
  const [frequency, setFrequency] = useState<SipFrequency>('monthly');
  const [error, setError] = useState<string>();
  const quote = useLiveQuote(coinId);
  const coin = findCoin(coinId);
  const amount = parseAmount(amountText);
  const estimate =
    quote && amount > 0 ? amount / (quote.price * (1 + FEE_RATE)) : 0;

  const onStart = () => {
    const result = createSip(coinId, amount, frequency);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast(
      'SIP started',
      'success',
      'First ' + formatInr(amount) + ' of ' + coin?.symbol + ' bought.',
    );
    navigation.goBack();
  };

  return (
    <Screen>
      <ScreenHeader title="Start a SIP" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          COIN
        </Text>
        <CoinSelector coins={SIP_COINS} value={coinId} onChange={setCoinId} />

        <Input
          label="Amount per instalment (INR)"
          placeholder={'Min ' + formatInr(SIP_MIN_AMOUNT)}
          keyboardType="decimal-pad"
          value={amountText}
          onChangeText={text => {
            setAmountText(sanitizeDecimalInput(text, 2));
            setError(undefined);
          }}
          errorMessage={error}
        />
        <View style={styles.wrap}>
          {QUICK_AMOUNTS.map(quick => (
            <Chip
              key={quick}
              label={formatInr(quick)}
              selected={amount === quick}
              onPress={() => setAmountText(String(quick))}
            />
          ))}
        </View>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          FREQUENCY
        </Text>
        <SegmentedControl
          options={SIP_FREQUENCIES}
          value={frequency}
          onChange={setFrequency}
        />

        <Card padded>
          <DetailRows
            rows={[
              {
                label: 'First instalment',
                value: 'Today, ' + formatInr(amount > 0 ? amount : 0),
              },
              {
                label: 'Next instalment',
                value: formatDate(nextRunAfter(Date.now(), frequency)),
              },
              {
                label: 'You get now (approx.)',
                value: formatNumber(estimate, 8) + ' ' + (coin?.symbol ?? ''),
              },
              {
                label: 'INR available',
                value: formatInr(getAvailableInr(account), 'full'),
              },
            ]}
          />
        </Card>

        <Button label="Start SIP" disabled={!(amount > 0)} onPress={onStart} />
      </ScrollView>
    </Screen>
  );
}
