import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { ConfirmSheet } from '../../../components/common/ConfirmSheet';
import { PercentPicker } from '../../../components/common/PercentPicker';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { EARN_PRODUCTS, type EarnProduct } from '../../../constants/earn';
import { findCoin } from '../../../constants/markets';
import { useAccount } from '../../../hooks/useAccount';
import { useLiveQuotes } from '../../../hooks/useLiveQuotes';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  getAvailableQuantity,
  redeemStake,
  stakeMaturesAt,
  stakeReward,
  subscribeEarn,
} from '../../../services/account';
import {
  floorTo,
  formatDate,
  formatNumber,
  formatQuantity,
  parseAmount,
  sanitizeDecimalInput,
} from '../../../utils/format';
import { styles } from './styles';

function lockLabel(lockDays: number): string {
  return lockDays === 0 ? 'Flexible' : lockDays + ' days';
}

/** Staking products and the user's stakes with live-accruing rewards. */
export function EarnScreen({ navigation }: AppStackScreenProps<'Earn'>) {
  const account = useAccount();
  // Re-render with every feed tick so rewards visibly accrue.
  useLiveQuotes();
  const [product, setProduct] = useState<EarnProduct>();
  const [amountText, setAmountText] = useState('');
  const [error, setError] = useState<string>();
  const now = Date.now();

  const productCoin = product ? findCoin(product.coinId) : undefined;
  const available = product ? getAvailableQuantity(account, product.coinId) : 0;
  const amount = parseAmount(amountText);

  const onSubscribe = () => {
    if (!product) {
      return;
    }
    const result = subscribeEarn(product.id, amount);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setProduct(undefined);
    showToast(
      'Staked',
      'success',
      formatQuantity(amount, productCoin?.symbol ?? '') +
        ' earning ' +
        product.apy +
        '% APY',
    );
  };

  const onRedeem = (stakeId: string, symbol: string) =>
    Alert.alert(
      'Redeem ' + symbol + '?',
      'Your stake and rewards return to your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => {
            const result = redeemStake(stakeId);
            if (!result.ok) {
              showToast(result.error, 'danger');
              return;
            }
            showToast(
              'Redeemed',
              'success',
              'Reward: ' + formatQuantity(result.value, symbol),
            );
          },
        },
      ],
    );

  return (
    <Screen>
      <ScreenHeader title="Earn" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        {account.stakes.length > 0 ? (
          <>
            <Text variant="overline" tone="muted" style={styles.sectionLabel}>
              MY STAKES
            </Text>
            {account.stakes.map(stake => {
              const coin = findCoin(stake.coinId);
              const matures = stakeMaturesAt(stake);
              const locked = now < matures;
              return (
                <Card key={stake.id} padded>
                  <View style={styles.row}>
                    <CoinAvatar
                      symbol={coin?.symbol ?? ''}
                      color={coin?.color}
                    />
                    <View style={styles.grow}>
                      <Text variant="body" style={styles.bold}>
                        {formatQuantity(stake.quantity, coin?.symbol ?? '')}
                      </Text>
                      <Text variant="caption" tone="muted">
                        {stake.apy}% APY ·{' '}
                        {locked
                          ? 'Unlocks ' + formatDate(matures)
                          : lockLabel(stake.lockDays)}
                      </Text>
                    </View>
                    <View style={styles.alignEnd}>
                      <Text variant="caption" tone="muted">
                        Earned
                      </Text>
                      <Text variant="label" tone="success">
                        +{formatNumber(stakeReward(stake, now), 8)}
                      </Text>
                    </View>
                  </View>
                  <Button
                    label={locked ? 'Locked' : 'Redeem'}
                    variant="secondary"
                    disabled={locked}
                    style={styles.redeem}
                    onPress={() => onRedeem(stake.id, coin?.symbol ?? '')}
                  />
                </Card>
              );
            })}
          </>
        ) : null}

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          PRODUCTS
        </Text>
        <Card>
          {EARN_PRODUCTS.map((item, index) => {
            const coin = findCoin(item.coinId);
            return (
              <ListRow
                key={item.id}
                leading={
                  <CoinAvatar symbol={coin?.symbol ?? ''} color={coin?.color} />
                }
                title={coin?.symbol ?? item.coinId}
                subtitle={
                  lockLabel(item.lockDays) +
                  ' · min ' +
                  formatNumber(item.minQuantity, 8)
                }
                divider={index < EARN_PRODUCTS.length - 1}
                onPress={() => {
                  setError(undefined);
                  setAmountText('');
                  setProduct(item);
                }}
                trailing={<Badge label={item.apy + '% APY'} tone="success" />}
              />
            );
          })}
        </Card>
      </ScrollView>

      <ConfirmSheet
        visible={product !== undefined}
        title={
          'Stake ' +
          (productCoin?.symbol ?? '') +
          ' · ' +
          (product?.apy ?? 0) +
          '% APY'
        }
        rows={
          product
            ? [
                { label: 'Lock period', value: lockLabel(product.lockDays) },
                {
                  label: 'Available',
                  value: formatQuantity(available, productCoin?.symbol ?? ''),
                },
                {
                  label: 'Est. yearly reward',
                  value: formatQuantity(
                    Number.isFinite(amount) ? (amount * product.apy) / 100 : 0,
                    productCoin?.symbol ?? '',
                  ),
                  tone: 'success',
                },
              ]
            : []
        }
        confirmLabel="Stake"
        error={error}
        onConfirm={onSubscribe}
        onCancel={() => setProduct(undefined)}
      >
        <View style={styles.sheetFields}>
          <Input
            placeholder={'Min ' + (product?.minQuantity ?? '')}
            keyboardType="decimal-pad"
            value={amountText}
            onChangeText={text => {
              setAmountText(sanitizeDecimalInput(text));
              setError(undefined);
            }}
          />
          <PercentPicker
            onPick={fraction =>
              setAmountText(String(floorTo(available * fraction, 8)))
            }
          />
          {available <= 0 && product ? (
            <Button
              label={'Buy ' + productCoin?.symbol}
              variant="secondary"
              onPress={() => {
                const coinId = product.coinId;
                setProduct(undefined);
                navigation.navigate('CoinDetail', { coinId, side: 'buy' });
              }}
            />
          ) : null}
        </View>
      </ConfirmSheet>
    </Screen>
  );
}
