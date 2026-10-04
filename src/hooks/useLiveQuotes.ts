import { useSyncExternalStore } from 'react';

import {
  type CoinQuote,
  getQuotes,
  type QuoteMap,
  subscribeToQuotes,
} from '../services/market';

/** Every coin's live quote; re-renders on each feed tick. */
export function useLiveQuotes(): QuoteMap {
  return useSyncExternalStore(subscribeToQuotes, getQuotes);
}

/** One coin's live quote, or `undefined` for an unknown id. */
export function useLiveQuote(coinId: string): CoinQuote | undefined {
  return useSyncExternalStore(subscribeToQuotes, () => getQuotes()[coinId]);
}
