import { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';

import { CoinSelector } from '../../../components/common/CoinSelector';
import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { findCoin, MARKET_COINS } from '../../../constants/markets';
import { NETWORKS } from '../../../constants/networks';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  addWhitelistAddress,
  removeWhitelistAddress,
  securityStore,
  setWhitelistEnabled,
} from '../../../services/security';
import { styles } from './styles';

const WITHDRAWABLE = MARKET_COINS.filter(coin => NETWORKS[coin.id]);

/** Saved withdrawal addresses, and the switch that allows only them. */
export function WhitelistScreen({
  navigation,
}: AppStackScreenProps<'Whitelist'>) {
  const theme = useTheme();
  const security = useStore(securityStore);
  const [coinId, setCoinId] = useState('usdt');
  const [networkId, setNetworkId] = useState(NETWORKS.usdt[0].id);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string>();
  const networks = NETWORKS[coinId] ?? [];

  const onChangeCoin = (next: string) => {
    setCoinId(next);
    setNetworkId(NETWORKS[next][0].id);
    setError(undefined);
  };

  const onAdd = () => {
    const result = addWhitelistAddress({ label, coinId, networkId, address });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setLabel('');
    setAddress('');
    setError(undefined);
    showToast('Address saved', 'success');
  };

  const onToggle = (enabled: boolean) => {
    if (enabled) {
      setWhitelistEnabled(true);
      return;
    }
    Alert.alert(
      'Turn off whitelist?',
      'Withdrawals will be allowed to any address.',
      [
        { text: 'Keep on', style: 'cancel' },
        {
          text: 'Turn off',
          style: 'destructive',
          onPress: () => setWhitelistEnabled(false),
        },
      ],
    );
  };

  const onRemove = (id: string, name: string) =>
    Alert.alert('Remove ' + name + '?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeWhitelistAddress(id),
      },
    ]);

  return (
    <Screen>
      <ScreenHeader title="Withdrawal Whitelist" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card padded>
          <View style={styles.row}>
            <View style={styles.grow}>
              <Text variant="body" style={styles.bold}>
                Only allow saved addresses
              </Text>
              <Text variant="caption" tone="muted">
                Blocks withdrawals to any address not listed below.
              </Text>
            </View>
            <Switch
              value={security.whitelistEnabled}
              onValueChange={onToggle}
              trackColor={{
                false: theme.colors.disabled,
                true: theme.colors.primary,
              }}
            />
          </View>
        </Card>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          SAVED ADDRESSES
        </Text>
        {security.whitelist.length === 0 ? (
          <EmptyState
            title="No saved addresses"
            message="Add the wallets you withdraw to most."
          />
        ) : (
          <Card>
            {security.whitelist.map((item, index) => (
              <ListRow
                key={item.id}
                icon="shield"
                title={item.label}
                subtitle={
                  (findCoin(item.coinId)?.symbol ?? item.coinId) +
                  ' · ' +
                  item.networkId +
                  '\n' +
                  item.address
                }
                divider={index < security.whitelist.length - 1}
                trailing={
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={'Remove ' + item.label}
                    hitSlop={10}
                    onPress={() => onRemove(item.id, item.label)}
                  >
                    <Icon name="trash" size={18} color={theme.colors.danger} />
                  </Pressable>
                }
              />
            ))}
          </Card>
        )}

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          ADD ADDRESS
        </Text>
        <CoinSelector
          coins={WITHDRAWABLE}
          value={coinId}
          onChange={onChangeCoin}
        />
        <View style={styles.wrap}>
          {networks.map(network => (
            <Chip
              key={network.id}
              label={network.id}
              selected={network.id === networkId}
              onPress={() => setNetworkId(network.id)}
            />
          ))}
        </View>
        <Input
          label="Label"
          placeholder="e.g. My Ledger"
          value={label}
          onChangeText={setLabel}
        />
        <Input
          label="Address"
          placeholder="Paste the address"
          autoCapitalize="none"
          autoCorrect={false}
          value={address}
          onChangeText={text => {
            setAddress(text);
            setError(undefined);
          }}
          errorMessage={error}
        />
        <Button
          label="Save address"
          disabled={label.trim() === '' || address.trim() === ''}
          onPress={onAdd}
        />
      </ScrollView>
    </Screen>
  );
}
