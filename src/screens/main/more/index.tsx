import { Pressable, ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Icon } from '../../../components/ui/Icon';
import type { IconName } from '../../../components/ui/icons';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useTheme } from '../../../hooks/useTheme';
import type {
  AppStackScreenProps,
  MainTabParamList,
  ParamlessRoute,
} from '../../../navigation/types';
import { useOpenRoute } from '../../../navigation/useOpenRoute';
import { styles } from './styles';

type Target =
  | { route: ParamlessRoute }
  | { tab: keyof MainTabParamList }
  | { select: 'deposit' | 'withdraw' };

interface Shortcut {
  label: string;
  icon: IconName;
  target: Target;
}

const SECTIONS: readonly { title: string; items: readonly Shortcut[] }[] = [
  {
    title: 'TRADE & INVEST',
    items: [
      { label: 'Markets', icon: 'bar-chart', target: { tab: 'Markets' } },
      { label: 'Futures', icon: 'trending-up', target: { tab: 'Futures' } },
      { label: 'SIP', icon: 'calendar', target: { route: 'Sip' } },
      { label: 'Baskets', icon: 'layers', target: { route: 'Baskets' } },
      { label: 'Earn', icon: 'zap', target: { route: 'Earn' } },
      { label: 'Alerts', icon: 'bell', target: { route: 'PriceAlerts' } },
    ],
  },
  {
    title: 'FUNDS',
    items: [
      { label: 'Add INR', icon: 'plus', target: { route: 'AddInr' } },
      { label: 'Deposit', icon: 'arrow-down', target: { select: 'deposit' } },
      { label: 'Withdraw', icon: 'arrow-up', target: { select: 'withdraw' } },
      { label: 'Transfer', icon: 'transfer', target: { route: 'Transfer' } },
      { label: 'History', icon: 'history', target: { route: 'Transactions' } },
      { label: 'Orders', icon: 'list', target: { route: 'CoinOrders' } },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'KYC', icon: 'shield-check', target: { route: 'Kyc' } },
      { label: 'Security', icon: 'lock', target: { route: 'Security' } },
      { label: 'Refer', icon: 'gift', target: { route: 'ReferAndEarn' } },
      { label: 'Coupon', icon: 'tag', target: { route: 'CouponCode' } },
      { label: 'Tax', icon: 'file-text', target: { route: 'TaxReports' } },
      { label: 'Fees', icon: 'percent', target: { route: 'FeeStructure' } },
      {
        label: 'Support',
        icon: 'help-circle',
        target: { route: 'HelpSupport' },
      },
      {
        label: 'Reserves',
        icon: 'eye',
        target: { route: 'TransparencyCenter' },
      },
    ],
  },
];

/** Every feature in one grid, like the exchange apps' "More" page. */
export function MoreScreen({ navigation }: AppStackScreenProps<'More'>) {
  const theme = useTheme();
  const openRoute = useOpenRoute();

  const open = (target: Target) => {
    if ('route' in target) {
      openRoute(target.route);
    } else if ('tab' in target) {
      navigation.navigate('MainTabs', { screen: target.tab });
    } else {
      navigation.navigate('SelectAsset', { mode: target.select });
    }
  };

  return (
    <Screen>
      <ScreenHeader title="All Features" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        {SECTIONS.map(section => (
          <View key={section.title}>
            <Text variant="overline" tone="muted" style={styles.sectionLabel}>
              {section.title}
            </Text>
            <View style={styles.grid}>
              {section.items.map(item => (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  onPress={() => open(item.target)}
                  style={({ pressed }) => [
                    styles.cell,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.tile,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Icon name={item.icon} size={20} />
                  </View>
                  <Text variant="caption" style={styles.centerText}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
