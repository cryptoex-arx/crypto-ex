import { Linking, ScrollView } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import type { IconName } from '../../../components/ui/icons';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { SUPPORT_EMAIL } from '../../../constants/app';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { logger } from '../../../utils/logger';
import { styles } from './styles';

interface ContactChannel {
  icon: IconName;
  title: string;
  subtitle: string;
  highlight?: boolean;
  url?: string;
}

const CHANNELS: readonly ContactChannel[] = [
  {
    icon: 'message-circle',
    title: 'Live Chat',
    subtitle: 'Avg response: 2 min',
    highlight: true,
  },
  {
    icon: 'mail',
    title: 'Email Support',
    subtitle: SUPPORT_EMAIL,
    url: 'mailto:' + SUPPORT_EMAIL,
  },
  { icon: 'phone', title: 'Call Back', subtitle: '9 AM - 9 PM IST' },
];

const FAQS = [
  'How do I deposit INR?',
  'What is the minimum trade amount?',
  'How long does withdrawal take?',
  'Why is my KYC pending?',
  'How is TDS calculated?',
] as const;

/** Support channels and the most common questions. */
export function HelpSupportScreen({
  navigation,
}: AppStackScreenProps<'HelpSupport'>) {
  const theme = useTheme();

  const onPressChannel = (channel: ContactChannel) => {
    if (!channel.url) {
      return;
    }

    Linking.openURL(channel.url).catch(error =>
      logger.warn('Unable to open the support channel', error),
    );
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
          {FAQS.map((question, index) => (
            <ListRow
              key={question}
              title={question}
              showChevron
              divider={index < FAQS.length - 1}
              onPress={() => undefined}
            />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
