import type { CoinOrder } from '../../constants/orders';
import { useTheme } from '../../hooks/useTheme';
import { Badge } from '../ui/Badge';
import { ListRow } from '../ui/ListRow';

export interface OrderRowProps {
  order: CoinOrder;
  divider?: boolean;
}

/** One spot order: side icon, pair, size @ price and its status badge. */
export function OrderRow({ order, divider }: OrderRowProps) {
  const theme = useTheme();
  const isBuy = order.side === 'Buy';

  return (
    <ListRow
      icon={isBuy ? 'trending-up' : 'trending-down'}
      iconColor={isBuy ? theme.colors.success : theme.colors.danger}
      iconBackground={
        isBuy ? theme.colors.successSurface : theme.colors.dangerSurface
      }
      title={order.symbol + ' · ' + order.side}
      subtitle={order.detail}
      divider={divider}
      trailing={<Badge label={order.status} tone={order.statusTone} />}
    />
  );
}
