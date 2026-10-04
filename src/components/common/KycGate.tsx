import { useNavigation } from '@react-navigation/native';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { useStore } from '../../hooks/useStore';
import { useTheme } from '../../hooks/useTheme';
import { userStore } from '../../services/user';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Text } from '../ui/Text';

/**
 * Renders its children once KYC is verified; otherwise explains why the
 * screen is locked and links to the KYC flow.
 */
export function KycGate({ children }: PropsWithChildren) {
  const theme = useTheme();
  const navigation = useNavigation();
  const { kyc } = useStore(userStore);

  if (kyc.status === 'verified') {
    return <>{children}</>;
  }

  const inReview = kyc.status === 'inReview';

  return (
    <View style={styles.container}>
      <Icon
        name={inReview ? 'clock' : 'shield'}
        size={32}
        color={theme.colors.primary}
      />
      <Text variant="subtitle" style={styles.title}>
        {inReview ? 'KYC under review' : 'Complete your KYC'}
      </Text>
      <Text tone="muted" style={styles.message}>
        {inReview
          ? 'We are verifying your documents. This usually takes a few seconds.'
          : 'Indian regulations require identity verification before you can deposit or withdraw.'}
      </Text>
      {inReview ? null : (
        <Button
          label="Start KYC"
          style={styles.button}
          onPress={() => navigation.navigate('App', { screen: 'KycFlow' })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    marginTop: 12,
  },
  message: {
    marginTop: 6,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    alignSelf: 'stretch',
  },
});
