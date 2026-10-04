import { Clipboard, ScrollView, View } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { DetailRows } from '../../../components/common/DetailRows';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { showToast } from '../../../components/common/Toast';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { findCoin } from '../../../constants/markets';
import { useAccount } from '../../../hooks/useAccount';
import type { AppStackScreenProps } from '../../../navigation/types';
import { formatNumber } from '../../../utils/format';
import { sha1, toHex, utf8 } from '../../../utils/hash';
import { styles } from './styles';

/**
 * Latest published reserve snapshot. Replace with the proof-of-reserves API;
 * the figures here are illustrative.
 */
const RESERVES = [
  { coinId: 'btc', customer: 1_842.6, reserves: 1_931.4 },
  { coinId: 'eth', customer: 21_406, reserves: 22_118 },
  { coinId: 'usdt', customer: 48_210_550, reserves: 50_004_100 },
  { coinId: 'sol', customer: 96_420, reserves: 99_870 },
] as const;

const SNAPSHOT = {
  date: '01 Sep 2026',
  auditor: 'Independent auditor (sample)',
};

/** Proof of reserves and a way to check the account is in the snapshot. */
export function TransparencyCenterScreen({
  navigation,
}: AppStackScreenProps<'TransparencyCenter'>) {
  const account = useAccount();
  // The leaf this account would have in the reserves Merkle tree.
  const leaf = toHex(
    sha1(
      utf8(
        'cryptoex-por:' +
          JSON.stringify(
            Object.entries(account.holdings).map(([coinId, holding]) => [
              coinId,
              holding.quantity.toFixed(8),
            ]),
          ),
      ),
    ),
  );

  return (
    <Screen>
      <ScreenHeader title="Transparency Center" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <InfoBanner
          icon="shield-check"
          message="Customer assets are held 1:1 or better. Every month we publish reserves against customer balances."
        />
        <Card padded>
          <DetailRows
            rows={[
              { label: 'Snapshot', value: SNAPSHOT.date },
              { label: 'Audited by', value: SNAPSHOT.auditor },
            ]}
          />
        </Card>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          RESERVE RATIO
        </Text>
        <Card>
          {RESERVES.map((row, index) => {
            const coin = findCoin(row.coinId);
            const ratio = (row.reserves / row.customer) * 100;
            return (
              <ListRow
                key={row.coinId}
                leading={
                  <CoinAvatar symbol={coin?.symbol ?? ''} color={coin?.color} />
                }
                title={coin?.symbol ?? row.coinId}
                subtitle={
                  'Reserves ' +
                  formatNumber(row.reserves, 2) +
                  ' · Customers ' +
                  formatNumber(row.customer, 2)
                }
                divider={index < RESERVES.length - 1}
                trailing={
                  <Badge
                    label={formatNumber(ratio, 1) + '%'}
                    tone={ratio >= 100 ? 'success' : 'danger'}
                  />
                }
              />
            );
          })}
        </Card>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          VERIFY YOUR BALANCE
        </Text>
        <Card padded>
          <Text variant="caption" tone="muted">
            Your balances are hashed into a leaf of the reserves Merkle tree.
            Compare this hash with the published tree to confirm you are
            included.
          </Text>
          <View style={styles.leaf}>
            <Text variant="label" selectable>
              {leaf}
            </Text>
          </View>
          <Button
            label="Copy leaf hash"
            icon="copy"
            variant="secondary"
            onPress={() => {
              // Deprecated in core but still shipped; swap for a clipboard package if it goes.
              Clipboard.setString(leaf);
              showToast('Leaf hash copied', 'success');
            }}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}
