import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';

import { PinPad } from '../../components/common/PinPad';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { useBiometryType } from '../../hooks/useBiometryType';
import { useStore } from '../../hooks/useStore';
import {
  biometryLabel,
  logActivity,
  MAX_PIN_ATTEMPTS,
  PIN_LENGTH,
  securityStore,
  unlockWithBiometrics,
  verifyPin,
} from '../../services/security';
import { userStore } from '../../services/user';
import { styles } from './styles';

export interface PinLockScreenProps {
  onUnlock: () => void;
  /** Forgotten PIN or too many attempts: sign out and clear the PIN. */
  onSignOut: () => void;
}

/**
 * Full-screen app lock on launch and on return. With biometric unlock on, the
 * Face ID / fingerprint prompt opens straight away and the PIN is the fallback.
 */
export function PinLockScreen({ onUnlock, onSignOut }: PinLockScreenProps) {
  const { profile } = useStore(userStore);
  const { biometricEnabled } = useStore(securityStore);
  const biometry = useBiometryType();
  const [value, setValue] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string>();
  const [checking, setChecking] = useState(false);
  const prompted = useRef(false);
  const firstName = profile.fullName.split(' ')[0];
  const label = biometryLabel(biometry);

  const tryBiometrics = useCallback(async () => {
    setChecking(true);
    const result = await unlockWithBiometrics();
    setChecking(false);
    if (result === 'success') {
      onUnlock();
    } else if (result === 'unavailable') {
      setError('Biometrics changed on this device. Use your PIN.');
    }
  }, [onUnlock]);

  // Open the biometric prompt once, as soon as the lock shows.
  useEffect(() => {
    if (biometricEnabled && !prompted.current) {
      prompted.current = true;
      tryBiometrics();
    }
  }, [biometricEnabled, tryBiometrics]);

  const onChange = (next: string) => {
    setError(undefined);
    setValue(next);
    if (next.length < PIN_LENGTH) {
      return;
    }
    setValue('');
    if (verifyPin(next)) {
      onUnlock();
      return;
    }
    const used = attempts + 1;
    setAttempts(used);
    if (used >= MAX_PIN_ATTEMPTS) {
      logActivity('Signed out', 'Too many wrong PIN attempts');
      onSignOut();
      return;
    }
    const left = MAX_PIN_ATTEMPTS - used;
    setError(
      'Wrong PIN. ' + left + (left === 1 ? ' attempt' : ' attempts') + ' left.',
    );
  };

  const onForgot = () =>
    Alert.alert(
      'Forgot your PIN?',
      'Sign in again with your mobile number and OTP. Your PIN will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign in again', style: 'destructive', onPress: onSignOut },
      ],
    );

  return (
    <Screen>
      <View style={styles.container}>
        <Icon name="lock" size={32} />
        <Text variant="title" style={styles.title}>
          Welcome back, {firstName}
        </Text>
        <Text tone="muted" style={styles.subtitle}>
          {biometricEnabled
            ? 'Use ' + label + ' or your ' + PIN_LENGTH + '-digit PIN'
            : 'Enter your ' + PIN_LENGTH + '-digit PIN to unlock CryptoEx'}
        </Text>
        <PinPad
          length={PIN_LENGTH}
          value={value}
          onChange={onChange}
          error={error}
        />
        {biometricEnabled ? (
          <Button
            label={checking ? 'Waiting for ' + label + '…' : 'Use ' + label}
            icon="fingerprint"
            disabled={checking}
            style={styles.biometric}
            onPress={tryBiometrics}
          />
        ) : null}
        <Button
          label="Forgot PIN?"
          variant="secondary"
          style={styles.forgot}
          onPress={onForgot}
        />
      </View>
    </Screen>
  );
}
