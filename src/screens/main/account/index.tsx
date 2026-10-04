import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';

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
import { formatMobileNumber } from '../../../constants/auth';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import type {
  MainTabScreenProps,
  ParamlessRoute,
} from '../../../navigation/types';
import { useOpenRoute } from '../../../navigation/useOpenRoute';
import {
  logActivity,
  securityLevel,
  securityStore,
} from '../../../services/security';
import { settingsStore } from '../../../services/settings';
import { type KycStatus, userStore } from '../../../services/user';
import { useAppState } from '../../../store/useAppState';
import { logger } from '../../../utils/logger';
import { styles } from './styles';

interface AccountLink {
  icon: IconName;
  title: string;
  subtitle: string;
  badge?: string;
  route?: ParamlessRoute;
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
        subtitle: 'PAN, Aadhaar, bank',
        route: 'Kyc',
      },
      {
        icon: 'shopping-cart',
        title: 'Coin Orders',
        subtitle: 'Pending & history',
        route: 'CoinOrders',
      },
      {
        icon: 'history',
        title: 'Transaction History',
        subtitle: 'Deposits, withdrawals, transfers',
        route: 'Transactions',
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
        subtitle: '2FA, PIN, whitelist',
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
        route: 'TransparencyCenter',
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

const KYC_BANNERS: Record<
  KycStatus,
  { label: string; tone: 'success' | 'danger' | 'muted' }
> = {
  verified: { label: 'KYC Verified', tone: 'success' },
  inReview: { label: 'KYC under review', tone: 'muted' },
  notStarted: { label: 'Complete KYC to deposit & withdraw', tone: 'danger' },
};

/** Account tab: the entry point to every settings and support screen. */
export function AccountScreen(_props: MainTabScreenProps<'Account'>) {
  const theme = useTheme();
  const { dispatch } = useAppState();
  const navigate = useOpenRoute();
  const { profile, kyc } = useStore(userStore);
  const security = useStore(securityStore);
  const { baseCurrency } = useStore(settingsStore);
  const kycBanner = KYC_BANNERS[kyc.status];

  /** Fills in the rows whose subtitle or badge depends on live state. */
  const decorate = (link: AccountLink): AccountLink => {
    switch (link.route) {
      case 'Kyc':
        return {
          ...link,
          badge: kyc.status === 'verified' ? 'Verified' : undefined,
        };
      case 'Security':
        return {
          ...link,
          subtitle: securityLevel(security) + ' · 2FA, PIN, whitelist',
        };
      case 'BaseCurrency':
        return { ...link, subtitle: baseCurrency };
      default:
        return link;
    }
  };

  const onLogOut = () =>
    Alert.alert(
      'Log out?',
      'You will need your mobile number and OTP to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            logActivity('Signed out', 'This device');
            dispatch({ type: 'session/signOut' });
          },
        },
      ],
    );

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
              {profile.fullName}
            </Text>
            <Text variant="caption" tone="muted" style={styles.profileContact}>
              {profile.email} · {formatMobileNumber(profile.mobileNumber)}
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
              backgroundColor:
                kycBanner.tone === 'success'
                  ? theme.colors.successSurface
                  : kycBanner.tone === 'danger'
                  ? theme.colors.dangerSurface
                  : theme.colors.surface,
              borderColor:
                kycBanner.tone === 'success'
                  ? theme.colors.successSurface
                  : kycBanner.tone === 'danger'
                  ? theme.colors.dangerSurface
                  : theme.colors.border,
            },
          ]}
        >
          <Icon
            name={kyc.status === 'verified' ? 'shield-check' : 'shield'}
            size={16}
            color={
              kycBanner.tone === 'success'
                ? theme.colors.success
                : kycBanner.tone === 'danger'
                ? theme.colors.danger
                : theme.colors.textMuted
            }
          />
          <Text variant="body" tone={kycBanner.tone} style={styles.kycLabel}>
            {kycBanner.label}
          </Text>
          <Icon name="chevron-right" size={16} color={theme.colors.textMuted} />
        </Pressable>

        {SECTIONS.map(section => (
          <View key={section.label} style={styles.section}>
            <Text variant="overline" tone="muted" style={styles.sectionLabel}>
              {section.label}
            </Text>
            <Card>
              {section.links.map(decorate).map((link, index) => (
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
          onPress={onLogOut}
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
