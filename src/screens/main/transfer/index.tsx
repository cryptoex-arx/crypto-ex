import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Icon } from '../../../components/ui/Icon';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Input } from '../../../components/ui/Input';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useAccount } from '../../../hooks/useAccount';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  getAvailableMargin,
  getAvailableQuantity,
  type TransferDirection,
  transferUsdt,
} from '../../../services/account';
import {
  floorTo,
  formatNumber,
  parseAmount,
  sanitizeDecimalInput,
} from '../../../utils/format';
import { styles } from './styles';

const WALLET_LABELS = { spot: 'Spot Wallet', futures: 'Futures Wallet' };

/** Moves USDT between the spot and futures wallets, instantly and free. */
export function TransferScreen({
  navigation,
}: AppStackScreenProps<'Transfer'>) {
  const theme = useTheme();
  const account = useAccount();
  const [direction, setDirection] = useState<TransferDirection>('toFutures');
  const [amountText, setAmountText] = useState('');
  const [error, setError] = useState<string>();
  const toFutures = direction === 'toFutures';
  const available = toFutures
    ? getAvailableQuantity(account, 'usdt')
    : getAvailableMargin(account);
  const amount = parseAmount(amountText);

  const onTransfer = () => {
    const result = transferUsdt(direction, amount);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(undefined);
    setAmountText('');
    showToast(
      'Transfer complete',
      'success',
      formatNumber(amount, 4) +
        ' USDT moved to your ' +
        (toFutures ? WALLET_LABELS.futures : WALLET_LABELS.spot) +
        '.',
    );
  };

  return (
    <Screen>
      <ScreenHeader title="Transfer" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card padded>
          <View style={styles.row}>
            <View style={styles.grow}>
              <Text variant="caption" tone="muted">
                From
              </Text>
              <Text variant="subtitle" style={styles.bold}>
                {toFutures ? WALLET_LABELS.spot : WALLET_LABELS.futures}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Swap direction"
              hitSlop={10}
              onPress={() => {
                setDirection(toFutures ? 'toSpot' : 'toFutures');
                setAmountText('');
                setError(undefined);
              }}
              style={[
                styles.swap,
                { backgroundColor: theme.colors.surfaceStrong },
              ]}
            >
              <Icon name="transfer" size={18} />
            </Pressable>
            <View style={[styles.grow, styles.alignEnd]}>
              <Text variant="caption" tone="muted">
                To
              </Text>
              <Text variant="subtitle" style={styles.bold}>
                {toFutures ? WALLET_LABELS.futures : WALLET_LABELS.spot}
              </Text>
            </View>
          </View>
        </Card>

        <Input
          label="Amount (USDT)"
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amountText}
          onChangeText={text => setAmountText(sanitizeDecimalInput(text, 4))}
          errorMessage={error}
        />
        <View style={styles.row}>
          <Text variant="caption" tone="muted" style={styles.grow}>
            Available: {formatNumber(available, 4)} USDT
          </Text>
          <Chip
            label="MAX"
            onPress={() => setAmountText(String(floorTo(available, 4)))}
          />
        </View>

        {toFutures && available <= 0 ? (
          <View style={styles.missing}>
            <InfoBanner
              icon="info"
              message="You have no USDT in spot. Buy USDT with INR first."
            />
            <Button
              label="Buy USDT"
              variant="secondary"
              onPress={() =>
                navigation.navigate('CoinDetail', {
                  coinId: 'usdt',
                  side: 'buy',
                })
              }
            />
          </View>
        ) : null}

        <Button
          label="Transfer"
          disabled={!(amount > 0)}
          onPress={onTransfer}
        />
      </ScrollView>
    </Screen>
  );
}
