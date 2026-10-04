import { MARKET_COINS } from '../../constants/markets';
import { formatPrice, formatQuantity } from '../../utils/format';
import { getQuotes, subscribeToQuotes } from '../market';
import { notify } from '../notifications';
import { hasFuturesActivity, matchFutures } from './futures';
import { hasOpenSpotOrders, matchSpot } from './spot';
import { accountStore } from './store';

let unsubscribeQuotes: (() => void) | undefined;

function symbolOf(coinId: string): string {
  return MARKET_COINS.find(coin => coin.id === coinId)?.symbol ?? coinId;
}

/** One pass over resting orders, positions and triggers for the latest tick. */
function onTick() {
  const quotes = getQuotes();
  const now = Date.now();
  const before = accountStore.get();
  const spot = matchSpot(before, quotes, now);
  const futures = matchFutures(spot.account, quotes, now);

  if (futures.account !== before) {
    accountStore.set(futures.account);
  }
  spot.filled.forEach(order =>
    notify(
      'trade',
      'Order filled',
      (order.side === 'buy' ? 'Bought ' : 'Sold ') +
        formatQuantity(order.quantity, symbolOf(order.coinId)) +
        ' at ' +
        formatPrice(order.price) +
        '.',
    ),
  );
  futures.events.forEach(event => notify('trade', event.title, event.body));
}

/** Listens to the feed only while there is something to match. */
export function syncMatcher() {
  const account = accountStore.get();
  const active = hasOpenSpotOrders(account) || hasFuturesActivity(account);
  if (active && !unsubscribeQuotes) {
    unsubscribeQuotes = subscribeToQuotes(onTick);
  } else if (!active && unsubscribeQuotes) {
    unsubscribeQuotes();
    unsubscribeQuotes = undefined;
  }
}

accountStore.subscribe(syncMatcher);
