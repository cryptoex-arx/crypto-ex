import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { ConfirmSheet } from '../../../components/common/ConfirmSheet';
import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Input } from '../../../components/ui/Input';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { BASKETS } from '../../../constants/baskets';
import { findCoin } from '../../../constants/markets';
import { useAccount } from '../../../hooks/useAccount';
import { useLiveQuotes } from '../../../hooks/useLiveQuotes';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  basketChange,
  getAvailableInr,
  investInBasket,
} from '../../../services/account';
import {
  formatInr,
  formatNumber,
  formatPercent,
  formatPrice,
  parseAmount,
  sanitizeDecimalInput,
} from '../../../utils/format';
import { styles } from './styles';

/** One basket: its coins and weights, and a one-tap split investment. */
export function BasketDetailScreen({
  navigation,
  route,
}: AppStackScreenProps<'BasketDetail'>) {
  const account = useAccount();
  const quotes = useLiveQuotes();
  const basket = BASKETS.find(item => item.id === route.params.basketId);
  const [amountText, setAmountText] = useState(
    basket ? String(basket.minInvestment) : '',
  );
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();

  if (!basket) {
    return (
      <Screen>
        <ScreenHeader onBack={navigation.goBack} />
        <EmptyState title="Basket not found" />
      </Screen>
    );
  }

  const amount = parseAmount(amountText);
  const change = basketChange(basket.id, quotes);
  const quickAmounts = [1, 2, 5, 10].map(times => basket.minInvestment * times);

  const onInvest = () => {
    const result = investInBasket(basket.id, amount);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setConfirming(false);
    showToast(
      'Invested in ' + basket.name,
      'success',
      formatInr(amount) + ' split across ' + result.value + ' coins.',
    );
  };

  return (
    <Screen>
      <ScreenHeader title={basket.name} onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card padded>
          <Text tone="muted">{basket.description}</Text>
          <View style={[styles.row, styles.summary]}>
            <Text variant="title" tone={change >= 0 ? 'success' : 'danger'}>
              {formatPercent(change)}
            </Text>
            <Text variant="caption" tone="muted">
              weighted 24h change
            </Text>
          </View>
        </Card>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          COINS
        </Text>
        <Card>
          {basket.components.map((component, index) => {
            const coin = findCoin(component.coinId);
            const quote = quotes[component.coinId];
            return (
              <ListRow
                key={component.coinId}
                leading={
                  <CoinAvatar symbol={coin?.symbol ?? ''} color={coin?.color} />
                }
                title={coin?.name ?? component.coinId}
                subtitle={
                  formatNumber(component.weight * 100, 0) +
                  '% · ' +
                  (quote ? formatPrice(quote.price) : '—')
                }
                value={
                  Number.isFinite(amount)
                    ? formatInr(amount * component.weight)
                    : undefined
                }
                meta={quote ? formatPercent(quote.change24h) : undefined}
                metaTone={quote && quote.change24h >= 0 ? 'success' : 'danger'}
                divider={index < basket.components.length - 1}
                onPress={() =>
                  navigation.navigate('CoinDetail', {
                    coinId: component.coinId,
                  })
                }
              />
            );
          })}
        </Card>

        <Input
          label="Investment (INR)"
          placeholder={'Min ' + formatInr(basket.minInvestment)}
          keyboardType="decimal-pad"
          value={amountText}
          onChangeText={text => {
            setAmountText(sanitizeDecimalInput(text, 2));
            setError(undefined);
          }}
        />
        <View style={styles.wrap}>
          {quickAmounts.map(quick => (
            <Chip
              key={quick}
              label={formatInr(quick)}
              selected={amount === quick}
              onPress={() => setAmountText(String(quick))}
            />
          ))}
        </View>
        <Text variant="caption" tone="muted">
          Available: {formatInr(getAvailableInr(account), 'full')}
        </Text>
        <Button
          label="Invest"
          disabled={!(amount > 0)}
          onPress={() => {
            setError(undefined);
            setConfirming(true);
          }}
        />
      </ScrollView>

      <ConfirmSheet
        visible={confirming}
        title={'Invest in ' + basket.name}
        rows={[
          ...basket.components.map(component => ({
            label: findCoin(component.coinId)?.symbol ?? component.coinId,
            value: formatInr(amount * component.weight, 'full'),
          })),
          { label: 'Total incl. 0.2% fees', value: formatInr(amount, 'full') },
        ]}
        confirmLabel="Invest"
        error={error}
        onConfirm={onInvest}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}
