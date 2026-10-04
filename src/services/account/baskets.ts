import { BASKETS } from '../../constants/baskets';
import { floorTo, formatInr } from '../../utils/format';
import { getQuotes, type QuoteMap } from '../market';
import { placeOrder } from './spot';
import {
  accountStore,
  EPSILON,
  fail,
  FEE_RATE,
  getAvailableInr,
  MIN_ORDER_INR,
  succeed,
} from './store';
import type { Result } from './types';

/** Weighted 24h change of a basket, in percent. */
export function basketChange(basketId: string, quotes: QuoteMap): number {
  const basket = BASKETS.find(item => item.id === basketId);
  return (
    basket?.components.reduce(
      (sum, component) =>
        sum + component.weight * (quotes[component.coinId]?.change24h ?? 0),
      0,
    ) ?? 0
  );
}

/**
 * Splits `amount` INR across the basket by weight with one market buy per
 * coin. Everything is checked first so a basket never half-fills.
 */
export function investInBasket(
  basketId: string,
  amount: number,
): Result<number> {
  const basket = BASKETS.find(item => item.id === basketId);
  if (!basket) {
    return fail('This basket is not available.');
  }
  if (!Number.isFinite(amount) || amount < basket.minInvestment) {
    return fail(
      'Minimum investment is ' + formatInr(basket.minInvestment) + '.',
    );
  }
  if (amount > getAvailableInr(accountStore.get()) + EPSILON) {
    return fail('Insufficient INR balance.');
  }

  const quotes = getQuotes();
  const legs = basket.components.map(component => {
    const price = quotes[component.coinId]?.price ?? 0;
    const spend = amount * component.weight;
    return {
      coinId: component.coinId,
      quantity: price ? floorTo(spend / (price * (1 + FEE_RATE)), 8) : 0,
      value: spend / (1 + FEE_RATE),
    };
  });
  if (legs.some(leg => leg.quantity <= 0 || leg.value < MIN_ORDER_INR)) {
    return fail('Invest a larger amount so every coin gets at least ₹100.');
  }

  let placed = 0;
  for (const leg of legs) {
    const result = placeOrder({
      coinId: leg.coinId,
      side: 'buy',
      type: 'market',
      quantity: leg.quantity,
    });
    if (!result.ok) {
      return fail(
        placed > 0
          ? 'Bought ' +
              placed +
              ' of ' +
              legs.length +
              ' coins: ' +
              result.error
          : result.error,
      );
    }
    placed += 1;
  }
  return succeed(placed);
}
