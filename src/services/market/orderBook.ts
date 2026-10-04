import { MARKET_COINS } from '../../constants/markets';
import { getQuotes, type Trade } from './priceFeed';

export interface BookLevel {
  /** INR. */
  price: number;
  /** Coin units. */
  quantity: number;
}

export interface OrderBook {
  /** Best (highest) first. */
  bids: BookLevel[];
  /** Best (lowest) first. */
  asks: BookLevel[];
}

/** Distance of the best bid and ask from the last price. */
const HALF_SPREAD = 0.0003;
/** Gap between neighbouring levels. */
const LEVEL_STEP = 0.0004;
/** Share of daily volume resting on one level, before the random factor. */
const LEVEL_VOLUME_SHARE = 1 / 4000;

const volumeById: Record<string, number> = Object.fromEntries(
  MARKET_COINS.map(coin => [coin.id, coin.volumeUsd]),
);

function levelQuantity(coinId: string, price: number, depthIndex: number) {
  const usdInr = getQuotes().usdt?.price ?? 1;
  const base = (volumeById[coinId] * usdInr * LEVEL_VOLUME_SHARE) / price;
  return base * (0.3 + Math.random() * 1.4) * (1 + depthIndex * 0.25);
}

/**
 * Invented depth around the live price, standing in for the exchange's order
 * book stream. Regenerated on every call, so it shimmers like a real book.
 */
export function getOrderBook(coinId: string, depth = 8): OrderBook {
  const quote = getQuotes()[coinId];
  if (!quote) {
    return { bids: [], asks: [] };
  }

  const bids: BookLevel[] = [];
  const asks: BookLevel[] = [];
  for (let index = 0; index < depth; index += 1) {
    const offset = HALF_SPREAD + index * LEVEL_STEP;
    const bid = quote.price * (1 - offset);
    const ask = quote.price * (1 + offset);
    bids.push({ price: bid, quantity: levelQuantity(coinId, bid, index) });
    asks.push({ price: ask, quantity: levelQuantity(coinId, ask, index) });
  }
  return { bids, asks };
}

/** Invented recent trades ending at the live price, newest first. */
export function getTradeHistory(coinId: string, count = 20): Trade[] {
  const quote = getQuotes()[coinId];
  if (!quote) {
    return [];
  }

  const trades: Trade[] = [];
  const now = Date.now();
  let price = quote.price;
  for (let index = 0; index < count; index += 1) {
    const previous = price * (1 + (Math.random() * 2 - 1) * 0.0008);
    trades.push({
      timestamp: now - index * 1500,
      price,
      size: (volumeById[coinId] / 57_600) * (0.5 + Math.random()),
      side: price >= previous ? 'buy' : 'sell',
    });
    price = previous;
  }
  return trades;
}
