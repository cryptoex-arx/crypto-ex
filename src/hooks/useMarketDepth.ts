import { useEffect, useMemo, useState } from 'react';

import {
  getOrderBook,
  getTradeHistory,
  type OrderBook,
  subscribeToTrades,
  type Trade,
} from '../services/market';
import { useLiveQuote } from './useLiveQuotes';

const EMPTY_BOOK: OrderBook = { bids: [], asks: [] };

/** Order book around the live price, rebuilt on every tick. */
export function useOrderBook(coinId: string, depth = 8): OrderBook {
  const price = useLiveQuote(coinId)?.price;
  return useMemo(
    () => (price === undefined ? EMPTY_BOOK : getOrderBook(coinId, depth)),
    [coinId, depth, price],
  );
}

/** Latest trades for one coin, newest first. */
export function useRecentTrades(coinId: string, limit = 20): Trade[] {
  const [trades, setTrades] = useState(() => getTradeHistory(coinId, limit));

  useEffect(() => {
    setTrades(getTradeHistory(coinId, limit));
    return subscribeToTrades((id, trade) => {
      if (id === coinId) {
        setTrades(current => [trade, ...current].slice(0, limit));
      }
    });
  }, [coinId, limit]);

  return trades;
}
