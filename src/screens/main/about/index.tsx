import { Linking, ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Icon } from '../../../components/ui/Icon';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { APP_BUILD, APP_VERSION, WEBSITE_URL } from '../../../constants/app';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { logger } from '../../../utils/logger';
import { styles } from './styles';

const POLICIES = [
  { title: 'About CryptoEx', subtitle: 'Our story and mission', path: 'about' },
  {
    title: 'Privacy Policy',
    subtitle: 'How we handle your data',
    path: 'privacy',
  },
  {
    title: 'Terms & Conditions',
    subtitle: 'Rules governing usage',
    path: 'terms',
  },
  {
    title: 'Listing / Delisting Policy',
    subtitle: 'How coins are added or removed',
    path: 'listing-policy',
  },
  {
    title: 'Refund / Cancellation Policy',
    subtitle: 'Eligible refund scenarios',
    path: 'refund-policy',
  },
] as const;

const COMPLIANCE = [
  'FIU-IND Registered',
  'ISO 27001:2022',
  'PMLA Compliant',
  'Proof of Reserves',
] as const;

/** App identity, policy documents and the compliance badges. */
export function AboutScreen({ navigation }: AppStackScreenProps<'About'>) {
  const theme = useTheme();

  return (
    <Screen>
      <ScreenHeader title="About CryptoEx" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: theme.colors.surfaceStrong },
            ]}
          >
            <Icon name="trending-up" size={26} />
          </View>
          <Text variant="subtitle" tone="primary" style={styles.heroTitle}>
            CryptoEx
          </Text>
          <Text variant="caption" tone="muted" style={styles.heroMeta}>
            Version {APP_VERSION} · Build {APP_BUILD}
          </Text>
        </View>

        <Card>
          {POLICIES.map((policy, index) => (
            <ListRow
              key={policy.title}
              title={policy.title}
              subtitle={policy.subtitle}
              divider={index < POLICIES.length - 1}
              trailing={<Icon name="external" size={18} />}
              onPress={() =>
                Linking.openURL(WEBSITE_URL + '/' + policy.path).catch(error =>
                  logger.warn('Unable to open ' + policy.path, error),
                )
              }
            />
          ))}
        </Card>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          COMPLIANCE
        </Text>
        <View style={styles.chips}>
          {COMPLIANCE.map(item => (
            <Chip key={item} label={item} icon="shield" />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
