import { useState } from 'react';
import { Clipboard, ScrollView, Share, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { DetailRows } from '../../../components/common/DetailRows';
import { EmptyState } from '../../../components/common/EmptyState';
import { KycGate } from '../../../components/common/KycGate';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Input } from '../../../components/ui/Input';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { findCoin } from '../../../constants/markets';
import {
  depositAddress,
  depositMemo,
  NETWORKS,
} from '../../../constants/networks';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { simulateCryptoDeposit } from '../../../services/account';
import {
  formatQuantity,
  parseAmount,
  sanitizeDecimalInput,
} from '../../../utils/format';
import { logger } from '../../../utils/logger';
import { styles } from './styles';

/** Deposit address, QR code and network details for one coin. */
export function DepositCryptoScreen({
  navigation,
  route,
}: AppStackScreenProps<'DepositCrypto'>) {
  const theme = useTheme();
  const { coinId } = route.params;
  const coin = findCoin(coinId);
  const networks = NETWORKS[coinId] ?? [];
  const [networkId, setNetworkId] = useState(networks[0]?.id);
  const [testAmount, setTestAmount] = useState('');
  const network = networks.find(item => item.id === networkId);

  if (!coin || !network) {
    return (
      <Screen>
        <ScreenHeader title="Deposit" onBack={navigation.goBack} />
        <EmptyState
          title="Deposits unavailable"
          message="This coin cannot be deposited right now."
        />
      </Screen>
    );
  }

  const address = depositAddress(coinId, network);
  const memo = network.memo ? depositMemo(coinId, network) : undefined;

  const copy = (value: string, label: string) => {
    // Deprecated in core but still shipped; swap for a clipboard package if it goes.
    Clipboard.setString(value);
    showToast(label + ' copied', 'success');
  };

  const onShare = () =>
    Share.share({
      message:
        'My ' +
        coin.symbol +
        ' (' +
        network.name +
        ') deposit address: ' +
        address +
        (memo ? ' · Memo: ' + memo : ''),
    }).catch(error => logger.warn('Unable to open the share sheet', error));

  const onSimulate = () => {
    const result = simulateCryptoDeposit(
      coinId,
      network.id,
      parseAmount(testAmount),
    );
    if (!result.ok) {
      showToast(result.error, 'danger');
      return;
    }
    setTestAmount('');
    showToast(
      'Deposit detected',
      'success',
      'Waiting for ' + network.confirmations + ' confirmations.',
    );
  };

  return (
    <Screen>
      <ScreenHeader
        title={'Deposit ' + coin.symbol}
        onBack={navigation.goBack}
      />
      <KycGate>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="overline" tone="muted" style={styles.sectionLabel}>
            NETWORK
          </Text>
          <View style={styles.wrap}>
            {networks.map(item => (
              <Button
                key={item.id}
                label={item.id}
                variant={item.id === network.id ? 'primary' : 'secondary'}
                onPress={() => setNetworkId(item.id)}
              />
            ))}
          </View>

          <InfoBanner
            icon="alert-circle"
            tone="danger"
            message={
              'Send only ' +
              coin.symbol +
              ' on ' +
              network.name +
              '. Other coins or networks will be lost.'
            }
          />

          <Card padded style={styles.center}>
            <View style={styles.qr}>
              <QRCode value={address} size={180} />
            </View>
            <Text variant="caption" tone="muted" style={styles.sectionLabel}>
              {coin.symbol} address ({network.id})
            </Text>
            <Text variant="label" selectable style={styles.address}>
              {address}
            </Text>
            <View style={styles.row}>
              <Button
                label="Copy"
                icon="copy"
                variant="secondary"
                style={styles.grow}
                onPress={() => copy(address, 'Address')}
              />
              <Button
                label="Share"
                icon="send"
                variant="secondary"
                style={styles.grow}
                onPress={onShare}
              />
            </View>
          </Card>

          {memo ? (
            <Card padded>
              <Text variant="caption" tone="danger">
                MEMO is required, or the deposit will be lost
              </Text>
              <View style={styles.row}>
                <Text variant="subtitle" selectable style={styles.grow}>
                  {memo}
                </Text>
                <Button
                  label="Copy"
                  variant="secondary"
                  onPress={() => copy(memo, 'Memo')}
                />
              </View>
            </Card>
          ) : null}

          <Card padded>
            <DetailRows
              rows={[
                {
                  label: 'Minimum deposit',
                  value: formatQuantity(network.minDeposit, coin.symbol),
                },
                {
                  label: 'Confirmations',
                  value: String(network.confirmations),
                },
                { label: 'Deposit fee', value: 'Free' },
              ]}
            />
          </Card>

          <Text variant="overline" tone="muted" style={styles.sectionLabel}>
            TEST DEPOSIT
          </Text>
          <Card
            padded
            style={[styles.testCard, { borderColor: theme.colors.border }]}
          >
            <Text variant="caption" tone="muted">
              No real wallet is connected yet. Simulate coins arriving at this
              address to try the flow end to end.
            </Text>
            <Input
              placeholder={'Amount in ' + coin.symbol}
              keyboardType="decimal-pad"
              value={testAmount}
              onChangeText={text => setTestAmount(sanitizeDecimalInput(text))}
            />
            <Button
              label="Simulate deposit"
              variant="secondary"
              disabled={!(parseAmount(testAmount) > 0)}
              onPress={onSimulate}
            />
          </Card>
        </ScrollView>
      </KycGate>
    </Screen>
  );
}
