import { useState } from 'react';
import { Alert, ScrollView, Switch } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import type { IconName } from '../../../components/ui/icons';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useBiometryType } from '../../../hooks/useBiometryType';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import type {
  AppStackScreenProps,
  ParamlessRoute,
} from '../../../navigation/types';
import { useOpenRoute } from '../../../navigation/useOpenRoute';
import {
  biometryLabel,
  disableBiometrics,
  enableBiometrics,
  securityLevel,
  securityStore,
} from '../../../services/security';
import { styles } from './styles';

interface Control {
  icon: IconName;
  title: string;
  subtitle: string;
  enabled?: boolean;
  route: ParamlessRoute;
}

/** Every security control for the account, with the overall score on top. */
export function SecurityScreen({
  navigation,
}: AppStackScreenProps<'Security'>) {
  const theme = useTheme();
  const openRoute = useOpenRoute();
  const security = useStore(securityStore);
  const biometry = useBiometryType();
  const [switching, setSwitching] = useState(false);
  const level = securityLevel(security);
  const { twoFactor } = security;
  const biometricLabel = biometryLabel(biometry);

  const protections: Control[] = [
    {
      icon: 'smartphone',
      title: 'Google Authenticator',
      subtitle: twoFactor.enabled
        ? twoFactor.backupCodes.length + ' backup codes left'
        : 'Required for crypto withdrawals once on',
      enabled: twoFactor.enabled,
      route: 'TwoFactor',
    },
    {
      icon: 'shield-check',
      title: 'Withdrawal Whitelist',
      subtitle:
        security.whitelist.length +
        (security.whitelist.length === 1 ? ' address' : ' addresses') +
        ' saved',
      enabled: security.whitelistEnabled,
      route: 'Whitelist',
    },
    {
      icon: 'mail',
      title: 'Anti-Phishing Code',
      subtitle: security.antiPhishingCode
        ? 'Shown in every email from us'
        : 'Spot fake CryptoEx emails',
      enabled: security.antiPhishingCode !== undefined,
      route: 'AntiPhishing',
    },
    {
      icon: 'monitor',
      title: 'Devices & Activity',
      subtitle:
        security.devices.length +
        ' devices · ' +
        security.activity.length +
        ' recent events',
      route: 'AccountActivity',
    },
  ];

  const onToggleBiometrics = async (enabled: boolean) => {
    if (!enabled) {
      disableBiometrics();
      showToast(biometricLabel + ' unlock off');
      return;
    }
    if (!security.pinHash) {
      Alert.alert(
        'Set an app PIN first',
        'Your PIN unlocks the app if ' + biometricLabel + ' fails.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Set PIN', onPress: () => navigation.navigate('SetPin') },
        ],
      );
      return;
    }
    setSwitching(true);
    const result = await enableBiometrics();
    setSwitching(false);
    if (result.ok) {
      showToast(biometricLabel + ' unlock on', 'success');
    } else {
      showToast(result.error, 'danger');
    }
  };

  const levelColor =
    level === 'Strong'
      ? theme.colors.success
      : level === 'Medium'
      ? '#F5A524'
      : theme.colors.danger;

  return (
    <Screen>
      <ScreenHeader title="Security" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <InfoBanner
          icon="shield-check"
          message={
            'Your account security is ' +
            level +
            '.' +
            (level === 'Strong'
              ? ''
              : ' Turn on Google Authenticator and an app PIN to improve it.')
          }
          color={levelColor}
        />

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          APP LOCK
        </Text>
        <Card>
          <ListRow
            icon="hash"
            title="App PIN"
            subtitle={
              security.pinHash
                ? 'Asked when the app opens'
                : 'Lock the app with a 4-digit PIN'
            }
            showChevron
            divider
            onPress={() => openRoute('SetPin')}
            trailing={
              <Badge
                label={security.pinHash ? 'On' : 'Off'}
                tone={security.pinHash ? 'success' : 'neutral'}
              />
            }
          />
          <ListRow
            icon="fingerprint"
            title={biometricLabel + ' Unlock'}
            subtitle={
              !biometry
                ? 'No Face ID or fingerprint set up on this device'
                : security.pinHash
                ? 'Unlock without typing your PIN'
                : 'Needs an app PIN as the fallback'
            }
            trailing={
              <Switch
                accessibilityLabel={biometricLabel + ' unlock'}
                value={security.biometricEnabled}
                disabled={!biometry || switching}
                onValueChange={onToggleBiometrics}
                trackColor={{
                  false: theme.colors.disabled,
                  true: theme.colors.primary,
                }}
              />
            }
          />
        </Card>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          ACCOUNT PROTECTION
        </Text>
        <Card>
          {protections.map((control, index) => (
            <ListRow
              key={control.title}
              icon={control.icon}
              title={control.title}
              subtitle={control.subtitle}
              showChevron
              divider={index < protections.length - 1}
              onPress={() => openRoute(control.route)}
              trailing={
                control.enabled === undefined ? undefined : (
                  <Badge
                    label={control.enabled ? 'On' : 'Off'}
                    tone={control.enabled ? 'success' : 'neutral'}
                  />
                )
              }
            />
          ))}
        </Card>

        <Text variant="caption" tone="muted" style={styles.footnote}>
          Your session, PIN and 2FA secrets are stored in the device's secure
          keychain, never in plain storage.
        </Text>
      </ScrollView>
    </Screen>
  );
}
