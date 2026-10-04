import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Input } from '../../../components/ui/Input';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { formatMobileNumber } from '../../../constants/auth';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { type Gender, updateProfile, userStore } from '../../../services/user';
import { styles } from './styles';

const GENDERS = ['Male', 'Female', 'Other'] as const;

/** Editable personal details; identity fields stay read-only after KYC. */
export function ProfileScreen({ navigation }: AppStackScreenProps<'Profile'>) {
  const theme = useTheme();
  const { profile } = useStore(userStore);
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [error, setError] = useState<string>();
  const initials = profile.fullName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const onSave = () => {
    const result = updateProfile({ fullName, email, gender });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast('Profile saved', 'success');
    navigation.goBack();
  };

  const readOnlyStyle = [
    styles.readOnlyInput,
    {
      backgroundColor: theme.colors.surfaceStrong,
      color: theme.colors.textMuted,
    },
  ];

  return (
    <Screen>
      <ScreenHeader title="Profile" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarBlock}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.surfaceStrong },
            ]}
          >
            <Text variant="title" tone="primary">
              {initials}
            </Text>
          </View>
        </View>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          PERSONAL INFORMATION
        </Text>

        <Text variant="overline" tone="muted" style={styles.fieldLabel}>
          FULL NAME
        </Text>
        <View style={styles.field}>
          <Input
            accessibilityLabel="Full name"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <Text variant="overline" tone="muted" style={styles.fieldLabel}>
          EMAIL ADDRESS
        </Text>
        <View style={styles.field}>
          <Input
            accessibilityLabel="Email address"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text variant="overline" tone="muted" style={styles.fieldLabel}>
          DATE OF BIRTH
        </Text>
        <View style={styles.field}>
          <Input
            accessibilityLabel="Date of birth"
            editable={false}
            value={profile.dateOfBirth}
            style={readOnlyStyle}
          />
        </View>

        <Text variant="overline" tone="muted" style={styles.fieldLabel}>
          GENDER
        </Text>
        <View style={styles.genderRow}>
          {GENDERS.map(option => {
            const selected = option === gender;

            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setGender(option)}
                style={[
                  styles.genderOption,
                  {
                    backgroundColor: selected
                      ? theme.colors.surface
                      : theme.colors.background,
                    borderColor: selected
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
              >
                <Text
                  variant="body"
                  tone={selected ? 'default' : 'muted'}
                  style={styles.genderLabel}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          CONTACT
        </Text>

        <Text variant="overline" tone="muted" style={styles.fieldLabel}>
          MOBILE NUMBER
        </Text>
        <View style={styles.field}>
          <Input
            accessibilityLabel="Mobile number"
            editable={false}
            value={formatMobileNumber(profile.mobileNumber)}
            style={readOnlyStyle}
          />
        </View>

        <View style={styles.banner}>
          <InfoBanner message="Mobile number cannot be changed. Contact support to update." />
        </View>

        {error ? (
          <Text variant="caption" tone="danger" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Button label="Save Changes" style={styles.save} onPress={onSave} />
      </ScrollView>
    </Screen>
  );
}
