import { useState } from 'react';
import { ScrollView } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Input } from '../../../components/ui/Input';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { BANK_NAMES } from '../../../constants/funds';
import { useStore } from '../../../hooks/useStore';
import type { AppStackScreenProps } from '../../../navigation/types';
import { addBankAccount, validateIfsc } from '../../../services/account';
import { userStore } from '../../../services/user';
import { styles } from './styles';

/** Links a bank account in the user's name. */
export function AddBankAccountScreen({
  navigation,
}: AppStackScreenProps<'AddBankAccount'>) {
  const { profile } = useStore(userStore);
  const [holderName, setHolderName] = useState(profile.fullName);
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [error, setError] = useState<string>();
  const bankName =
    ifsc.length === 11 && !validateIfsc(ifsc)
      ? BANK_NAMES[ifsc.slice(0, 4)] ?? ifsc.slice(0, 4) + ' Bank'
      : undefined;

  const onSave = () => {
    const result = addBankAccount({
      holderName,
      accountNumber,
      confirmAccountNumber,
      ifsc,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast('Bank account linked', 'success', result.value.bankName);
    navigation.goBack();
  };

  return (
    <Screen>
      <ScreenHeader title="Add Bank Account" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <InfoBanner
          icon="info"
          message="The account must be in your name, matching your PAN. We verify it with a ₹1 deposit."
        />
        <Input
          label="Account holder name"
          value={holderName}
          onChangeText={setHolderName}
        />
        <Input
          label="Account number"
          placeholder="9 to 18 digits"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={18}
          value={accountNumber}
          onChangeText={text => setAccountNumber(text.replace(/\D/g, ''))}
        />
        <Input
          label="Confirm account number"
          keyboardType="number-pad"
          maxLength={18}
          value={confirmAccountNumber}
          onChangeText={text =>
            setConfirmAccountNumber(text.replace(/\D/g, ''))
          }
        />
        <Input
          label="IFSC"
          placeholder="HDFC0001234"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={11}
          value={ifsc}
          onChangeText={text => setIfsc(text.toUpperCase())}
        />
        {bankName ? (
          <Text variant="caption" tone="success">
            {bankName}
          </Text>
        ) : null}
        {error ? (
          <Text variant="caption" tone="danger">
            {error}
          </Text>
        ) : null}
        <Button
          label="Link account"
          disabled={
            holderName.trim() === '' ||
            accountNumber === '' ||
            confirmAccountNumber === '' ||
            ifsc === ''
          }
          onPress={onSave}
        />
      </ScrollView>
    </Screen>
  );
}
