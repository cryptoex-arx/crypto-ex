import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Input } from '../../../components/ui/Input';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useStore } from '../../../hooks/useStore';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  NOMINEE_RELATIONS,
  removeNominee,
  saveNominee,
  userStore,
} from '../../../services/user';
import { styles } from './styles';

/** Types `15081995` as `15/08/1995`. */
function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)]
    .filter(Boolean)
    .join('/');
}

/** Who receives the account's assets; one nominee per account. */
export function NomineeScreen({ navigation }: AppStackScreenProps<'Nominee'>) {
  const { nominee } = useStore(userStore);
  const [name, setName] = useState(nominee?.name ?? '');
  const [relation, setRelation] = useState(nominee?.relation ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(nominee?.dateOfBirth ?? '');
  const [error, setError] = useState<string>();

  const onSave = () => {
    const result = saveNominee({ name, relation, dateOfBirth });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast('Nominee saved', 'success');
    navigation.goBack();
  };

  const onRemove = () =>
    Alert.alert('Remove nominee?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeNominee();
          showToast('Nominee removed');
          navigation.goBack();
        },
      },
    ]);

  return (
    <Screen>
      <ScreenHeader title="Nominee Details" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <InfoBanner
          icon="users"
          message="Your nominee can claim the assets in this account. You can change them any time."
        />
        <Input label="Full name" value={name} onChangeText={setName} />
        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          RELATIONSHIP
        </Text>
        <View style={styles.wrap}>
          {NOMINEE_RELATIONS.map(option => (
            <Chip
              key={option}
              label={option}
              selected={option === relation}
              onPress={() => setRelation(option)}
            />
          ))}
        </View>
        <Input
          label="Date of birth"
          placeholder="DD/MM/YYYY"
          keyboardType="number-pad"
          value={dateOfBirth}
          onChangeText={text => setDateOfBirth(formatDateInput(text))}
        />
        {error ? (
          <Text variant="caption" tone="danger">
            {error}
          </Text>
        ) : null}
        <Button label="Save nominee" onPress={onSave} />
        {nominee ? (
          <Button
            label="Remove nominee"
            variant="secondary"
            onPress={onRemove}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
