import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { TransactionRow } from '../../../components/common/TransactionRow';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Screen } from '../../../components/ui/Screen';
import { useAccount } from '../../../hooks/useAccount';
import type { AppStackScreenProps } from '../../../navigation/types';
import type { TransactionKind } from '../../../services/account';
import { styles } from './styles';

type Filter = 'all' | TransactionKind;

const FILTERS: readonly { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'deposit', label: 'Deposits' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'transfer', label: 'Transfers' },
];

/** Every deposit, withdrawal and wallet transfer, newest first. */
export function TransactionsScreen({
  navigation,
}: AppStackScreenProps<'Transactions'>) {
  const account = useAccount();
  const [filter, setFilter] = useState<Filter>('all');
  const transactions = account.transactions.filter(
    transaction => filter === 'all' || transaction.kind === filter,
  );

  return (
    <Screen>
      <ScreenHeader title="Transaction History" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.wrap}>
          {FILTERS.map(option => (
            <Chip
              key={option.value}
              label={option.label}
              selected={filter === option.value}
              onPress={() => setFilter(option.value)}
            />
          ))}
        </View>
        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions"
            message="Deposits, withdrawals and transfers appear here."
          />
        ) : (
          <Card>
            {transactions.map((transaction, index) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                divider={index < transactions.length - 1}
              />
            ))}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
