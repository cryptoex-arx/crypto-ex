import { useState } from 'react';
import { Alert, Linking, ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import type { IconName } from '../../../components/ui/icons';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { SUPPORT_EMAIL } from '../../../constants/app';
import { formatMobileNumber } from '../../../constants/auth';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { notify } from '../../../services/notifications';
import { userStore } from '../../../services/user';
import { logger } from '../../../utils/logger';
import { styles } from './styles';

interface ContactChannel {
  id: 'chat' | 'email' | 'callback';
  icon: IconName;
  title: string;
  subtitle: string;
  highlight?: boolean;
}

const CHANNELS: readonly ContactChannel[] = [
  {
    id: 'chat',
    icon: 'message-circle',
    title: 'Live Chat',
    subtitle: 'Avg response: 2 min',
    highlight: true,
  },
  {
    id: 'email',
    icon: 'mail',
    title: 'Email Support',
    subtitle: SUPPORT_EMAIL,
  },
  {
    id: 'callback',
    icon: 'phone',
    title: 'Call Back',
    subtitle: '9 AM - 9 PM IST',
  },
];

const FAQS: readonly { question: string; answer: string }[] = [
  {
    question: 'How do I deposit INR?',
    answer:
      'Complete KYC and link a bank account, then open Portfolio → Add INR. Pay by UPI, IMPS or NEFT from your linked account; the minimum is ₹100. Your balance updates as soon as the bank confirms.',
  },
  {
    question: 'What is the minimum trade amount?',
    answer:
      'Spot orders start at ₹100. SIPs start at ₹500, and each coin basket shows its own minimum.',
  },
  {
    question: 'How long does withdrawal take?',
    answer:
      'INR withdrawals go over IMPS for a ₹9 fee and usually land within minutes. Crypto withdrawals are broadcast after security checks; the network fee depends on the chain you pick.',
  },
  {
    question: 'Why is my KYC pending?',
    answer:
      'Verification is automatic and usually finishes a few seconds after you submit PAN, Aadhaar, selfie and bank details. We send a notification when it completes.',
  },
  {
    question: 'How is TDS calculated?',
    answer:
      '1% TDS applies to the sale value of crypto (Section 194S). Account → Tax Reports shows your yearly totals and lets you export them.',
  },
];

/** Support channels and the most common questions. */
export function HelpSupportScreen({
  navigation,
}: AppStackScreenProps<'HelpSupport'>) {
  const theme = useTheme();
  const [openQuestion, setOpenQuestion] = useState<string>();

  const onRequestCallback = () => {
    const mobile = formatMobileNumber(userStore.get().profile.mobileNumber);
    Alert.alert('Request a call back?', 'We will call ' + mobile + '.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Request',
        onPress: () => {
          notify(
            'account',
            'Call-back requested',
            'Our team will call ' +
              mobile +
              ' within 30 minutes (9 AM - 9 PM IST).',
          );
        },
      },
    ]);
  };

  const onPressChannel = (channel: ContactChannel) => {
    if (channel.id === 'chat') {
      navigation.navigate('SupportChat');
    } else if (channel.id === 'callback') {
      onRequestCallback();
    } else {
      Linking.openURL('mailto:' + SUPPORT_EMAIL).catch(error => {
        logger.warn('Unable to open the support channel', error);
        showToast('No mail app found', 'danger', SUPPORT_EMAIL);
      });
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Help & Support" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          CONTACT US
        </Text>
        <Card>
          {CHANNELS.map((channel, index) => (
            <ListRow
              key={channel.title}
              icon={channel.icon}
              iconColor={channel.highlight ? theme.colors.success : undefined}
              iconBackground={
                channel.highlight ? theme.colors.successSurface : undefined
              }
              title={channel.title}
              subtitle={channel.subtitle}
              showChevron
              divider={index < CHANNELS.length - 1}
              onPress={() => onPressChannel(channel)}
            />
          ))}
        </Card>

        <Text variant="overline" tone="muted" style={styles.faqLabel}>
          FREQUENTLY ASKED
        </Text>
        <Card>
          {FAQS.map((faq, index) => {
            const open = openQuestion === faq.question;
            return (
              <View
                key={faq.question}
                style={
                  index < FAQS.length - 1 && [
                    styles.divider,
                    { borderBottomColor: theme.colors.border },
                  ]
                }
              >
                <ListRow
                  title={faq.question}
                  onPress={() =>
                    setOpenQuestion(open ? undefined : faq.question)
                  }
                  trailing={
                    <Icon
                      name={open ? 'chevron-down' : 'chevron-right'}
                      size={16}
                      color={theme.colors.textMuted}
                    />
                  }
                />
                {open ? (
                  <Text variant="body" tone="muted" style={styles.answer}>
                    {faq.answer}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </Screen>
  );
}
