import { findCoin } from '../../constants/markets';
import { useTheme } from '../../hooks/useTheme';
import type { SpotOrder } from '../../services/account';
import { formatDateTime, formatNumber, formatPrice } from '../../utils/format';
import { Badge, type BadgeTone } from '../ui/Badge';
import { ListRow } from '../ui/ListRow';

export interface OrderRowProps {
  order: SpotOrder;
  divider?: boolean;
  onPress?: () => void;
}

const TYPE_LABELS: Record<SpotOrder['type'], string> = {
  market: 'Market',
  limit: 'Limit',
  stopLimit: 'Stop-limit',
};

const STATUS: Record<SpotOrder['status'], { label: string; tone: BadgeTone }> =
  {
    open: { label: 'Open', tone: 'success' },
    filled: { label: 'Filled', tone: 'success' },
    cancelled: { label: 'Cancelled', tone: 'neutral' },
  };

/** One spot order: side icon, pair, size @ price and its status badge. */
export function OrderRow({ order, divider, onPress }: OrderRowProps) {
  const theme = useTheme();
  const isBuy = order.side === 'buy';
  const symbol = findCoin(order.coinId)?.symbol ?? order.coinId;
  const status =
    order.status === 'open' && order.type === 'stopLimit' && !order.triggered
      ? { label: 'Waiting', tone: 'neutral' as const }
      : STATUS[order.status];

  return (
    <ListRow
      icon={isBuy ? 'trending-up' : 'trending-down'}
      iconColor={isBuy ? theme.colors.success : theme.colors.danger}
      iconBackground={
        isBuy ? theme.colors.successSurface : theme.colors.dangerSurface
      }
      title={
        symbol +
        ' · ' +
        (isBuy ? 'Buy' : 'Sell') +
        ' · ' +
        TYPE_LABELS[order.type]
      }
      subtitle={
        formatNumber(order.quantity, 8) +
        ' ' +
        symbol +
        ' @ ' +
        formatPrice(order.price) +
        '\n' +
        formatDateTime(order.createdAt)
      }
      divider={divider}
      onPress={onPress}
      showChevron={onPress !== undefined}
      trailing={<Badge label={status.label} tone={status.tone} />}
    />
  );
}
