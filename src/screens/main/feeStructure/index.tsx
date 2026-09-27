import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { Screen } from '../../../components/ui/Screen';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { Text } from '../../../components/ui/Text';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { styles } from './styles';

type FeeTab = 'trading' | 'withdrawal';

interface FeeRow {
  name: string;
  detail: string;
  first: string;
  second: string;
}

const TABS = [
  { value: 'trading', label: 'Trading Fees' },
  { value: 'withdrawal', label: 'Withdrawal Fees' },
] as const;

const HEADINGS: Record<FeeTab, readonly [string, string, string]> = {
  trading: ['Tier', 'Maker', 'Taker'],
  withdrawal: ['Asset', 'Network', 'Fee'],
};

const ROWS: Record<FeeTab, readonly FeeRow[]> = {
  trading: [
    {
      name: 'Regular',
      detail: '< ₹5L / month',
      first: '0.20%',
      second: '0.20%',
    },
    { name: 'Silver', detail: '₹5L – ₹25L', first: '0.16%', second: '0.18%' },
    { name: 'Gold', detail: '₹25L – ₹1Cr', first: '0.12%', second: '0.14%' },
    { name: 'Platinum', detail: '₹1Cr+', first: '0.08%', second: '0.10%' },
  ],
  withdrawal: [
    { name: 'BTC', detail: 'Bitcoin', first: 'BTC', second: '0.0004 BTC' },
    { name: 'ETH', detail: 'Ethereum', first: 'ERC20', second: '0.0021 ETH' },
    { name: 'USDT', detail: 'Tether', first: 'TRC20', second: '1.00 USDT' },
    { name: 'INR', detail: 'Bank transfer', first: 'IMPS', second: '₹9' },
  ],
};

const FOOTNOTES: Record<FeeTab, string> = {
  trading:
    'Fees are based on 30-day rolling trading volume. CryptoEx token (CX) holders get 25% discount.',
  withdrawal:
    'Network fees change with on-chain congestion and are confirmed before you submit a withdrawal.',
};

/** Maker/taker and withdrawal fee tables. */
export function FeeStructureScreen({
  navigation,
}: AppStackScreenProps<'FeeStructure'>) {
  const theme = useTheme();
  const [tab, setTab] = useState<FeeTab>('trading');
  const headings = HEADINGS[tab];
  const rows = ROWS[tab];

  return (
    <Screen>
      <ScreenHeader title="Fee Structure" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />

        <Card>
          <View
            style={[
              styles.row,
              styles.headerRow,
              {
                backgroundColor: theme.colors.surfaceStrong,
              },
            ]}
          >
            <Text variant="caption" tone="muted" style={styles.tierColumn}>
              {headings[0]}
            </Text>
            <Text variant="caption" tone="muted" style={styles.valueColumn}>
              {headings[1]}
            </Text>
            <Text variant="caption" tone="muted" style={styles.valueColumn}>
              {headings[2]}
            </Text>
          </View>

          {rows.map((row, index) => (
            <View
              key={row.name}
              style={[
                styles.row,
                index < rows.length - 1 && [
                  styles.divider,
                  { borderBottomColor: theme.colors.border },
                ],
              ]}
            >
              <View style={styles.tierColumn}>
                <Text variant="body" style={styles.tierName}>
                  {row.name}
                </Text>
                <Text variant="caption" tone="muted" style={styles.tierRange}>
                  {row.detail}
                </Text>
              </View>
              <Text variant="body" style={styles.valueColumn}>
                {row.first}
              </Text>
              <Text variant="body" style={styles.valueColumn}>
                {row.second}
              </Text>
            </View>
          ))}
        </Card>

        <InfoBanner message={FOOTNOTES[tab]} />
      </ScrollView>
    </Screen>
  );
}
