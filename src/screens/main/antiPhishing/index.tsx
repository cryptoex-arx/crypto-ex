import { useState } from 'react';
import { ScrollView } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Input } from '../../../components/ui/Input';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useStore } from '../../../hooks/useStore';
import type { AppStackScreenProps } from '../../../navigation/types';
import { securityStore, setAntiPhishingCode } from '../../../services/security';
import { styles } from './styles';

/** A secret word printed in every genuine CryptoEx email. */
export function AntiPhishingScreen({
  navigation,
}: AppStackScreenProps<'AntiPhishing'>) {
  const { antiPhishingCode } = useStore(securityStore);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();

  const onSave = () => {
    const result = setAntiPhishingCode(code);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast('Anti-phishing code saved', 'success');
    navigation.goBack();
  };

  return (
    <Screen>
      <ScreenHeader title="Anti-Phishing Code" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <InfoBanner
          icon="shield-check"
          message="Every email we send will include this code. An email without it is not from CryptoEx: do not click its links."
        />
        {antiPhishingCode ? (
          <Card padded>
            <Text variant="caption" tone="muted">
              Current code
            </Text>
            <Text variant="subtitle" style={styles.bold} selectable>
              {antiPhishingCode}
            </Text>
          </Card>
        ) : null}
        <Input
          label={antiPhishingCode ? 'New code' : 'Code'}
          placeholder="4 to 20 letters or digits"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
          value={code}
          onChangeText={text => {
            setCode(text);
            setError(undefined);
          }}
          errorMessage={error}
        />
        <Button label="Save" disabled={code.trim() === ''} onPress={onSave} />
      </ScrollView>
    </Screen>
  );
}
