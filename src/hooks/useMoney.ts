import { settingsStore } from '../services/settings';
import { formatInr, formatNumber } from '../utils/format';
import { useLiveQuote } from './useLiveQuotes';
import { useStore } from './useStore';

export interface Money {
  currency: 'INR' | 'USDT';
  /** Converts an INR amount to the base currency and formats it. */
  format: (inr: number, style?: 'compact' | 'full') => string;
  /** Same, with a leading + or -. */
  formatSigned: (inr: number) => string;
}

/** Formats balances and P&L in the base currency from Settings. */
export function useMoney(): Money {
  const { baseCurrency } = useStore(settingsStore);
  const usdtPrice = useLiveQuote('usdt')?.price ?? 1;

  const format = (inr: number, style: 'compact' | 'full' = 'full') =>
    baseCurrency === 'INR'
      ? formatInr(inr, style)
      : '$' + formatNumber(inr / usdtPrice, 2);

  return {
    currency: baseCurrency,
    format,
    formatSigned: inr =>
      (inr > 0 ? '+' : inr < 0 ? '-' : '') + format(Math.abs(inr)),
  };
}
