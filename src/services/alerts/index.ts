import { MARKET_COINS } from '../../constants/markets';
import { formatPrice, formatUsdt } from '../../utils/format';
import { getMarkPrice } from '../account';
import { getQuotes, type QuoteMap, subscribeToQuotes } from '../market';
import { notify } from '../notifications';
import { createPersistentStore } from '../storage/persistentStore';

export type AlertMarket = 'spot' | 'futures';
export type AlertDirection = 'above' | 'below';

export interface PriceAlert {
  id: string;
  coinId: string;
  market: AlertMarket;
  direction: AlertDirection;
  /** INR for spot, USDT mark price for futures. */
  price: number;
  status: 'active' | 'triggered';
  createdAt: number;
  triggeredAt?: number;
}

export interface AlertsState {
  alerts: readonly PriceAlert[];
}

export type ActionResult = { ok: true } | { ok: false; error: string };

const now = Date.now();

export const alertsStore = createPersistentStore<AlertsState>(
  'cryptoex/alerts/v1',
  {
    alerts: [
      {
        id: 'seed-btc-above',
        coinId: 'btc',
        market: 'spot',
        direction: 'above',
        price: 7_600_000,
        status: 'active',
        createdAt: now,
      },
      {
        id: 'seed-eth-below',
        coinId: 'eth',
        market: 'spot',
        direction: 'below',
        price: 220_000,
        status: 'active',
        createdAt: now,
      },
      {
        id: 'seed-btc-perp',
        coinId: 'btc',
        market: 'futures',
        direction: 'below',
        price: 80_000,
        status: 'active',
        createdAt: now,
      },
    ],
  },
);

function priceFor(
  alert: Pick<PriceAlert, 'coinId' | 'market'>,
  quotes: QuoteMap,
): number | undefined {
  return alert.market === 'spot'
    ? quotes[alert.coinId]?.price
    : getMarkPrice(alert.coinId, quotes);
}

export function formatAlertPrice(market: AlertMarket, price: number): string {
  return market === 'spot' ? formatPrice(price) : formatUsdt(price);
}

function symbolOf(coinId: string): string {
  return MARKET_COINS.find(coin => coin.id === coinId)?.symbol ?? coinId;
}

let unsubscribeQuotes: (() => void) | undefined;

function onTick() {
  const quotes = getQuotes();
  const triggered: PriceAlert[] = [];
  const alerts = alertsStore.get().alerts.map(alert => {
    const price = priceFor(alert, quotes);
    if (alert.status !== 'active' || price === undefined) {
      return alert;
    }
    const hit =
      alert.direction === 'above' ? price >= alert.price : price <= alert.price;
    if (!hit) {
      return alert;
    }
    const next: PriceAlert = {
      ...alert,
      status: 'triggered',
      triggeredAt: Date.now(),
    };
    triggered.push(next);
    return next;
  });

  if (triggered.length === 0) {
    return;
  }
  alertsStore.set({ alerts });
  triggered.forEach(alert =>
    notify(
      'alert',
      symbolOf(alert.coinId) +
        (alert.market === 'futures' ? ' Perp' : '') +
        ' price alert',
      'Price went ' +
        alert.direction +
        ' ' +
        formatAlertPrice(alert.market, alert.price) +
        '.',
    ),
  );
}

/** Watches the feed only while an alert is active. */
export function syncAlerts() {
  const active = alertsStore
    .get()
    .alerts.some(alert => alert.status === 'active');
  if (active && !unsubscribeQuotes) {
    unsubscribeQuotes = subscribeToQuotes(onTick);
  } else if (!active && unsubscribeQuotes) {
    unsubscribeQuotes();
    unsubscribeQuotes = undefined;
  }
}

alertsStore.subscribe(syncAlerts);

export function addAlert(
  input: Pick<PriceAlert, 'coinId' | 'market' | 'direction' | 'price'>,
): ActionResult {
  if (!Number.isFinite(input.price) || input.price <= 0) {
    return { ok: false, error: 'Enter a price greater than zero.' };
  }
  const current = priceFor(input, getQuotes());
  if (current === undefined) {
    return { ok: false, error: 'Choose a coin.' };
  }
  if (input.direction === 'above' && input.price <= current) {
    return {
      ok: false,
      error:
        'Price is already above that. Current: ' +
        formatAlertPrice(input.market, current),
    };
  }
  if (input.direction === 'below' && input.price >= current) {
    return {
      ok: false,
      error:
        'Price is already below that. Current: ' +
        formatAlertPrice(input.market, current),
    };
  }
  alertsStore.update(state => ({
    alerts: [
      {
        ...input,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        status: 'active',
        createdAt: Date.now(),
      },
      ...state.alerts,
    ],
  }));
  return { ok: true };
}

export function removeAlert(id: string) {
  alertsStore.update(state => ({
    alerts: state.alerts.filter(alert => alert.id !== id),
  }));
}

export async function hydrateAlerts() {
  await alertsStore.hydrate();
  syncAlerts();
}
