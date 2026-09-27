import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { styles } from './styles';

const RECENT_CODES = ['WELCOME50', 'DIWALI100', 'CRYPTOEX25'] as const;

/** Promo code entry with the codes the account has seen recently. */
export function CouponCodeScreen({
  navigation,
}: AppStackScreenProps<'CouponCode'>) {
  const theme = useTheme();
  const [code, setCode] = useState('');

  return (
    <Screen>
      <ScreenHeader title="Coupon Code" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: theme.colors.surfaceStrong },
            ]}
          >
            <Icon name="tag" size={28} />
          </View>
          <Text variant="subtitle" style={styles.heroTitle}>
            Apply Coupon
          </Text>
          <Text tone="muted" style={styles.heroSubtitle}>
            Enter your promo code to get rewards
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Input
              accessibilityLabel="Coupon code"
              placeholder="Enter coupon code"
              autoCapitalize="characters"
              autoCorrect={false}
              value={code}
              onChangeText={setCode}
            />
          </View>
          <Button
            label="Apply"
            disabled={code.trim().length === 0}
            style={styles.applyButton}
            onPress={() => setCode('')}
          />
        </View>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          RECENT CODES
        </Text>
        <Card>
          {RECENT_CODES.map((recent, index) => (
            <ListRow
              key={recent}
              icon="tag"
              title={recent}
              divider={index < RECENT_CODES.length - 1}
              onPress={() => setCode(recent)}
              trailing={
                <Text variant="label" tone="primary" style={styles.useLabel}>
                  Use
                </Text>
              }
            />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
