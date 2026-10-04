import { Alert, ScrollView, View } from 'react-native';

import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { MAX_BANK_ACCOUNTS } from '../../../constants/funds';
import { useAccount } from '../../../hooks/useAccount';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  maskAccountNumber,
  removeBankAccount,
  setPrimaryBankAccount,
} from '../../../services/account';
import { styles } from './styles';

/** Linked bank accounts for INR deposits and withdrawals. */
export function BankAccountsScreen({
  navigation,
}: AppStackScreenProps<'BankAccounts'>) {
  const theme = useTheme();
  const { bankAccounts } = useAccount();

  const onRemove = (id: string, name: string) =>
    Alert.alert(
      'Remove ' + name + '?',
      'You will not be able to deposit from or withdraw to it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeBankAccount(id);
            showToast('Bank account removed');
          },
        },
      ],
    );

  return (
    <Screen>
      <ScreenHeader title="Bank Accounts" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        {bankAccounts.length === 0 ? (
          <EmptyState
            title="No bank account linked"
            message="Link an account in your name to deposit and withdraw INR."
          />
        ) : (
          bankAccounts.map(bank => (
            <Card key={bank.id} padded>
              <View style={styles.row}>
                <Text variant="subtitle" style={[styles.bold, styles.grow]}>
                  {bank.bankName}
                </Text>
                {bank.primary ? <Badge label="Primary" tone="success" /> : null}
              </View>
              <Text variant="caption" tone="muted">
                {bank.holderName} · {maskAccountNumber(bank.accountNumber)} ·{' '}
                {bank.ifsc}
              </Text>
              <View style={[styles.row, styles.actions]}>
                {bank.primary ? null : (
                  <Button
                    label="Make primary"
                    variant="secondary"
                    style={styles.grow}
                    onPress={() => setPrimaryBankAccount(bank.id)}
                  />
                )}
                <Button
                  label="Remove"
                  variant="secondary"
                  style={[styles.grow, { borderColor: theme.colors.danger }]}
                  onPress={() => onRemove(bank.id, bank.bankName)}
                />
              </View>
            </Card>
          ))
        )}
        {bankAccounts.length < MAX_BANK_ACCOUNTS ? (
          <Button
            label="Add Bank Account"
            icon="plus"
            onPress={() => navigation.navigate('AddBankAccount')}
          />
        ) : (
          <Text variant="caption" tone="muted" style={styles.centerText}>
            You can link up to {MAX_BANK_ACCOUNTS} bank accounts.
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}
