import { useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { APP_VERSION, SUPPORT_EMAIL } from '../../../constants/app';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { logger } from '../../../utils/logger';
import { styles } from './styles';

const CATEGORIES = [
  'Bug Report',
  'Feature Request',
  'UI/UX',
  'Performance',
  'Other',
] as const;

const RATINGS = [1, 2, 3, 4, 5] as const;

/** Star rating, category and free-text feedback. */
export function AppFeedbackScreen({
  navigation,
}: AppStackScreenProps<'AppFeedback'>) {
  const theme = useTheme();
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<string>();
  const [message, setMessage] = useState('');

  const canSubmit = rating > 0 && message.trim().length > 0;

  /** No feedback API yet: hand the message to the mail app, prefilled. */
  const onSubmit = () => {
    const subject =
      'App feedback · ' + (category ?? 'General') + ' · ' + rating + '/5';
    const body = message.trim() + '\n\n— CryptoEx v' + APP_VERSION;
    Linking.openURL(
      'mailto:' +
        SUPPORT_EMAIL +
        '?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(body),
    )
      .then(() => {
        showToast('Thanks for your feedback!', 'success');
        navigation.goBack();
      })
      .catch(error => {
        logger.warn('Unable to open the mail app', error);
        showToast(
          'No mail app found',
          'danger',
          'Write to us at ' + SUPPORT_EMAIL,
        );
      });
  };

  return (
    <Screen>
      <ScreenHeader title="App Feedback" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="subtitle" style={styles.title}>
          How are we doing?
        </Text>
        <Text tone="muted" style={styles.subtitle}>
          Rate your experience
        </Text>

        <View style={styles.stars}>
          {RATINGS.map(value => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={'Rate ' + value + ' out of 5'}
              accessibilityState={{ selected: value <= rating }}
              hitSlop={6}
              onPress={() => setRating(value)}
            >
              <Icon
                name="star"
                size={30}
                color={
                  value <= rating
                    ? theme.colors.primary
                    : theme.colors.surfaceStrong
                }
              />
            </Pressable>
          ))}
        </View>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          CATEGORY
        </Text>
        <View style={styles.chips}>
          {CATEGORIES.map(item => (
            <Chip
              key={item}
              label={item}
              selected={category === item}
              onPress={() => setCategory(item)}
            />
          ))}
        </View>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          YOUR FEEDBACK
        </Text>
        <Input
          accessibilityLabel="Your feedback"
          placeholder="Tell us what you think..."
          multiline
          value={message}
          onChangeText={setMessage}
          style={styles.textArea}
        />

        <Button
          label="Submit Feedback"
          icon="send"
          disabled={!canSubmit}
          style={styles.submit}
          onPress={onSubmit}
        />
      </ScrollView>
    </Screen>
  );
}
