import { useState } from 'react';
import { Clipboard, ScrollView, Share, View } from 'react-native';

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
import { logger } from '../../../utils/logger';
import { styles } from './styles';

const REFERRAL_CODE = 'CXRAHUL50';
const INVITE_URL = 'https://cryptoex.in/invite/' + REFERRAL_CODE;

const STATS = [
  { value: '7', label: 'Friends Invited' },
  { value: '4', label: 'KYC Completed' },
  { value: '₹1,200', label: 'Rewards Earned' },
] as const;

const HISTORY = [
  { name: 'Priya S.', month: 'Mar 2024', reward: '₹300', status: 'Paid' },
  { name: 'Amit K.', month: 'Feb 2024', reward: '₹300', status: 'Paid' },
  { name: 'Rahul M.', month: 'Feb 2024', reward: '₹300', status: 'Paid' },
  { name: 'Neha T.', month: 'Jan 2024', reward: '₹300', status: 'Paid' },
] as const;

/** Referral code, sharing and payout history. */
export function ReferAndEarnScreen({
  navigation,
}: AppStackScreenProps<'ReferAndEarn'>) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    // Deprecated in core but still shipped; swap for a clipboard package if it goes.
    Clipboard.setString(REFERRAL_CODE);
    setCopied(true);
  };

  const onShare = () => {
    Share.share({
      message:
        'Join me on CryptoEx with code ' + REFERRAL_CODE + ': ' + INVITE_URL,
    }).catch(error => logger.warn('Unable to open the share sheet', error));
  };

  return (
    <Screen>
      <ScreenHeader title="Refer & Earn" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.hero}>
          <Icon name="gift" size={26} />
          <Text variant="subtitle" tone="primary" style={styles.heroTitle}>
            Earn ₹300 per referral
          </Text>
          <Text variant="caption" tone="muted" style={styles.heroBody}>
            Your friend gets ₹100 on first trade. You earn ₹300 when they
            complete KYC & trade.
          </Text>
        </Card>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          YOUR REFERRAL CODE
        </Text>
        <View
          style={[
            styles.codeRow,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Text tone="primary" style={styles.code}>
            {REFERRAL_CODE}
          </Text>
          <Button
            label={copied ? 'Copied' : 'Copy'}
            variant="secondary"
            icon="copy"
            style={styles.copyButton}
            onPress={onCopy}
          />
        </View>

        <Button
          label="Share Invite Link"
          icon="send"
          style={styles.share}
          onPress={onShare}
        />

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          YOUR STATS
        </Text>
        <View style={styles.stats}>
          {STATS.map(stat => (
            <Card key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text variant="caption" tone="muted" style={styles.statLabel}>
                {stat.label}
              </Text>
            </Card>
          ))}
        </View>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          REFERRAL HISTORY
        </Text>
        <Card>
          {HISTORY.map((entry, index) => (
            <ListRow
              key={entry.name}
              icon="users"
              title={entry.name}
              subtitle={entry.month}
              divider={index < HISTORY.length - 1}
              trailing={
                <View>
                  <Text variant="label" tone="success">
                    {entry.reward}
                  </Text>
                  <Badge label={entry.status} tone="success" />
                </View>
              }
            />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
