import { Alert, ScrollView, Share } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Card } from '../../../components/ui/Card';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { resetAllStores, resetDemoData } from '../../../services/bootstrap';
import { useAppState } from '../../../store/useAppState';
import { formatDateTime, formatInr, formatNumber } from '../../../utils/format';
import { logger } from '../../../utils/logger';
import { styles } from './styles';

/** Statement download, demo reset and account closure. */
export function AccountManagementScreen({
  navigation,
}: AppStackScreenProps<'AccountManagement'>) {
  const theme = useTheme();
  const portfolio = usePortfolio();
  const { dispatch } = useAppState();

  const onStatement = () => {
    const lines = [
      'CryptoEx account statement · ' + formatDateTime(Date.now()),
      '',
      'INR: ' + formatInr(portfolio.inrBalance, 'full'),
      ...portfolio.assets.map(
        asset =>
          asset.coin.symbol +
          ': ' +
          formatNumber(asset.quantity, 8) +
          ' (' +
          formatInr(asset.value, 'full') +
          ')',
      ),
      'Futures wallet: ' + formatInr(portfolio.futuresValue, 'full'),
      '',
      'Total: ' + formatInr(portfolio.total, 'full'),
    ];
    Share.share({ message: lines.join('\n') }).catch(error =>
      logger.warn('Unable to open the share sheet', error),
    );
  };

  const onReset = () =>
    Alert.alert(
      'Reset demo data?',
      'Balances, orders, positions, alerts and notifications go back to the starting demo account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetDemoData();
            showToast('Demo data reset', 'success');
          },
        },
      ],
    );

  const onClose = () =>
    Alert.alert(
      'Close your account?',
      'Everything saved on this device is erased and you are signed out. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close account',
          style: 'destructive',
          onPress: () => {
            resetAllStores();
            dispatch({ type: 'session/signOut' });
          },
        },
      ],
    );

  return (
    <Screen>
      <ScreenHeader title="Account Management" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <ListRow
            icon="download"
            title="Download statement"
            subtitle="Balances and holdings, as text"
            showChevron
            divider
            onPress={onStatement}
          />
          <ListRow
            icon="refresh"
            title="Reset demo data"
            subtitle="Start again from the demo balances"
            showChevron
            onPress={onReset}
          />
        </Card>
        <Card>
          <ListRow
            icon="trash"
            iconColor={theme.colors.danger}
            iconBackground={theme.colors.dangerSurface}
            title="Close account"
            subtitle="Erase all data and sign out"
            showChevron
            onPress={onClose}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}
