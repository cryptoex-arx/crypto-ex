import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Button } from '../../../components/ui/Button';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import {
  formatMobileNumber,
  OTP_LENGTH,
  OTP_RESEND_SECONDS,
} from '../../../constants/auth';
import { useTheme } from '../../../hooks/useTheme';
import type { AuthStackScreenProps } from '../../../navigation/types';
import { useAppState } from '../../../store/useAppState';
import { styles } from './styles';

const BOXES = Array.from({ length: OTP_LENGTH }, (_, index) => index);

function formatCountdown(seconds: number): string {
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
}

/** Counts down to zero once, and restarts whenever `token` changes. */
function useResendCountdown(token: number) {
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_SECONDS);

  useEffect(() => {
    setSecondsLeft(OTP_RESEND_SECONDS);

    const interval = setInterval(
      () => setSecondsLeft(current => (current > 0 ? current - 1 : 0)),
      1000,
    );

    return () => clearInterval(interval);
  }, [token]);

  return secondsLeft;
}

/**
 * Second and last step of sign-in. No verification happens yet — a complete
 * code flips the placeholder session flag the root navigator switches on.
 */
export function OtpVerificationScreen({
  navigation,
  route,
}: AuthStackScreenProps<'OtpVerification'>) {
  const theme = useTheme();
  const { dispatch } = useAppState();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [resendToken, setResendToken] = useState(0);
  const secondsLeft = useResendCountdown(resendToken);

  const isComplete = code.length === OTP_LENGTH;

  const onChangeCode = (value: string) =>
    setCode(value.replace(/\D/g, '').slice(0, OTP_LENGTH));

  const onResend = () => {
    setCode('');
    setResendToken(current => current + 1);
  };

  return (
    <Screen>
      <ScreenHeader onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Enter OTP</Text>
        <Text tone="muted" style={styles.subtitle}>
          Sent to{' '}
          <Text tone="primary" style={styles.subtitleNumber}>
            {formatMobileNumber(route.params.mobileNumber)}
          </Text>
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enter the OTP"
          style={styles.codeWrapper}
          onPress={() => inputRef.current?.focus()}
        >
          <View style={styles.boxes}>
            {BOXES.map(index => {
              const filled = index < code.length;
              const active = index === code.length;

              return (
                <View
                  key={index}
                  style={[
                    styles.box,
                    {
                      backgroundColor: active
                        ? theme.colors.background
                        : theme.colors.surface,
                      borderColor:
                        filled || active
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                >
                  {active ? (
                    <View
                      style={[
                        styles.caret,
                        { backgroundColor: theme.colors.success },
                      ]}
                    />
                  ) : (
                    <Text style={styles.digit}>{code.charAt(index)}</Text>
                  )}
                </View>
              );
            })}
          </View>

          <TextInput
            ref={inputRef}
            accessibilityLabel="One-time password"
            autoFocus
            caretHidden
            autoComplete="sms-otp"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={OTP_LENGTH}
            value={code}
            onChangeText={onChangeCode}
            style={styles.hiddenInput}
          />
        </Pressable>

        <Button
          label="Verify & Continue"
          disabled={!isComplete}
          style={styles.action}
          onPress={() => dispatch({ type: 'session/signIn' })}
        />

        <View style={styles.resend}>
          <Text tone="muted">Didn&apos;t receive it?</Text>
          {secondsLeft > 0 ? (
            <Text tone="primary" style={styles.resendValue}>
              Resend in {formatCountdown(secondsLeft)}
            </Text>
          ) : (
            <Pressable accessibilityRole="button" onPress={onResend}>
              <Text tone="primary" style={styles.resendValue}>
                Resend code
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.notice}>
          <InfoBanner icon="lock" message="Never share your OTP with anyone" />
        </View>
      </ScrollView>
    </Screen>
  );
}
