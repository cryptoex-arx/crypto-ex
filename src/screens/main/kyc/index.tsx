import { ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useAccount } from '../../../hooks/useAccount';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { maskAccountNumber } from '../../../services/account';
import { type KycStatus, userStore } from '../../../services/user';
import { formatDateTime } from '../../../utils/format';
import { styles } from './styles';

const LIMITS = [
  { value: '₹10L', label: 'Daily Limit' },
  { value: '₹1Cr', label: 'Annual Limit' },
  { value: '∞', label: 'Crypto' },
] as const;

const STATUS: Record<
  KycStatus,
  { title: string; badge: string; tone: 'success' | 'neutral' }
> = {
  notStarted: { title: 'Not verified', badge: 'Pending', tone: 'neutral' },
  inReview: { title: 'Under review', badge: 'In review', tone: 'neutral' },
  verified: { title: 'KYC Verified', badge: '✓ Active', tone: 'success' },
};

/** KYC status, limits and the state of each verification step. */
export function KycScreen({ navigation }: AppStackScreenProps<'Kyc'>) {
  const theme = useTheme();
  const { kyc } = useStore(userStore);
  const { bankAccounts } = useAccount();
  const bank = bankAccounts.find(item => item.primary);
  const status = STATUS[kyc.status];
  const verified = kyc.status === 'verified';

  const steps = [
    {
      title: 'PAN Verification',
      subtitle: kyc.pan
        ? kyc.pan.slice(0, 5) + '••••' + kyc.pan.slice(-1)
        : 'Permanent Account Number',
      done: kyc.pan !== undefined,
    },
    {
      title: 'Aadhaar Verification',
      subtitle: kyc.aadhaarLast4
        ? 'XXXX XXXX ' + kyc.aadhaarLast4 + ' · OTP verified'
        : 'Verified with an OTP',
      done: kyc.aadhaarLast4 !== undefined,
    },
    {
      title: 'Selfie & Liveness',
      subtitle:
        kyc.status === 'notStarted' ? 'Face match with Aadhaar' : 'Passed',
      done: kyc.status !== 'notStarted',
    },
    {
      title: 'Bank Account',
      subtitle: bank
        ? bank.bankName + ' ' + maskAccountNumber(bank.accountNumber)
        : 'An account in your name',
      done: bank !== undefined,
    },
  ];

  return (
    <Screen>
      <ScreenHeader title="KYC & Verification" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.statusRow}>
            <Icon
              name={
                verified
                  ? 'shield-check'
                  : kyc.status === 'inReview'
                  ? 'clock'
                  : 'shield'
              }
              size={22}
              color={verified ? theme.colors.success : theme.colors.textMuted}
            />
            <View style={styles.statusBody}>
              <Text variant="subtitle" style={styles.statusTitle}>
                {status.title}
              </Text>
              <Text
                variant="caption"
                tone="muted"
                style={styles.statusSubtitle}
              >
                {verified && kyc.verifiedAt
                  ? 'Since ' + formatDateTime(kyc.verifiedAt)
                  : kyc.status === 'inReview'
                  ? 'Usually takes a few seconds'
                  : 'Needed to deposit and withdraw'}
              </Text>
            </View>
            <Badge label={status.badge} tone={status.tone} />
          </View>
          {verified ? (
            <View
              style={[styles.limits, { borderTopColor: theme.colors.border }]}
            >
              {LIMITS.map(limit => (
                <View key={limit.label} style={styles.limit}>
                  <Text variant="body" style={styles.limitValue}>
                    {limit.value}
                  </Text>
                  <Text
                    variant="caption"
                    tone="muted"
                    style={styles.limitLabel}
                  >
                    {limit.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          VERIFICATION STEPS
        </Text>
        <Card>
          {steps.map((step, index) => (
            <ListRow
              key={step.title}
              title={step.title}
              subtitle={step.subtitle}
              divider={index < steps.length - 1}
              leading={
                <View
                  style={[
                    styles.stepMark,
                    step.done && {
                      backgroundColor: theme.colors.successSurface,
                    },
                    {
                      borderColor: step.done
                        ? theme.colors.successSurface
                        : theme.colors.disabled,
                    },
                  ]}
                >
                  {step.done ? (
                    <Icon name="check" size={14} color={theme.colors.success} />
                  ) : null}
                </View>
              }
              trailing={
                step.done ? undefined : <Badge label="Pending" tone="neutral" />
              }
            />
          ))}
        </Card>

        {kyc.status === 'notStarted' ? (
          <Button
            label="Start KYC Verification"
            icon="shield"
            style={styles.cta}
            onPress={() => navigation.navigate('KycFlow')}
          />
        ) : null}

        <Text variant="caption" tone="muted" style={styles.footnote}>
          Documents are encrypted and never stored on this device
        </Text>
      </ScrollView>
    </Screen>
  );
}
