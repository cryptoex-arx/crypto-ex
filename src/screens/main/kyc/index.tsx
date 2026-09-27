import { ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { styles } from './styles';

const LIMITS = [
  { value: '₹10L', label: 'Daily Limit' },
  { value: '₹1Cr', label: 'Annual Limit' },
  { value: '∞', label: 'Crypto' },
] as const;

const STEPS = [
  { title: 'PAN Verification', subtitle: 'ABCDE1234F', done: true },
  { title: 'Aadhaar Verification', subtitle: 'Verified via OTP', done: true },
  { title: 'Bank Account', subtitle: 'HDFC ••••4321', done: true },
  { title: 'Selfie & Liveness', subtitle: 'Passed', done: true },
  {
    title: 'Level 2 — Advanced',
    subtitle: 'Required for ₹10L+ withdrawals',
    done: false,
  },
] as const;

/** KYC level, limits and the state of each verification step. */
export function KycScreen({ navigation }: AppStackScreenProps<'Kyc'>) {
  const theme = useTheme();

  return (
    <Screen>
      <ScreenHeader title="KYC & Verification" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.statusRow}>
            <Icon name="shield-check" size={22} color={theme.colors.success} />
            <View style={styles.statusBody}>
              <Text variant="subtitle" style={styles.statusTitle}>
                Level 2 Verified
              </Text>
              <Text
                variant="caption"
                tone="muted"
                style={styles.statusSubtitle}
              >
                Powered by Signzy
              </Text>
            </View>
            <Badge label="✓ Active" tone="success" />
          </View>

          <View
            style={[styles.limits, { borderTopColor: theme.colors.border }]}
          >
            {LIMITS.map(limit => (
              <View key={limit.label} style={styles.limit}>
                <Text variant="body" style={styles.limitValue}>
                  {limit.value}
                </Text>
                <Text variant="caption" tone="muted" style={styles.limitLabel}>
                  {limit.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          VERIFICATION STEPS
        </Text>
        <Card>
          {STEPS.map((step, index) => (
            <ListRow
              key={step.title}
              title={step.title}
              subtitle={step.subtitle}
              divider={index < STEPS.length - 1}
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
                step.done ? undefined : <Badge label="Pending" tone="success" />
              }
            />
          ))}
        </Card>

        <Button
          label="Start KYC Verification"
          icon="shield"
          style={styles.cta}
          onPress={() => undefined}
        />

        <Text variant="caption" tone="muted" style={styles.footnote}>
          Powered by DataSpike · Documents are encrypted and never stored on our
          servers
        </Text>
      </ScrollView>
    </Screen>
  );
}
