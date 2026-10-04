import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ConfirmSheet } from '../../../components/common/ConfirmSheet';
import { DetailRows } from '../../../components/common/DetailRows';
import { EmptyState } from '../../../components/common/EmptyState';
import { KycGate } from '../../../components/common/KycGate';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Input } from '../../../components/ui/Input';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { findCoin } from '../../../constants/markets';
import { NETWORKS, validateAddress } from '../../../constants/networks';
import { useAccount } from '../../../hooks/useAccount';
import { useStore } from '../../../hooks/useStore';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  getAvailableQuantity,
  withdrawCrypto,
} from '../../../services/account';
import { securityStore } from '../../../services/security';
import {
  floorTo,
  formatQuantity,
  parseAmount,
  sanitizeDecimalInput,
} from '../../../utils/format';
import { styles } from './styles';

/** On-chain withdrawal with network choice, fee preview and 2FA. */
export function WithdrawCryptoScreen({
  navigation,
  route,
}: AppStackScreenProps<'WithdrawCrypto'>) {
  const { coinId } = route.params;
  const coin = findCoin(coinId);
  const networks = NETWORKS[coinId] ?? [];
  const account = useAccount();
  const security = useStore(securityStore);
  const [networkId, setNetworkId] = useState(networks[0]?.id);
  const [address, setAddress] = useState('');
  const [amountText, setAmountText] = useState('');
  const [code, setCode] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const network = networks.find(item => item.id === networkId);

  if (!coin || !network) {
    return (
      <Screen>
        <ScreenHeader title="Withdraw" onBack={navigation.goBack} />
        <EmptyState title="Withdrawals unavailable" />
      </Screen>
    );
  }

  const available = getAvailableQuantity(account, coinId);
  const amount = parseAmount(amountText);
  const receive = Number.isFinite(amount)
    ? Math.max(0, amount - network.fee)
    : 0;
  const addressError =
    address.trim() === ''
      ? undefined
      : validateAddress(network, address.trim());
  const saved = security.whitelist.filter(
    item => item.coinId === coinId && item.networkId === network.id,
  );
  const needsCode = security.twoFactor.enabled;

  const onConfirm = () => {
    const result = withdrawCrypto({
      coinId,
      networkId: network.id,
      address,
      amount,
      code,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setConfirming(false);
    showToast(
      'Withdrawal submitted',
      'success',
      formatQuantity(receive, coin.symbol) + ' will be broadcast shortly.',
    );
    navigation.replace('Transactions');
  };

  return (
    <Screen>
      <ScreenHeader
        title={'Withdraw ' + coin.symbol}
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

          <Input
            label="Recipient address"
            placeholder={'Paste a ' + network.name + ' address'}
            autoCapitalize="none"
            autoCorrect={false}
            value={address}
            onChangeText={setAddress}
            errorMessage={addressError}
          />
          {saved.length > 0 ? (
            <View style={styles.wrap}>
              {saved.map(item => (
                <Chip
                  key={item.id}
                  icon="shield"
                  label={item.label}
                  selected={item.address === address.trim()}
                  onPress={() => setAddress(item.address)}
                />
              ))}
            </View>
          ) : null}
          {security.whitelistEnabled ? (
            <InfoBanner
              icon="shield-check"
              message="Whitelist is on: only saved addresses can receive withdrawals."
            />
          ) : null}

          <Input
            label={'Amount (' + coin.symbol + ')'}
            placeholder={'Min ' + network.minWithdrawal}
            keyboardType="decimal-pad"
            value={amountText}
            onChangeText={text => setAmountText(sanitizeDecimalInput(text))}
          />
          <View style={styles.row}>
            <Text variant="caption" tone="muted" style={styles.grow}>
              Available: {formatQuantity(available, coin.symbol)}
            </Text>
            <Chip
              label="MAX"
              onPress={() => setAmountText(String(floorTo(available, 8)))}
            />
          </View>

          <Card padded>
            <DetailRows
              rows={[
                {
                  label: 'Network fee',
                  value: formatQuantity(network.fee, coin.symbol),
                },
                {
                  label: 'Minimum',
                  value: formatQuantity(network.minWithdrawal, coin.symbol),
                },
                {
                  label: 'You receive',
                  value: formatQuantity(receive, coin.symbol),
                },
              ]}
            />
          </Card>

          {!needsCode ? (
            <InfoBanner
              icon="alert-circle"
              message="Turn on Google Authenticator in Security to protect withdrawals."
            />
          ) : null}

          <Button
            label="Withdraw"
            disabled={
              address.trim() === '' ||
              addressError !== undefined ||
              !(amount > 0)
            }
            onPress={() => {
              setError(undefined);
              setCode('');
              setConfirming(true);
            }}
          />
        </ScrollView>
      </KycGate>

      <ConfirmSheet
        visible={confirming}
        title="Confirm withdrawal"
        rows={[
          { label: 'Network', value: network.name },
          { label: 'To', value: address.trim() },
          { label: 'Amount', value: formatQuantity(amount, coin.symbol) },
          { label: 'Fee', value: formatQuantity(network.fee, coin.symbol) },
          { label: 'You receive', value: formatQuantity(receive, coin.symbol) },
        ]}
        confirmLabel="Withdraw"
        error={error}
        onConfirm={onConfirm}
        onCancel={() => setConfirming(false)}
      >
        {needsCode ? (
          <View style={styles.codeField}>
            <Input
              label="Google Authenticator code"
              placeholder="6-digit code or backup code"
              autoCapitalize="characters"
              maxLength={8}
              value={code}
              onChangeText={setCode}
            />
          </View>
        ) : null}
      </ConfirmSheet>
    </Screen>
  );
}
