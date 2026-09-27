import { ScrollView } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import type { IconName } from '../../../components/ui/icons';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { styles } from './styles';

const CONTROLS: readonly { icon: IconName; title: string; subtitle: string }[] =
  [
    {
      icon: 'key',
      title: 'Change Password',
      subtitle: 'Last changed 3 months ago',
    },
    { icon: 'hash', title: 'Reset Login PIN', subtitle: '6-digit secure PIN' },
    {
      icon: 'fingerprint',
      title: 'Biometric Login',
      subtitle: 'Face ID / Fingerprint',
    },
    {
      icon: 'smartphone',
      title: 'Google Authenticator',
      subtitle: '2FA enabled',
    },
    {
      icon: 'shield-check',
      title: 'Crypto Withdrawal Password',
      subtitle: 'Required for withdrawals',
    },
    {
      icon: 'monitor',
      title: 'Verified Devices',
      subtitle: '2 trusted devices',
    },
    { icon: 'copy', title: 'Backup Codes', subtitle: '8 codes · 6 remaining' },
    { icon: 'activity', title: 'Account Activity', subtitle: 'Recent logins' },
  ];

/** Every security control for the account, with the overall score on top. */
export function SecurityScreen({
  navigation,
}: AppStackScreenProps<'Security'>) {
  const theme = useTheme();

  return (
    <Screen>
      <ScreenHeader title="Security" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <InfoBanner
          icon="shield-check"
          message="Your account security score is Strong."
          color={theme.colors.success}
        />

        <Card>
          {CONTROLS.map((control, index) => (
            <ListRow
              key={control.title}
              icon={control.icon}
              title={control.title}
              subtitle={control.subtitle}
              showChevron
              divider={index < CONTROLS.length - 1}
              onPress={() => undefined}
            />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
