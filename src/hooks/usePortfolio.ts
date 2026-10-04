import { useMemo } from 'react';

import { findCoin, type MarketCoin } from '../constants/markets';
import {
  getAvailableInr,
  getLockedQuantity,
  getMarkPrice,
  unrealizedPnl,
} from '../services/account';
import { useAccount } from './useAccount';
import { useLiveQuotes } from './useLiveQuotes';

export interface PortfolioAsset {
  coin: MarketCoin;
  quantity: number;
  locked: number;
  /** INR at the live price. */
  value: number;
  /** INR at the average buy price. */
  invested: number;
  pnl: number;
  /** INR change over the last 24h. */
  dayChange: number;
}

export interface Portfolio {
  inrBalance: number;
  availableInr: number;
  /** Largest value first. */
  assets: PortfolioAsset[];
  /** INR value of the futures wallet plus unrealised P&L. */
  futuresValue: number;
  /** INR cash + coins + futures. */
  total: number;
  /** INR change of the coins over the last 24h. */
  dayChange: number;
  /** Percent, against the value 24h ago. */
  dayChangePercent: number;
}

/** Live valuation of the whole account, recomputed on every tick. */
export function usePortfolio(): Portfolio {
  const account = useAccount();
  const quotes = useLiveQuotes();

  return useMemo(() => {
    const assets: PortfolioAsset[] = [];
    for (const [coinId, holding] of Object.entries(account.holdings)) {
      const coin = findCoin(coinId);
      const quote = quotes[coinId];
      if (!coin || !quote) {
        continue;
      }
      const value = holding.quantity * quote.price;
      const invested = holding.quantity * holding.avgPrice;
      assets.push({
        coin,
        quantity: holding.quantity,
        locked: getLockedQuantity(account, coinId),
        value,
        invested,
        pnl: value - invested,
        dayChange: value - value / (1 + quote.change24h / 100),
      });
    }
    assets.sort((a, b) => b.value - a.value);

    const usdt = quotes.usdt?.price ?? 0;
    const unrealised = account.futures.positions.reduce((sum, position) => {
      const mark = getMarkPrice(position.coinId, quotes);
      return mark === undefined ? sum : sum + unrealizedPnl(position, mark);
    }, 0);
    const futuresValue = (account.futures.balance + unrealised) * usdt;

    const coinsValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    const dayChange = assets.reduce((sum, asset) => sum + asset.dayChange, 0);
    const total = account.inrBalance + coinsValue + futuresValue;
    const previous = total - dayChange;

    return {
      inrBalance: account.inrBalance,
      availableInr: getAvailableInr(account),
      assets,
      futuresValue,
      total,
      dayChange,
      dayChangePercent: previous > 0 ? (dayChange / previous) * 100 : 0,
    };
  }, [account, quotes]);
}
