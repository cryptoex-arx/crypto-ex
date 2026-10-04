import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { COUPON_REWARDS } from '../../../constants/funds';
import { useAccount } from '../../../hooks/useAccount';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { redeemCoupon } from '../../../services/account';
import { formatInr } from '../../../utils/format';
import { styles } from './styles';

const RECENT_CODES = Object.keys(COUPON_REWARDS);

/** Promo code entry with the codes the account has seen recently. */
export function CouponCodeScreen({
  navigation,
}: AppStackScreenProps<'CouponCode'>) {
  const theme = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const { redeemedCoupons } = useAccount();

  const onApply = () => {
    const result = redeemCoupon(code);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(undefined);
    setCode('');
    showToast(
      'Coupon applied',
      'success',
      formatInr(result.value) + ' added to your INR wallet.',
    );
  };

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
              onChangeText={text => {
                setCode(text.toUpperCase());
                setError(undefined);
              }}
              errorMessage={error}
            />
          </View>
          <Button
            label="Apply"
            disabled={code.trim().length === 0}
            style={styles.applyButton}
            onPress={onApply}
          />
        </View>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          RECENT CODES
        </Text>
        <Card>
          {RECENT_CODES.map((recent, index) => {
            const used = redeemedCoupons.includes(recent);
            return (
              <ListRow
                key={recent}
                icon="tag"
                title={recent}
                subtitle={formatInr(COUPON_REWARDS[recent]) + ' INR bonus'}
                divider={index < RECENT_CODES.length - 1}
                onPress={used ? undefined : () => setCode(recent)}
                trailing={
                  <Text
                    variant="label"
                    tone={used ? 'muted' : 'primary'}
                    style={styles.useLabel}
                  >
                    {used ? 'Used' : 'Use'}
                  </Text>
                }
              />
            );
          })}
        </Card>
      </ScrollView>
    </Screen>
  );
}
