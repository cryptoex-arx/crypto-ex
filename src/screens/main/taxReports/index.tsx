import { useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { Text, type TextTone } from '../../../components/ui/Text';
import { findCoin } from '../../../constants/markets';
import { useAccount } from '../../../hooks/useAccount';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import type { SpotOrder } from '../../../services/account';
import { formatDateTime, formatInr } from '../../../utils/format';
import { logger } from '../../../utils/logger';
import { styles } from './styles';

type ReportTab = 'trade' | 'tds' | 'certificates';

interface ReportRow {
  title: string;
  subtitle: string;
  value: string;
  valueTone: TextTone;
  /** Export body; rows without one share their summary line. */
  csv?: string;
}

/** TDS rate on the sale value of crypto (Section 194S). */
const TDS_RATE = 0.01;

/** Start year of the Indian financial year (April–March) holding `time`. */
function financialYearStart(time: number): number {
  const date = new Date(time);
  return date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
}

function toCsv(orders: readonly SpotOrder[]): string {
  const header =
    'Date,Pair,Side,Type,Quantity,Price (INR),Value (INR),Fee (INR)';
  const lines = orders.map(order =>
    [
      formatDateTime(order.closedAt ?? order.createdAt).replace(',', ''),
      (findCoin(order.coinId)?.symbol ?? order.coinId) + '/INR',
      order.side,
      order.type,
      order.quantity,
      order.price.toFixed(2),
      (order.price * order.quantity).toFixed(2),
      order.fee.toFixed(2),
    ].join(','),
  );
  return [header, ...lines].join('\n');
}

const TABS = [
  { value: 'trade', label: 'Trade Report' },
  { value: 'tds', label: 'TDS Summary' },
  { value: 'certificates', label: 'Certificates' },
] as const;

const REPORTS: Record<ReportTab, readonly ReportRow[]> = {
  trade: [
    {
      title: 'FY 2023-24',
      subtitle: '284 trades',
      value: '+₹12,430',
      valueTone: 'success',
    },
    {
      title: 'FY 2022-23',
      subtitle: '156 trades',
      value: '-₹3,210',
      valueTone: 'danger',
    },
    {
      title: 'FY 2021-22',
      subtitle: '97 trades',
      value: '+₹67,840',
      valueTone: 'success',
    },
  ],
  tds: [
    {
      title: 'FY 2023-24',
      subtitle: 'TDS deducted at 1%',
      value: '₹2,840',
      valueTone: 'default',
    },
    {
      title: 'FY 2022-23',
      subtitle: 'TDS deducted at 1%',
      value: '₹1,560',
      valueTone: 'default',
    },
  ],
  certificates: [
    {
      title: 'Form 26AS extract',
      subtitle: 'FY 2023-24',
      value: 'Ready',
      valueTone: 'muted',
    },
    {
      title: 'TDS certificate',
      subtitle: 'FY 2023-24',
      value: 'Ready',
      valueTone: 'muted',
    },
  ],
};

/** Downloadable tax documents grouped by financial year. */
export function TaxReportsScreen({
  navigation,
}: AppStackScreenProps<'TaxReports'>) {
  const theme = useTheme();
  const [tab, setTab] = useState<ReportTab>('trade');
  const { orders } = useAccount();

  const yearStart = financialYearStart(Date.now());
  const yearLabel = 'FY ' + yearStart + '-' + String(yearStart + 1).slice(2);
  const yearOrders = orders.filter(
    order =>
      order.status === 'filled' &&
      financialYearStart(order.closedAt ?? order.createdAt) === yearStart,
  );
  const turnover = yearOrders.reduce(
    (sum, order) => sum + order.price * order.quantity,
    0,
  );
  const sellValue = yearOrders
    .filter(order => order.side === 'sell')
    .reduce((sum, order) => sum + order.price * order.quantity, 0);
  const csv = toCsv(yearOrders);
  const currentRows: Record<ReportTab, ReportRow[]> = {
    trade: [
      {
        title: yearLabel + ' (current)',
        subtitle: yearOrders.length + ' trades · turnover',
        value: formatInr(turnover),
        valueTone: 'default',
        csv,
      },
    ],
    tds: [
      {
        title: yearLabel + ' (current)',
        subtitle: 'TDS at 1% of sell value',
        value: formatInr(sellValue * TDS_RATE),
        valueTone: 'default',
        csv,
      },
    ],
    certificates: [],
  };
  const rows = [...currentRows[tab], ...REPORTS[tab]];

  const onExport = (row: ReportRow) =>
    Share.share({
      title: row.title,
      message: row.csv ?? row.title + ' · ' + row.subtitle + ' · ' + row.value,
    }).catch(error => logger.warn('Unable to open the share sheet', error));

  return (
    <Screen>
      <ScreenHeader title="Tax Reports" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <InfoBanner message="Reports are generated as per CBDT guidelines for crypto assets. Consult a CA for filing assistance." />

        <SegmentedControl options={TABS} value={tab} onChange={setTab} />

        <Card>
          {rows.map((row, index) => (
            <ListRow
              key={row.title}
              icon="file-text"
              title={row.title}
              subtitle={row.subtitle}
              divider={index < rows.length - 1}
              trailing={
                <View style={styles.trailing}>
                  <Text variant="label" tone={row.valueTone}>
                    {row.value}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={'Download ' + row.title + ' as CSV'}
                    hitSlop={8}
                    onPress={() => onExport(row)}
                    style={styles.download}
                  >
                    <Icon
                      name="download"
                      size={14}
                      color={theme.colors.textMuted}
                    />
                    <Text
                      variant="caption"
                      tone="muted"
                      style={styles.downloadLabel}
                    >
                      CSV
                    </Text>
                  </Pressable>
                </View>
              }
            />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
