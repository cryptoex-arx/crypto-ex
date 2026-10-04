import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { PinPad } from '../../../components/common/PinPad';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Icon } from '../../../components/ui/Icon';
import type { IconName } from '../../../components/ui/icons';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  PIN_LENGTH,
  removePin,
  securityStore,
  setPin,
  verifyPin,
} from '../../../services/security';
import { styles } from './styles';

type Stage = 'current' | 'new' | 'confirm';

const STAGES: Record<
  Stage,
  { icon: IconName; title: string; subtitle: string }
> = {
  current: {
    icon: 'lock',
    title: 'Enter current PIN',
    subtitle: 'Confirm it’s you before changing your PIN',
  },
  new: {
    icon: 'key',
    title: 'Create a new PIN',
    subtitle: 'Avoid birthdays and repeated or sequential digits',
  },
  confirm: {
    icon: 'check-circle',
    title: 'Confirm your PIN',
    subtitle: 'Enter the same ' + PIN_LENGTH + ' digits again',
  },
};

/** Sets, changes or removes the app PIN, laid out like the lock screen. */
export function SetPinScreen({ navigation }: AppStackScreenProps<'SetPin'>) {
  const theme = useTheme();
  const { pinHash } = useStore(securityStore);
  const hasPin = pinHash !== undefined;
  const [stage, setStage] = useState<Stage>(hasPin ? 'current' : 'new');
  const [value, setValue] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string>();

  const steps: readonly Stage[] = hasPin
    ? ['current', 'new', 'confirm']
    : ['new', 'confirm'];
  const { icon, title, subtitle } = STAGES[stage];

  const onChange = (next: string) => {
    setError(undefined);
    setValue(next);
    if (next.length < PIN_LENGTH) {
      return;
    }
    setValue('');

    if (stage === 'current') {
      if (verifyPin(next)) {
        setStage('new');
      } else {
        setError('Wrong PIN. Try again.');
      }
      return;
    }
    if (stage === 'new') {
      setFirstPin(next);
      setStage('confirm');
      return;
    }
    if (next !== firstPin) {
      setError('PINs didn’t match. Start again.');
      setStage('new');
      return;
    }
    const result = setPin(next);
    if (!result.ok) {
      setError(result.error);
      setStage('new');
      return;
    }
    showToast(hasPin ? 'PIN changed' : 'App PIN is on', 'success');
    navigation.goBack();
  };

  const onRemove = () => {
    const hadBiometrics = securityStore.get().biometricEnabled;
    removePin();
    showToast(
      'App PIN removed',
      'default',
      hadBiometrics ? 'Biometric unlock is off too.' : undefined,
    );
    navigation.goBack();
  };

  return (
    <Screen>
      <ScreenHeader
        title={hasPin ? 'Change PIN' : 'Set App PIN'}
        onBack={navigation.goBack}
      />
      <View style={styles.container}>
        <Icon name={icon} size={32} />
        <Text variant="title" style={styles.title}>
          {title}
        </Text>
        <Text tone="muted" style={styles.subtitle}>
          {subtitle}
        </Text>

        <View style={styles.steps}>
          {steps.map(step => (
            <View
              key={step}
              style={[
                styles.step,
                {
                  backgroundColor:
                    steps.indexOf(step) <= steps.indexOf(stage)
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>

        <PinPad
          length={PIN_LENGTH}
          value={value}
          onChange={onChange}
          error={error}
        />

        <View style={styles.footer}>
          {hasPin && stage !== 'current' ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={onRemove}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text variant="label" tone="muted">
                Turn off app PIN
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
