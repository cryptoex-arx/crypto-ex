import { Alert } from 'react-native';

import { findCoin } from '../../constants/markets';
import { useTheme } from '../../hooks/useTheme';
import type { Transaction } from '../../services/account';
import { formatDateTime, formatInr, formatNumber } from '../../utils/format';
import { Badge, type BadgeTone } from '../ui/Badge';
import type { IconName } from '../ui/icons';
import { ListRow } from '../ui/ListRow';

export interface TransactionRowProps {
  transaction: Transaction;
  divider?: boolean;
}

const KIND_LABELS: Record<Transaction['kind'], string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  transfer: 'Transfer',
};

const KIND_ICONS: Record<Transaction['kind'], IconName> = {
  deposit: 'arrow-down',
  withdrawal: 'arrow-up',
  transfer: 'transfer',
};

const STATUS: Record<
  Transaction['status'],
  { label: string; tone: BadgeTone }
> = {
  pending: { label: 'Pending', tone: 'neutral' },
  completed: { label: 'Completed', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
};

export function formatTransactionAmount(asset: string, amount: number): string {
  if (asset === 'inr') {
    return formatInr(amount, 'full');
  }
  return formatNumber(amount, 8) + ' ' + (findCoin(asset)?.symbol ?? asset);
}

/** One deposit, withdrawal or transfer. Tap for the reference and details. */
export function TransactionRow({ transaction, divider }: TransactionRowProps) {
  const theme = useTheme();
  const { kind, asset, amount, fee } = transaction;
  const incoming = kind === 'deposit';
  const status = STATUS[transaction.status];

  const onPress = () =>
    Alert.alert(
      KIND_LABELS[kind] + ' · ' + status.label,
      [
        'Amount: ' + formatTransactionAmount(asset, amount),
        fee > 0 ? 'Fee: ' + formatTransactionAmount(asset, fee) : undefined,
        fee > 0
          ? 'Net: ' + formatTransactionAmount(asset, amount - fee)
          : undefined,
        'Via: ' + transaction.method,
        transaction.destination ? 'To: ' + transaction.destination : undefined,
        'Reference: ' + transaction.reference,
        'Created: ' + formatDateTime(transaction.createdAt),
        transaction.completedAt
          ? 'Completed: ' + formatDateTime(transaction.completedAt)
          : undefined,
      ]
        .filter(Boolean)
        .join('\n'),
    );

  return (
    <ListRow
      icon={KIND_ICONS[kind]}
      iconColor={
        kind === 'transfer'
          ? undefined
          : incoming
          ? theme.colors.success
          : theme.colors.danger
      }
      iconBackground={
        kind === 'transfer'
          ? undefined
          : incoming
          ? theme.colors.successSurface
          : theme.colors.dangerSurface
      }
      title={
        KIND_LABELS[kind] +
        ' · ' +
        (asset === 'inr' ? 'INR' : findCoin(asset)?.symbol ?? asset)
      }
      subtitle={
        (incoming ? '+' : kind === 'withdrawal' ? '-' : '') +
        formatTransactionAmount(asset, amount) +
        ' · ' +
        transaction.method +
        '\n' +
        formatDateTime(transaction.createdAt)
      }
      trailing={<Badge label={status.label} tone={status.tone} />}
      divider={divider}
      onPress={onPress}
    />
  );
}
