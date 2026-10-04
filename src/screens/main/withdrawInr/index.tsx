import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ConfirmSheet } from '../../../components/common/ConfirmSheet';
import { KycGate } from '../../../components/common/KycGate';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Input } from '../../../components/ui/Input';
import { ListRow } from '../../../components/ui/ListRow';
import { Radio } from '../../../components/ui/Radio';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import {
  INR_MIN_WITHDRAWAL,
  INR_WITHDRAWAL_FEE,
} from '../../../constants/funds';
import { useAccount } from '../../../hooks/useAccount';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  getAvailableInr,
  maskAccountNumber,
  withdrawInr,
} from '../../../services/account';
import {
  floorTo,
  formatInr,
  parseAmount,
  sanitizeDecimalInput,
} from '../../../utils/format';
import { styles } from './styles';

/** INR payout to one of the linked bank accounts over IMPS. */
export function WithdrawInrScreen({
  navigation,
}: AppStackScreenProps<'WithdrawInr'>) {
  const account = useAccount();
  const available = getAvailableInr(account);
  const [amountText, setAmountText] = useState('');
  const [bankId, setBankId] = useState(
    account.bankAccounts.find(item => item.primary)?.id,
  );
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const amount = parseAmount(amountText);
  const bank = account.bankAccounts.find(item => item.id === bankId);

  const onConfirm = () => {
    const result = withdrawInr(amount, bankId ?? '');
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setConfirming(false);
    showToast(
      'Withdrawal requested',
      'success',
      formatInr(amount - INR_WITHDRAWAL_FEE, 'full') + ' is on its way.',
    );
    navigation.replace('Transactions');
  };

  return (
    <Screen>
      <ScreenHeader title="Withdraw INR" onBack={navigation.goBack} />
      <KycGate>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Amount (INR)"
            placeholder={'Min ' + formatInr(INR_MIN_WITHDRAWAL)}
            keyboardType="decimal-pad"
            value={amountText}
            onChangeText={text => setAmountText(sanitizeDecimalInput(text, 2))}
          />
          <View style={styles.row}>
            <Text variant="caption" tone="muted" style={styles.grow}>
              Available: {formatInr(available, 'full')}
            </Text>
            <Chip
              label="MAX"
              onPress={() =>
                setAmountText(String(floorTo(Math.max(0, available), 2)))
              }
            />
          </View>

          <Text variant="overline" tone="muted" style={styles.sectionLabel}>
            TO BANK ACCOUNT
          </Text>
          {account.bankAccounts.length === 0 ? (
            <Button
              label="Add Bank Account"
              variant="secondary"
              onPress={() => navigation.navigate('AddBankAccount')}
            />
          ) : (
            <Card>
              {account.bankAccounts.map((item, index) => (
                <ListRow
                  key={item.id}
                  icon="credit-card"
                  title={item.bankName}
                  subtitle={
                    maskAccountNumber(item.accountNumber) +
                    ' · ' +
                    item.ifsc +
                    (item.primary ? ' · Primary' : '')
                  }
                  divider={index < account.bankAccounts.length - 1}
                  onPress={() => setBankId(item.id)}
                  trailing={<Radio selected={item.id === bankId} />}
                />
              ))}
            </Card>
          )}

          <InfoBanner
            icon="info"
            message={
              'IMPS fee ' +
              formatInr(INR_WITHDRAWAL_FEE) +
              '. Payouts usually land within minutes.'
            }
          />

          <Button
            label="Withdraw"
            disabled={!bank || !(amount > 0)}
            onPress={() => {
              setError(undefined);
              setConfirming(true);
            }}
          />
        </ScrollView>
      </KycGate>

      <ConfirmSheet
        visible={confirming}
        title="Confirm withdrawal"
        rows={[
          { label: 'Amount', value: formatInr(amount, 'full') },
          { label: 'Fee', value: formatInr(INR_WITHDRAWAL_FEE, 'full') },
          {
            label: 'You receive',
            value: formatInr(Math.max(0, amount - INR_WITHDRAWAL_FEE), 'full'),
          },
          {
            label: 'To',
            value: bank
              ? bank.bankName + ' ' + maskAccountNumber(bank.accountNumber)
              : '—',
          },
        ]}
        confirmLabel="Withdraw"
        error={error}
        onConfirm={onConfirm}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}
