import { ScrollView } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import type { IconName } from '../../../components/ui/icons';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { useAccount } from '../../../hooks/useAccount';
import { useStore } from '../../../hooks/useStore';
import type {
  AppStackScreenProps,
  ParamlessRoute,
} from '../../../navigation/types';
import { useOpenRoute } from '../../../navigation/useOpenRoute';
import { maskAccountNumber } from '../../../services/account';
import { userStore } from '../../../services/user';
import { styles } from './styles';

/** Hub for the personal, banking and nominee details of the account. */
export function AccountSettingsScreen({
  navigation,
}: AppStackScreenProps<'AccountSettings'>) {
  const openRoute = useOpenRoute();
  const { bankAccounts } = useAccount();
  const { nominee } = useStore(userStore);
  const primary = bankAccounts.find(bank => bank.primary);

  const entries: readonly {
    icon: IconName;
    title: string;
    subtitle: string;
    route: ParamlessRoute;
  }[] = [
    {
      icon: 'user',
      title: 'Profile',
      subtitle: 'Name, email, date of birth',
      route: 'Profile',
    },
    {
      icon: 'credit-card',
      title: 'Bank Accounts',
      subtitle: primary
        ? primary.bankName + ' ' + maskAccountNumber(primary.accountNumber)
        : 'Link a bank account',
      route: 'BankAccounts',
    },
    {
      icon: 'users',
      title: 'Nominee Details',
      subtitle: nominee
        ? nominee.name + ' · ' + nominee.relation
        : 'Add or update nominee',
      route: 'Nominee',
    },
    {
      icon: 'sliders',
      title: 'Account Management',
      subtitle: 'Statement, reset, close account',
      route: 'AccountManagement',
    },
  ];

  return (
    <Screen>
      <ScreenHeader title="Account Settings" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          {entries.map((entry, index) => (
            <ListRow
              key={entry.title}
              icon={entry.icon}
              title={entry.title}
              subtitle={entry.subtitle}
              showChevron
              divider={index < entries.length - 1}
              onPress={() => openRoute(entry.route)}
            />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
