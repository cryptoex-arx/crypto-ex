import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Input } from '../../../components/ui/Input';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { styles } from './styles';

const GENDERS = ['Male', 'Female', 'Other'] as const;

const DATE_OF_BIRTH = '15 Aug 1995';
const MOBILE_NUMBER = '+91 98765 43210';

/** Editable personal details; identity fields stay read-only after KYC. */
export function ProfileScreen({ navigation }: AppStackScreenProps<'Profile'>) {
  const theme = useTheme();
  const [fullName, setFullName] = useState('Rahul Sharma');
  const [email, setEmail] = useState('rahul@email.com');
  const [gender, setGender] = useState<string>('Male');

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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
          >
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.colors.surfaceStrong },
              ]}
            >
              <Icon name="user" size={32} />
            </View>
            <View
              style={[
                styles.cameraBadge,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.background,
                },
              ]}
            >
              <Icon name="camera" size={12} color={theme.colors.textInverted} />
            </View>
          </Pressable>
          <Text variant="caption" tone="muted" style={styles.avatarHint}>
            Tap to change photo
          </Text>
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
            value={DATE_OF_BIRTH}
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
            value={MOBILE_NUMBER}
            style={readOnlyStyle}
          />
        </View>

        <View style={styles.banner}>
          <InfoBanner message="Mobile number cannot be changed. Contact support to update." />
        </View>

        <Button
          label="Save Changes"
          style={styles.save}
          onPress={navigation.goBack}
        />
      </ScrollView>
    </Screen>
  );
}
