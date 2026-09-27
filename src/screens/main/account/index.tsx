import { Linking, Pressable, ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import type { IconName } from '../../../components/ui/icons';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen, TAB_SCREEN_EDGES } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import {
  APP_BUILD,
  APP_VERSION,
  TELEGRAM_HANDLE,
  TELEGRAM_URL,
} from '../../../constants/app';
import { useTheme } from '../../../hooks/useTheme';
import type {
  AppStackParamList,
  MainTabScreenProps,
} from '../../../navigation/types';
import { useAppState } from '../../../store/useAppState';
import { logger } from '../../../utils/logger';
import { styles } from './styles';

/** Tabs are reached through the tab bar, never pushed from this list. */
type DetailRoute = Exclude<keyof AppStackParamList, 'MainTabs'>;

interface AccountLink {
  icon: IconName;
  title: string;
  subtitle: string;
  badge?: string;
  route?: DetailRoute;
}

interface AccountSection {
  label: string;
  links: readonly AccountLink[];
}

const SECTIONS: readonly AccountSection[] = [
  {
    label: 'ACCOUNTS',
    links: [
      {
        icon: 'settings',
        title: 'Account Settings',
        subtitle: 'Profile, bank, nominee',
        route: 'AccountSettings',
      },
      {
        icon: 'shield-check',
        title: 'KYC & Verification',
        subtitle: 'Powered by Signzy · Level 2',
        badge: 'Verified',
        route: 'Kyc',
      },
      {
        icon: 'shopping-cart',
        title: 'Coin Orders',
        subtitle: 'Pending & history',
        route: 'CoinOrders',
      },
      {
        icon: 'palette',
        title: 'Appearance',
        subtitle: 'Theme & display',
        route: 'Appearance',
      },
      {
        icon: 'lock',
        title: 'Security',
        subtitle: '2FA, PIN, biometrics',
        route: 'Security',
      },
      {
        icon: 'dollar-sign',
        title: 'Base Currency',
        subtitle: 'INR',
        route: 'BaseCurrency',
      },
      {
        icon: 'bell',
        title: 'Price Alerts',
        subtitle: 'Coins & futures',
        route: 'PriceAlerts',
      },
      {
        icon: 'file-text',
        title: 'Tax Reports',
        subtitle: 'Trade report, TDS',
        route: 'TaxReports',
      },
    ],
  },
  {
    label: 'GET HELP',
    links: [
      {
        icon: 'message-circle',
        title: 'Help & Support',
        subtitle: 'Chat, email, FAQ',
        route: 'HelpSupport',
      },
      {
        icon: 'bar-chart',
        title: 'Fee Structure',
        subtitle: 'Trading & withdrawal',
        route: 'FeeStructure',
      },
      {
        icon: 'star',
        title: 'App Feedback',
        subtitle: 'Rate & review',
        route: 'AppFeedback',
      },
    ],
  },
  {
    label: 'REWARDS',
    links: [
      {
        icon: 'gift',
        title: 'Refer & Earn',
        subtitle: 'Invite friends, earn rewards',
        route: 'ReferAndEarn',
      },
      {
        icon: 'tag',
        title: 'Coupon Code',
        subtitle: 'Apply a promo code',
        route: 'CouponCode',
      },
    ],
  },
  {
    label: 'ABOUT US',
    links: [
      {
        icon: 'eye',
        title: 'Transparency Center',
        subtitle: 'Proof of reserves, audits',
      },
      {
        icon: 'info',
        title: 'About CryptoEx',
        subtitle: 'Privacy, terms & policies',
        route: 'About',
      },
      {
        icon: 'send',
        title: 'Join Telegram',
        subtitle: TELEGRAM_HANDLE,
      },
    ],
  },
];

/** Account tab: the entry point to every settings and support screen. */
export function AccountScreen({ navigation }: MainTabScreenProps<'Account'>) {
  const theme = useTheme();
  const { dispatch } = useAppState();
  // Every detail route takes no params, so one narrowed signature covers them all.
  const navigate = navigation.navigate as (route: DetailRoute) => void;

  const openTelegram = () => {
    Linking.openURL(TELEGRAM_URL).catch(error =>
      logger.warn('Unable to open Telegram', error),
    );
  };

  const onPressLink = (link: AccountLink) => {
    if (link.title === 'Join Telegram') {
      openTelegram();
      return;
    }

    if (link.route) {
      navigate(link.route);
    }
  };

  return (
    <Screen edges={TAB_SCREEN_EDGES}>
      <ScreenHeader title="Account" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profileCard}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.surfaceStrong },
            ]}
          >
            <Icon name="user" size={22} />
          </View>
          <View style={styles.profileBody}>
            <Text variant="subtitle" style={styles.profileName}>
              Rahul Sharma
            </Text>
            <Text variant="caption" tone="muted" style={styles.profileContact}>
              rahul@email.com · +91 98765 43210
            </Text>
          </View>
          <Button
            label="Edit"
            variant="secondary"
            style={styles.editButton}
            onPress={() => navigate('Profile')}
          />
        </Card>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigate('Kyc')}
          style={[
            styles.kycBanner,
            {
              backgroundColor: theme.colors.successSurface,
              borderColor: theme.colors.successSurface,
            },
          ]}
        >
          <Icon name="shield-check" size={16} color={theme.colors.success} />
          <Text variant="body" tone="success" style={styles.kycLabel}>
            KYC Verified · Level 2
          </Text>
          <Text variant="caption" tone="muted">
            Powered by Signzy
          </Text>
        </Pressable>

        {SECTIONS.map(section => (
          <View key={section.label} style={styles.section}>
            <Text variant="overline" tone="muted" style={styles.sectionLabel}>
              {section.label}
            </Text>
            <Card>
              {section.links.map((link, index) => (
                <ListRow
                  key={link.title}
                  icon={link.icon}
                  title={link.title}
                  subtitle={link.subtitle}
                  showChevron
                  divider={index < section.links.length - 1}
                  onPress={() => onPressLink(link)}
                  trailing={
                    link.badge ? (
                      <Badge label={link.badge} tone="success" />
                    ) : undefined
                  }
                />
              ))}
            </Card>
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          onPress={() => dispatch({ type: 'session/signOut' })}
          style={({ pressed }) => [
            styles.logout,
            {
              backgroundColor: theme.colors.dangerSurface,
              borderColor: theme.colors.dangerSurface,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Icon name="log-out" size={16} color={theme.colors.danger} />
          <Text variant="body" tone="danger" style={styles.logoutLabel}>
            Log Out
          </Text>
        </Pressable>

        <Text variant="caption" tone="muted" style={styles.version}>
          CryptoEx v{APP_VERSION} · Build {APP_BUILD}
        </Text>
      </ScrollView>
    </Screen>
  );
}
