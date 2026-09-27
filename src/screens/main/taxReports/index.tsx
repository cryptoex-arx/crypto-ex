import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { InfoBanner } from '../../../components/ui/InfoBanner';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { Text, type TextTone } from '../../../components/ui/Text';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { styles } from './styles';

type ReportTab = 'trade' | 'tds' | 'certificates';

interface ReportRow {
  title: string;
  subtitle: string;
  value: string;
  valueTone: TextTone;
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
  const rows = REPORTS[tab];

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
