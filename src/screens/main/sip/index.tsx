import { Alert, ScrollView, View } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { DetailRows } from '../../../components/common/DetailRows';
import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { findCoin } from '../../../constants/markets';
import { useAccount } from '../../../hooks/useAccount';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  deleteSip,
  pauseSip,
  resumeSip,
  SIP_FREQUENCIES,
} from '../../../services/account';
import { formatDate, formatInr } from '../../../utils/format';
import { styles } from './styles';

/** Recurring buy plans: progress, next date, pause, resume and stop. */
export function SipScreen({ navigation }: AppStackScreenProps<'Sip'>) {
  const { sipPlans } = useAccount();

  const onStop = (id: string, symbol: string) =>
    Alert.alert(
      'Stop ' + symbol + ' SIP?',
      'Coins already bought stay in your portfolio.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Stop SIP',
          style: 'destructive',
          onPress: () => {
            deleteSip(id);
            showToast('SIP stopped');
          },
        },
      ],
    );

  return (
    <Screen>
      <ScreenHeader title="Crypto SIP" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <InfoBanner
          icon="trending-up"
          message="Invest a fixed amount on a schedule to average out price swings. The first instalment is bought right away."
        />

        {sipPlans.length === 0 ? (
          <EmptyState
            title="No SIPs yet"
            message="Start with as little as ₹500 a month."
          />
        ) : (
          sipPlans.map(plan => {
            const coin = findCoin(plan.coinId);
            const active = plan.status === 'active';
            return (
              <Card key={plan.id} padded>
                <View style={styles.row}>
                  <CoinAvatar symbol={coin?.symbol ?? ''} color={coin?.color} />
                  <Text variant="subtitle" style={[styles.bold, styles.grow]}>
                    {coin?.name}
                  </Text>
                  <Badge
                    label={active ? 'Active' : 'Paused'}
                    tone={active ? 'success' : 'neutral'}
                  />
                </View>
                <DetailRows
                  rows={[
                    {
                      label: 'Instalment',
                      value:
                        formatInr(plan.amount) +
                        ' · ' +
                        SIP_FREQUENCIES.find(
                          item => item.value === plan.frequency,
                        )?.label,
                    },
                    {
                      label: 'Instalments bought',
                      value: String(plan.instalments),
                    },
                    {
                      label: 'Invested',
                      value: formatInr(plan.invested, 'full'),
                    },
                    {
                      label: 'Next instalment',
                      value: active ? formatDate(plan.nextRunAt) : 'Paused',
                    },
                  ]}
                />
                <View style={[styles.row, styles.actions]}>
                  <Button
                    label={active ? 'Pause' : 'Resume'}
                    icon={active ? 'pause' : 'play'}
                    variant="secondary"
                    style={styles.grow}
                    onPress={() =>
                      active ? pauseSip(plan.id) : resumeSip(plan.id)
                    }
                  />
                  <Button
                    label="Stop"
                    variant="secondary"
                    style={styles.grow}
                    onPress={() => onStop(plan.id, coin?.symbol ?? '')}
                  />
                </View>
              </Card>
            );
          })
        )}

        <Button
          label="Start a SIP"
          icon="plus"
          onPress={() => navigation.navigate('CreateSip')}
        />
      </ScrollView>
    </Screen>
  );
}
