import { ScrollView } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import type { IconName } from '../../../components/ui/icons';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import type { AppStackScreenProps } from '../../../navigation/types';
import { styles } from './styles';

const ENTRIES: readonly {
  icon: IconName;
  title: string;
  subtitle: string;
  route?: 'Profile';
}[] = [
  {
    icon: 'user',
    title: 'Profile',
    subtitle: 'Name, email, date of birth',
    route: 'Profile',
  },
  {
    icon: 'credit-card',
    title: 'Account Details',
    subtitle: 'Bank account & UPI',
  },
  {
    icon: 'users',
    title: 'Nominee Details',
    subtitle: 'Add or update nominee',
  },
  {
    icon: 'sliders',
    title: 'Account Management',
    subtitle: 'Freeze, download, close',
  },
];

/** Hub for the personal, banking and nominee details of the account. */
export function AccountSettingsScreen({
  navigation,
}: AppStackScreenProps<'AccountSettings'>) {
  return (
    <Screen>
      <ScreenHeader title="Account Settings" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          {ENTRIES.map((entry, index) => (
            <ListRow
              key={entry.title}
              icon={entry.icon}
              title={entry.title}
              subtitle={entry.subtitle}
              showChevron
              divider={index < ENTRIES.length - 1}
              onPress={
                entry.route
                  ? () => navigation.navigate(entry.route as 'Profile')
                  : undefined
              }
            />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
