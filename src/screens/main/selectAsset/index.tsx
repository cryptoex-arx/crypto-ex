import { useState } from 'react';
import { ScrollView } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { SearchField } from '../../../components/ui/SearchField';
import { MARKET_COINS } from '../../../constants/markets';
import { NETWORKS } from '../../../constants/networks';
import { useAccount } from '../../../hooks/useAccount';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  getAvailableInr,
  getAvailableQuantity,
} from '../../../services/account';
import { formatInr, formatNumber } from '../../../utils/format';
import { styles } from './styles';

/** Picks INR or a coin before depositing or withdrawing it. */
export function SelectAssetScreen({
  navigation,
  route,
}: AppStackScreenProps<'SelectAsset'>) {
  const { mode } = route.params;
  const account = useAccount();
  const [query, setQuery] = useState('');
  const search = query.trim().toLowerCase();

  const coins = MARKET_COINS.filter(
    coin =>
      NETWORKS[coin.id] !== undefined &&
      (search === '' ||
        coin.name.toLowerCase().includes(search) ||
        coin.symbol.toLowerCase().includes(search)),
  ).sort(
    (a, b) =>
      getAvailableQuantity(account, b.id) * b.price -
      getAvailableQuantity(account, a.id) * a.price,
  );
  const showInr = search === '' || 'inr indian rupee'.includes(search);

  return (
    <Screen>
      <ScreenHeader
        title={mode === 'deposit' ? 'Deposit' : 'Withdraw'}
        onBack={navigation.goBack}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <SearchField
          placeholder="Search coin"
          autoCapitalize="none"
          autoCorrect={false}
          value={query}
          onChangeText={setQuery}
        />
        {!showInr && coins.length === 0 ? (
          <EmptyState title="No matching assets" />
        ) : (
          <Card>
            {showInr ? (
              <ListRow
                leading={<CoinAvatar symbol="₹" color="#1B8A5A" />}
                title="Indian Rupee"
                subtitle="INR · Bank transfer"
                value={formatInr(getAvailableInr(account), 'full')}
                showChevron
                divider={coins.length > 0}
                onPress={() =>
                  navigation.replace(
                    mode === 'deposit' ? 'AddInr' : 'WithdrawInr',
                  )
                }
              />
            ) : null}
            {coins.map((coin, index) => (
              <ListRow
                key={coin.id}
                leading={<CoinAvatar symbol={coin.symbol} color={coin.color} />}
                title={coin.name}
                subtitle={
                  coin.symbol +
                  ' · ' +
                  NETWORKS[coin.id].map(network => network.id).join(', ')
                }
                value={formatNumber(getAvailableQuantity(account, coin.id), 8)}
                showChevron
                divider={index < coins.length - 1}
                onPress={() =>
                  navigation.replace(
                    mode === 'deposit' ? 'DepositCrypto' : 'WithdrawCrypto',
                    { coinId: coin.id },
                  )
                }
              />
            ))}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
