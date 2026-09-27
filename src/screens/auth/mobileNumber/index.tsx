import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import type { IconName } from '../../../components/ui/icons';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { COUNTRY_CODE, MOBILE_NUMBER_LENGTH } from '../../../constants/auth';
import { useTheme } from '../../../hooks/useTheme';
import type { AuthStackScreenProps } from '../../../navigation/types';
import { styles } from './styles';

const COMPLIANCE: readonly { icon: IconName; label: string }[] = [
  { icon: 'shield', label: 'FIU Compliant' },
  { icon: 'lock', label: 'ISO/IEC 27001:2022' },
  { icon: 'database', label: 'Proof of Reserves' },
];

/** Entry point of the app: the only credential is a mobile number. */
export function MobileNumberScreen({
  navigation,
}: AuthStackScreenProps<'MobileNumber'>) {
  const theme = useTheme();
  const [mobileNumber, setMobileNumber] = useState('');

  const isComplete = mobileNumber.length === MOBILE_NUMBER_LENGTH;

  const onChangeMobileNumber = (value: string) =>
    setMobileNumber(value.replace(/\D/g, '').slice(0, MOBILE_NUMBER_LENGTH));

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <View
            style={[styles.mark, { backgroundColor: theme.colors.primary }]}
          >
            <Icon name="trending-up" size={15} color={theme.colors.success} />
            <Text tone="inverted" style={styles.markLabel}>
              CryptoEx
            </Text>
          </View>
          <Text variant="title" tone="primary" style={styles.wordmark}>
            CryptoEx
          </Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text tone="muted" style={styles.subtitle}>
          India&apos;s trusted crypto exchange
        </Text>

        <Text variant="overline" tone="muted" style={styles.fieldLabel}>
          MOBILE NUMBER
        </Text>
        <View style={styles.fieldRow}>
          <View
            style={[
              styles.countryBox,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={styles.flag}>🇮🇳</Text>
            <Text variant="body" style={styles.countryCode}>
              {COUNTRY_CODE}
            </Text>
          </View>

          <View
            style={[
              styles.numberBox,
              {
                backgroundColor: theme.colors.surface,
                borderColor: isComplete
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
          >
            <TextInput
              accessibilityLabel="Mobile number"
              autoFocus
              autoComplete="tel"
              keyboardType="number-pad"
              textContentType="telephoneNumber"
              maxLength={MOBILE_NUMBER_LENGTH}
              placeholder="98765 43210"
              placeholderTextColor={theme.colors.textMuted}
              value={mobileNumber}
              onChangeText={onChangeMobileNumber}
              style={[styles.input, { color: theme.colors.text }]}
            />
          </View>
        </View>

        <Button
          label="Continue"
          disabled={!isComplete}
          style={styles.action}
          onPress={() =>
            navigation.navigate('OtpVerification', { mobileNumber })
          }
        />

        <View style={styles.divider}>
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: theme.colors.border },
            ]}
          />
          <Text variant="caption" tone="muted">
            or
          </Text>
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: theme.colors.border },
            ]}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.google,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={styles.googleMark}>G</Text>
          <Text variant="body" style={styles.googleLabel}>
            Continue with Google
          </Text>
        </Pressable>

        <Card style={styles.compliance}>
          {COMPLIANCE.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.complianceRow,
                index < COMPLIANCE.length - 1 && [
                  styles.complianceDivider,
                  { borderBottomColor: theme.colors.border },
                ],
              ]}
            >
              <Icon name={item.icon} size={20} />
              <Text variant="body" style={styles.complianceLabel}>
                {item.label}
              </Text>
              <Icon name="check" size={18} color={theme.colors.success} />
            </View>
          ))}
        </Card>

        <Text variant="caption" tone="muted" style={styles.legal}>
          By continuing you agree to{' '}
          <Text variant="caption" tone="primary" style={styles.legalLink}>
            Terms
          </Text>{' '}
          and{' '}
          <Text variant="caption" tone="primary" style={styles.legalLink}>
            Privacy
          </Text>
        </Text>
      </ScrollView>
    </Screen>
  );
}
