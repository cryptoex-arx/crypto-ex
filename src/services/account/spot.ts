import { MARKET_COINS } from '../../constants/markets';
import { getQuotes, type QuoteMap } from '../market';
import {
  accountStore,
  adjustHolding,
  EPSILON,
  fail,
  FEE_RATE,
  getAvailableInr,
  getAvailableQuantity,
  MIN_ORDER_INR,
  newId,
  succeed,
} from './store';
import type {
  AccountState,
  OrderSide,
  OrderType,
  Result,
  SpotOrder,
} from './types';

export interface OrderInput {
  coinId: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  /** Limit price; required for limit and stop-limit orders. */
  price?: number;
  /** Trigger price; required for stop-limit orders. */
  stopPrice?: number;
}

function isPositive(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value) && value > 0;
}

/** Applies a fill to balances and holdings and closes the order. */
function fill(
  account: AccountState,
  order: SpotOrder,
  price: number,
  now: number,
): AccountState {
  const value = price * order.quantity;
  const fee = value * FEE_RATE;
  const filled: SpotOrder = {
    ...order,
    price,
    fee,
    status: 'filled',
    triggered: order.type === 'stopLimit' ? true : undefined,
    closedAt: now,
  };
  const exists = account.orders.some(item => item.id === order.id);
  const orders = exists
    ? account.orders.map(item => (item.id === order.id ? filled : item))
    : [filled, ...account.orders];

  const next =
    order.side === 'buy'
      ? adjustHolding(account, order.coinId, order.quantity, price)
      : adjustHolding(account, order.coinId, -order.quantity);

  return {
    ...next,
    orders,
    inrBalance:
      order.side === 'buy'
        ? account.inrBalance - value - fee
        : account.inrBalance + value - fee,
  };
}

function validate(input: OrderInput, marketPrice: number): string | undefined {
  if (!MARKET_COINS.some(coin => coin.id === input.coinId)) {
    return 'This coin is not listed on the exchange.';
  }
  if (!isPositive(input.quantity)) {
    return 'Enter a quantity greater than zero.';
  }
  if (input.type !== 'market' && !isPositive(input.price)) {
    return 'Enter a price greater than zero.';
  }
  if (input.type === 'stopLimit') {
    if (!isPositive(input.stopPrice)) {
      return 'Enter a stop price greater than zero.';
    }
    if (input.side === 'buy' && input.stopPrice <= marketPrice) {
      return 'A buy stop must be above the market price.';
    }
    if (input.side === 'sell' && input.stopPrice >= marketPrice) {
      return 'A sell stop must be below the market price.';
    }
  }
  return undefined;
}

/**
 * Places a spot order against the live simulated feed. Market orders fill at
 * once at the live price. Limit orders that already cross it fill at the live
 * price too; otherwise they rest and lock funds until the feed reaches them.
 * Stop-limit orders rest untriggered until the feed reaches the stop.
 */
export function placeOrder(input: OrderInput): Result<SpotOrder> {
  const account = accountStore.get();
  const marketPrice = getQuotes()[input.coinId]?.price ?? 0;
  const invalid = validate(input, marketPrice);
  if (invalid) {
    return fail(invalid);
  }

  const limitPrice = input.type === 'market' ? marketPrice : input.price!;
  const value = limitPrice * input.quantity;
  if (value < MIN_ORDER_INR - EPSILON) {
    return fail('Minimum order value is ₹' + MIN_ORDER_INR + '.');
  }
  if (
    input.side === 'buy' &&
    value * (1 + FEE_RATE) > getAvailableInr(account) + EPSILON
  ) {
    return fail('Insufficient INR balance.');
  }
  if (
    input.side === 'sell' &&
    input.quantity > getAvailableQuantity(account, input.coinId) + EPSILON
  ) {
    return fail('Insufficient coin balance.');
  }

  const now = Date.now();
  const order: SpotOrder = {
    id: newId(),
    coinId: input.coinId,
    side: input.side,
    type: input.type,
    quantity: input.quantity,
    price: limitPrice,
    stopPrice: input.type === 'stopLimit' ? input.stopPrice : undefined,
    triggered: input.type === 'stopLimit' ? false : undefined,
    fee: 0,
    status: 'open',
    createdAt: now,
  };
  const crosses =
    input.type !== 'stopLimit' &&
    (input.side === 'buy'
      ? marketPrice <= limitPrice
      : marketPrice >= limitPrice);

  if (crosses) {
    const next = fill(account, order, marketPrice, now);
    accountStore.set(next);
    return succeed(next.orders[0]);
  }

  accountStore.set({ ...account, orders: [order, ...account.orders] });
  return succeed(order);
}

/** Cancels an open spot order, releasing what it locked. */
export function cancelOrder(orderId: string): boolean {
  const account = accountStore.get();
  const order = account.orders.find(item => item.id === orderId);
  if (!order || order.status !== 'open') {
    return false;
  }
  const cancelled: SpotOrder = {
    ...order,
    status: 'cancelled',
    closedAt: Date.now(),
  };
  accountStore.set({
    ...account,
    orders: account.orders.map(item =>
      item.id === orderId ? cancelled : item,
    ),
  });
  return true;
}

export function toggleFavourite(coinId: string) {
  accountStore.update(account => ({
    ...account,
    favourites: account.favourites.includes(coinId)
      ? account.favourites.filter(id => id !== coinId)
      : [...account.favourites, coinId],
  }));
}

/**
 * Triggers stop-limit orders and fills resting orders the latest tick has
 * reached. Resting limits fill at their limit; a stop that triggers into a
 * crossing limit fills at the live price.
 */
export function matchSpot(
  account: AccountState,
  quotes: QuoteMap,
  now: number,
): { account: AccountState; filled: SpotOrder[] } {
  let next = account;
  const filled: SpotOrder[] = [];

  for (const order of account.orders) {
    const price = quotes[order.coinId]?.price;
    if (order.status !== 'open' || price === undefined) {
      continue;
    }

    if (order.type === 'stopLimit' && !order.triggered) {
      const reached =
        order.side === 'buy'
          ? price >= order.stopPrice!
          : price <= order.stopPrice!;
      if (!reached) {
        continue;
      }
      const crosses =
        order.side === 'buy' ? price <= order.price : price >= order.price;
      if (crosses) {
        next = fill(next, order, price, now);
        filled.push(order);
      } else {
        const triggered = { ...order, triggered: true };
        next = {
          ...next,
          orders: next.orders.map(item =>
            item.id === order.id ? triggered : item,
          ),
        };
      }
      continue;
    }

    const reached =
      order.side === 'buy' ? price <= order.price : price >= order.price;
    if (reached) {
      next = fill(next, order, order.price, now);
      filled.push(order);
    }
  }

  return { account: next, filled };
}

export function hasOpenSpotOrders(account: AccountState): boolean {
  return account.orders.some(order => order.status === 'open');
}
