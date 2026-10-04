import { useState } from 'react';
import { Clipboard, ScrollView, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Input } from '../../../components/ui/Input';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useStore } from '../../../hooks/useStore';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  disableTwoFactor,
  enableTwoFactor,
  regenerateBackupCodes,
  securityStore,
} from '../../../services/security';
import { userStore } from '../../../services/user';
import { generateSecret, otpauthUrl } from '../../../utils/totp';
import { styles } from './styles';

const ISSUER = 'CryptoEx';

/** Google Authenticator setup, backup codes, and turning 2FA off. */
export function TwoFactorScreen({
  navigation,
}: AppStackScreenProps<'TwoFactor'>) {
  const { twoFactor } = useStore(securityStore);
  const { profile } = useStore(userStore);
  const [secret] = useState(generateSecret);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();

  const copy = (value: string, label: string) => {
    // Deprecated in core but still shipped; swap for a clipboard package if it goes.
    Clipboard.setString(value);
    showToast(label + ' copied', 'success');
  };

  const run = (action: () => { ok: boolean; error?: string }, done: string) => {
    const result = action();
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(undefined);
    setCode('');
    showToast(done, 'success');
  };

  const codeField = (
    <Input
      label={
        twoFactor.enabled ? 'Authenticator or backup code' : 'Code from the app'
      }
      placeholder="123456"
      keyboardType={twoFactor.enabled ? 'default' : 'number-pad'}
      autoCapitalize="characters"
      maxLength={8}
      value={code}
      onChangeText={text => {
        setCode(text);
        setError(undefined);
      }}
      errorMessage={error}
    />
  );

  if (!twoFactor.enabled) {
    return (
      <Screen>
        <ScreenHeader title="Google Authenticator" onBack={navigation.goBack} />
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text tone="muted">
            1. Install Google Authenticator (or any TOTP app).{'\n'}2. Scan this
            QR code, or enter the key by hand.{'\n'}3. Type the 6-digit code the
            app shows.
          </Text>
          <Card padded style={styles.center}>
            <View style={styles.qr}>
              <QRCode
                value={otpauthUrl(secret, profile.email, ISSUER)}
                size={180}
              />
            </View>
            <Text variant="caption" tone="muted" style={styles.sectionLabel}>
              Setup key
            </Text>
            <Text variant="label" selectable style={styles.secret}>
              {secret.match(/.{1,4}/g)?.join(' ')}
            </Text>
            <Button
              label="Copy key"
              icon="copy"
              variant="secondary"
              onPress={() => copy(secret, 'Key')}
            />
          </Card>
          <InfoBanner
            icon="alert-circle"
            message="Save the setup key somewhere safe. You need it to restore 2FA on a new phone."
          />
          {codeField}
          <Button
            label="Turn on"
            disabled={code.length !== 6}
            onPress={() =>
              run(
                () => enableTwoFactor(secret, code),
                'Google Authenticator is on',
              )
            }
          />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Google Authenticator" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card padded>
          <View style={styles.row}>
            <Text variant="subtitle" style={[styles.bold, styles.grow]}>
              Two-factor authentication
            </Text>
            <Badge label="On" tone="success" />
          </View>
          <Text variant="caption" tone="muted">
            Crypto withdrawals and security changes ask for a code.
          </Text>
        </Card>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          BACKUP CODES ({twoFactor.backupCodes.length} LEFT)
        </Text>
        <Card padded>
          <Text variant="caption" tone="muted">
            Each code works once, if you lose your phone.
          </Text>
          <View style={styles.codes}>
            {twoFactor.backupCodes.map(backup => (
              <Text key={backup} variant="label" selectable style={styles.code}>
                {backup}
              </Text>
            ))}
          </View>
          <Button
            label="Copy all"
            icon="copy"
            variant="secondary"
            onPress={() =>
              copy(twoFactor.backupCodes.join('\n'), 'Backup codes')
            }
          />
        </Card>

        {codeField}
        <View style={styles.row}>
          <Button
            label="New backup codes"
            variant="secondary"
            style={styles.grow}
            disabled={code.length < 6}
            onPress={() =>
              run(() => regenerateBackupCodes(code), 'New backup codes ready')
            }
          />
          <Button
            label="Turn off"
            variant="danger"
            style={styles.grow}
            disabled={code.length < 6}
            onPress={() =>
              run(() => disableTwoFactor(code), 'Google Authenticator is off')
            }
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
