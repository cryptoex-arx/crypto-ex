import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { DetailRows } from '../../../components/common/DetailRows';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Input } from '../../../components/ui/Input';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useAccount } from '../../../hooks/useAccount';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { addBankAccount, maskAccountNumber } from '../../../services/account';
import {
  submitKyc,
  userStore,
  validateAadhaar,
  validatePan,
} from '../../../services/user';
import { styles } from './styles';

const STEPS = ['PAN', 'Aadhaar', 'Selfie', 'Bank', 'Review'] as const;
/** How long the simulated liveness check takes. */
const LIVENESS_MS = 1500;

/** PAN → Aadhaar OTP → selfie → bank account → submit. */
export function KycFlowScreen({ navigation }: AppStackScreenProps<'KycFlow'>) {
  const theme = useTheme();
  const { profile } = useStore(userStore);
  const { bankAccounts } = useAccount();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string>();

  const [pan, setPan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [sentOtp, setSentOtp] = useState<string>();
  const [otp, setOtp] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [selfieDone, setSelfieDone] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');

  const bank = bankAccounts.find(item => item.primary);

  useEffect(() => {
    if (!capturing) {
      return;
    }
    const timer = setTimeout(() => {
      setCapturing(false);
      setSelfieDone(true);
    }, LIVENESS_MS);
    return () => clearTimeout(timer);
  }, [capturing]);

  const next = () => {
    setError(undefined);
    setStep(current => current + 1);
  };

  const onBack = () => {
    if (step === 0) {
      navigation.goBack();
      return;
    }
    setError(undefined);
    setStep(step - 1);
  };

  const fail = (message: string | undefined) => {
    setError(message);
    return message !== undefined;
  };

  const onPanNext = () => {
    if (!fail(validatePan(pan))) {
      next();
    }
  };

  const onSendOtp = () => {
    if (fail(validateAadhaar(aadhaar))) {
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSentOtp(code);
    setOtp('');
    // No UIDAI connection in this build: show the code instead of an SMS.
    showToast(
      'OTP sent to your Aadhaar mobile',
      'default',
      'Demo OTP: ' + code,
    );
  };

  const onVerifyOtp = () => {
    if (otp !== sentOtp) {
      setError('Wrong OTP. Check the code and try again.');
      return;
    }
    setAadhaarVerified(true);
    next();
  };

  const onLinkBank = () => {
    const result = addBankAccount({
      holderName: profile.fullName,
      accountNumber,
      confirmAccountNumber,
      ifsc,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    next();
  };

  const onSubmit = () => {
    const result = submitKyc(pan, aadhaar);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast('KYC submitted', 'success', 'We will notify you once verified.');
    navigation.goBack();
  };

  return (
    <Screen>
      <ScreenHeader title={'KYC · ' + STEPS[step]} onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.progress}>
          {STEPS.map((label, index) => (
            <View
              key={label}
              style={[
                styles.progressStep,
                {
                  backgroundColor:
                    index <= step ? theme.colors.primary : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
        <Text variant="caption" tone="muted">
          Step {step + 1} of {STEPS.length}
        </Text>

        {step === 0 ? (
          <>
            <Text variant="subtitle" style={styles.bold}>
              Enter your PAN
            </Text>
            <Input
              label="PAN"
              placeholder="ABCDE1234F"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={10}
              value={pan}
              onChangeText={text => setPan(text.toUpperCase())}
              errorMessage={error}
            />
            <InfoBanner
              icon="user"
              message={'Name on PAN must match: ' + profile.fullName}
            />
            <Button
              label="Continue"
              disabled={pan.length !== 10}
              onPress={onPanNext}
            />
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Text variant="subtitle" style={styles.bold}>
              Verify Aadhaar
            </Text>
            <Input
              label="Aadhaar number"
              placeholder="12 digits"
              keyboardType="number-pad"
              maxLength={12}
              editable={!sentOtp}
              value={aadhaar}
              onChangeText={text => setAadhaar(text.replace(/\D/g, ''))}
            />
            {sentOtp ? (
              <>
                <Input
                  label="OTP"
                  placeholder="6-digit OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={text => setOtp(text.replace(/\D/g, ''))}
                  errorMessage={error}
                />
                <Button
                  label="Verify OTP"
                  disabled={otp.length !== 6}
                  onPress={onVerifyOtp}
                />
                <Button
                  label="Resend OTP"
                  variant="secondary"
                  onPress={onSendOtp}
                />
              </>
            ) : (
              <>
                {error ? (
                  <Text variant="caption" tone="danger">
                    {error}
                  </Text>
                ) : null}
                <Button
                  label="Send OTP"
                  disabled={aadhaar.length !== 12}
                  onPress={onSendOtp}
                />
              </>
            )}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Text variant="subtitle" style={styles.bold}>
              Selfie & liveness check
            </Text>
            <Card padded style={styles.center}>
              <View
                style={[
                  styles.selfie,
                  {
                    borderColor: selfieDone
                      ? theme.colors.success
                      : theme.colors.border,
                  },
                ]}
              >
                {capturing ? (
                  <ActivityIndicator color={theme.colors.primary} />
                ) : (
                  <Icon
                    name={selfieDone ? 'check-circle' : 'camera'}
                    size={40}
                    color={
                      selfieDone ? theme.colors.success : theme.colors.textMuted
                    }
                  />
                )}
              </View>
              <Text tone="muted" style={styles.centerText}>
                {selfieDone
                  ? 'Face matched with your Aadhaar photo.'
                  : 'Good light, no glasses or cap. Camera capture is simulated in this build.'}
              </Text>
            </Card>
            {selfieDone ? (
              <Button label="Continue" onPress={next} />
            ) : (
              <Button
                label={capturing ? 'Checking…' : 'Take selfie'}
                icon="camera"
                disabled={capturing}
                onPress={() => setCapturing(true)}
              />
            )}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Text variant="subtitle" style={styles.bold}>
              Link your bank account
            </Text>
            {bank ? (
              <>
                <InfoBanner
                  icon="check-circle"
                  color={theme.colors.success}
                  message={
                    bank.bankName +
                    ' ' +
                    maskAccountNumber(bank.accountNumber) +
                    ' is linked.'
                  }
                />
                <Button label="Continue" onPress={next} />
              </>
            ) : (
              <>
                <Input
                  label="Account holder"
                  value={profile.fullName}
                  editable={false}
                />
                <Input
                  label="Account number"
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={18}
                  value={accountNumber}
                  onChangeText={text =>
                    setAccountNumber(text.replace(/\D/g, ''))
                  }
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
                  maxLength={11}
                  value={ifsc}
                  onChangeText={text => setIfsc(text.toUpperCase())}
                  errorMessage={error}
                />
                <Button
                  label="Link & continue"
                  disabled={
                    accountNumber === '' ||
                    confirmAccountNumber === '' ||
                    ifsc === ''
                  }
                  onPress={onLinkBank}
                />
              </>
            )}
          </>
        ) : null}

        {step === 4 ? (
          <>
            <Text variant="subtitle" style={styles.bold}>
              Review and submit
            </Text>
            <Card padded>
              <DetailRows
                rows={[
                  { label: 'Name', value: profile.fullName },
                  { label: 'PAN', value: pan },
                  {
                    label: 'Aadhaar',
                    value:
                      'XXXX XXXX ' +
                      aadhaar.slice(-4) +
                      (aadhaarVerified ? ' ✓' : ''),
                  },
                  { label: 'Selfie', value: selfieDone ? 'Passed ✓' : '—' },
                  {
                    label: 'Bank',
                    value: bank
                      ? bank.bankName +
                        ' ' +
                        maskAccountNumber(bank.accountNumber)
                      : '—',
                  },
                ]}
              />
            </Card>
            {error ? (
              <Text variant="caption" tone="danger">
                {error}
              </Text>
            ) : null}
            <Button label="Submit for verification" onPress={onSubmit} />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
