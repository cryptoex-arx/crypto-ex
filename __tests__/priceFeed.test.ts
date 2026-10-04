import {
  getCandleHistory,
  getQuotes,
  subscribeToQuotes,
  subscribeToTrades,
} from '../src/services/market';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('ticks only while subscribed and keeps 24h stats consistent', () => {
  const initial = getQuotes();
  const listener = jest.fn();

  jest.advanceTimersByTime(5000);
  expect(getQuotes()).toBe(initial);

  const unsubscribe = subscribeToQuotes(listener);
  jest.advanceTimersByTime(1500);
  expect(listener).toHaveBeenCalledTimes(1);

  const quote = getQuotes().btc;
  expect(quote).not.toBe(initial.btc);
  expect(quote.high24h).toBeGreaterThanOrEqual(quote.price);
  expect(quote.low24h).toBeLessThanOrEqual(quote.price);

  unsubscribe();
  const afterStop = getQuotes();
  jest.advanceTimersByTime(5000);
  expect(getQuotes()).toBe(afterStop);
});

test('candle history is ordered, well-formed and ends at the live price', () => {
  const candles = getCandleHistory('btc', 60_000, 50);
  expect(candles).toHaveLength(50);

  candles.forEach((candle, index) => {
    expect(candle.high).toBeGreaterThanOrEqual(
      Math.max(candle.open, candle.close),
    );
    expect(candle.low).toBeLessThanOrEqual(Math.min(candle.open, candle.close));
    if (index > 0) {
      expect(candle.timestamp - candles[index - 1].timestamp).toBe(60_000);
      expect(candle.open).toBe(candles[index - 1].close);
    }
  });
  expect(candles[49].close).toBe(getQuotes().btc.price);
  expect(getCandleHistory('unknown', 60_000)).toEqual([]);
});

test('trade listeners keep the feed running and receive every coin', () => {
  const trades: string[] = [];
  const unsubscribe = subscribeToTrades(coinId => trades.push(coinId));

  jest.advanceTimersByTime(1500);
  expect(trades).toContain('btc');
  expect(trades).toHaveLength(Object.keys(getQuotes()).length);

  unsubscribe();
});
