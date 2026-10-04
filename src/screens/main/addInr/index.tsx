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
import { INR_DEPOSIT_METHODS, INR_MIN_DEPOSIT } from '../../../constants/funds';
import { useAccount } from '../../../hooks/useAccount';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  depositInr,
  getAvailableInr,
  maskAccountNumber,
} from '../../../services/account';
import {
  formatInr,
  parseAmount,
  sanitizeDecimalInput,
} from '../../../utils/format';
import { styles } from './styles';

const QUICK_AMOUNTS = [1000, 5000, 10_000, 25_000] as const;

/** INR deposit from the linked bank account over UPI, IMPS or NEFT. */
export function AddInrScreen({ navigation }: AppStackScreenProps<'AddInr'>) {
  const account = useAccount();
  const [amountText, setAmountText] = useState('');
  const [methodId, setMethodId] = useState<string>('UPI');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const bank = account.bankAccounts.find(item => item.primary);
  const amount = parseAmount(amountText);
  const method = INR_DEPOSIT_METHODS.find(item => item.id === methodId)!;

  const onConfirm = () => {
    const result = depositInr(amount, methodId);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setConfirming(false);
    showToast(
      'Deposit initiated',
      'success',
      formatInr(amount, 'full') + ' via ' + method.title + ' is processing.',
    );
    navigation.replace('Transactions');
  };

  return (
    <Screen>
      <ScreenHeader title="Add INR" onBack={navigation.goBack} />
      <KycGate>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="caption" tone="muted">
            INR balance: {formatInr(getAvailableInr(account), 'full')}
          </Text>

          <Input
            label="Amount (INR)"
            placeholder={'Min ' + formatInr(INR_MIN_DEPOSIT)}
            keyboardType="decimal-pad"
            value={amountText}
            onChangeText={text => setAmountText(sanitizeDecimalInput(text, 2))}
          />
          <View style={styles.wrap}>
            {QUICK_AMOUNTS.map(quick => (
              <Chip
                key={quick}
                label={'+ ' + formatInr(quick)}
                onPress={() =>
                  setAmountText(
                    String((Number.isFinite(amount) ? amount : 0) + quick),
                  )
                }
              />
            ))}
          </View>

          <Text variant="overline" tone="muted" style={styles.sectionLabel}>
            PAYMENT METHOD
          </Text>
          <Card>
            {INR_DEPOSIT_METHODS.map((item, index) => (
              <ListRow
                key={item.id}
                icon={item.id === 'UPI' ? 'zap' : 'credit-card'}
                title={item.title}
                subtitle={item.subtitle}
                divider={index < INR_DEPOSIT_METHODS.length - 1}
                onPress={() => setMethodId(item.id)}
                trailing={<Radio selected={item.id === methodId} />}
              />
            ))}
          </Card>

          {bank ? (
            <InfoBanner
              icon="credit-card"
              message={
                'Pay only from ' +
                bank.bankName +
                ' ' +
                maskAccountNumber(bank.accountNumber) +
                '. Deposits from other accounts are refunded.'
              }
            />
          ) : (
            <View style={styles.missingBank}>
              <InfoBanner
                icon="alert-circle"
                tone="danger"
                message="Link a bank account before depositing."
              />
              <Button
                label="Add Bank Account"
                variant="secondary"
                onPress={() => navigation.navigate('AddBankAccount')}
              />
            </View>
          )}

          <Button
            label={
              Number.isFinite(amount)
                ? 'Deposit ' + formatInr(amount, 'full')
                : 'Deposit'
            }
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
        title="Confirm deposit"
        rows={[
          { label: 'Amount', value: formatInr(amount, 'full') },
          { label: 'Method', value: method.title },
          {
            label: 'From',
            value: bank
              ? bank.bankName + ' ' + maskAccountNumber(bank.accountNumber)
              : '—',
          },
          { label: 'Fee', value: formatInr(0, 'full') },
          { label: 'You get', value: formatInr(amount, 'full') },
        ]}
        confirmLabel="Pay now"
        error={error}
        onConfirm={onConfirm}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}
