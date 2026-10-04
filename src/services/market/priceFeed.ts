import { MARKET_COINS } from '../../constants/markets';

/** Live figures for one coin. Static facts stay on `MarketCoin`. */
export interface CoinQuote {
  /** INR. */
  price: number;
  /** Percent change against the price 24h ago. */
  change24h: number;
  high24h: number;
  low24h: number;
}

export type QuoteMap = Readonly<Record<string, CoinQuote>>;

/** One OHLCV bucket. `timestamp` is the bucket start in ms; volume is USD. */
export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** One executed trade: INR price, USD size. */
export interface Trade {
  timestamp: number;
  price: number;
  size: number;
  /** The aggressor: an uptick counts as a buy. */
  side: 'buy' | 'sell';
}

type TradeListener = (coinId: string, trade: Trade) => void;

const TICK_MS = 1500;
const DAY_MS = 86_400_000;
/** Largest move per tick as a fraction of price (±0.15%). */
const MAX_STEP = 0.0015;
/** Largest open-to-close move of a 1-minute history candle (±0.2%). */
const MINUTE_CANDLE_STEP = 0.002;
/** Cap for long timeframes so daily candles stay believable (±4%). */
const MAX_CANDLE_STEP = 0.04;
/** Stablecoins move a twentieth as much. */
const STABLE_DAMPING = 0.05;

const stepById: Record<string, number> = Object.fromEntries(
  MARKET_COINS.map(coin => [
    coin.id,
    coin.stable ? MAX_STEP * STABLE_DAMPING : MAX_STEP,
  ]),
);

const volumeById: Record<string, number> = Object.fromEntries(
  MARKET_COINS.map(coin => [coin.id, coin.volumeUsd]),
);

/** The price 24h ago, derived once from each coin's seed change. */
const openPrices: Record<string, number> = Object.fromEntries(
  MARKET_COINS.map(coin => [coin.id, coin.price / (1 + coin.change24h / 100)]),
);

let quotes: QuoteMap = Object.fromEntries(
  MARKET_COINS.map(coin => {
    const open = openPrices[coin.id];
    return [
      coin.id,
      {
        price: coin.price,
        change24h: coin.change24h,
        high24h: Math.max(open, coin.price),
        low24h: Math.min(open, coin.price),
      },
    ];
  }),
);

const listeners = new Set<() => void>();
const tradeListeners = new Set<TradeListener>();
let timer: ReturnType<typeof setInterval> | undefined;

/** Uniform random number in [-1, 1). */
function jitter(): number {
  return Math.random() * 2 - 1;
}

function tick() {
  const timestamp = Date.now();
  const next: Record<string, CoinQuote> = {};
  for (const [id, quote] of Object.entries(quotes)) {
    const price = quote.price * (1 + jitter() * stepById[id]);
    next[id] = {
      price,
      change24h: (price / openPrices[id] - 1) * 100,
      high24h: Math.max(quote.high24h, price),
      low24h: Math.min(quote.low24h, price),
    };
  }
  const previous = quotes;
  quotes = next;
  listeners.forEach(listener => listener());

  if (tradeListeners.size > 0) {
    for (const [id, quote] of Object.entries(quotes)) {
      const size = (volumeById[id] * TICK_MS * (0.5 + Math.random())) / DAY_MS;
      const side: Trade['side'] =
        quote.price >= previous[id].price ? 'buy' : 'sell';
      const trade = { timestamp, price: quote.price, size, side };
      tradeListeners.forEach(listener => listener(id, trade));
    }
  }
}

/** Runs the ticker only while someone listens to quotes or trades. */
function syncTimer() {
  const active = listeners.size + tradeListeners.size > 0;
  if (active && !timer) {
    timer = setInterval(tick, TICK_MS);
  } else if (!active && timer) {
    clearInterval(timer);
    timer = undefined;
  }
}

/**
 * Simulated ticker standing in for the exchange's price stream: a random walk
 * seeded from `MARKET_COINS`. It only runs while something is subscribed.
 * Swap the internals for a WebSocket and callers stay unchanged.
 */
export function subscribeToQuotes(listener: () => void): () => void {
  listeners.add(listener);
  syncTimer();

  return () => {
    listeners.delete(listener);
    syncTimer();
  };
}

/** Latest snapshot. A new object after every tick, stable in between. */
export function getQuotes(): QuoteMap {
  return quotes;
}

/** One trade per coin per tick, at the same price the quotes move to. */
export function subscribeToTrades(listener: TradeListener): () => void {
  tradeListeners.add(listener);
  syncTimer();

  return () => {
    tradeListeners.delete(listener);
    syncTimer();
  };
}

/**
 * Invented history for the chart: `count` epoch-aligned candles of
 * `resolutionMs` each, walking backwards so the last close is the coin's
 * current live price. Regenerated on every call.
 */
export function getCandleHistory(
  coinId: string,
  resolutionMs: number,
  count = 300,
): Candle[] {
  const quote = quotes[coinId];
  if (!quote) {
    return [];
  }

  const step = Math.min(
    MINUTE_CANDLE_STEP * Math.sqrt(resolutionMs / 60_000),
    MAX_CANDLE_STEP,
  );
  const volume = (volumeById[coinId] * resolutionMs) / DAY_MS;
  const lastStart = Math.floor(Date.now() / resolutionMs) * resolutionMs;
  const candles: Candle[] = new Array(count);

  let close = quote.price;
  for (let index = count - 1; index >= 0; index -= 1) {
    const open = close * (1 + jitter() * step);
    candles[index] = {
      timestamp: lastStart - (count - 1 - index) * resolutionMs,
      open,
      high: Math.max(open, close) * (1 + (Math.random() * step) / 2),
      low: Math.min(open, close) * (1 - (Math.random() * step) / 2),
      close,
      volume: volume * (0.5 + Math.random()),
    };
    close = open;
  }

  return candles;
}
