import { ACCOUNT_SEED } from '../../constants/account';
import { createPersistentStore } from '../storage/persistentStore';
import type { AccountState, Result } from './types';

/**
 * The simulated account standing in for the exchange's wallet, order and
 * futures APIs. Every money-moving action goes through this one store so a
 * transfer or a fill updates all balances atomically.
 */
export const accountStore = createPersistentStore<AccountState>(
  'cryptoex/account/v2',
  ACCOUNT_SEED,
);

/** Float dust below this counts as zero. */
export const EPSILON = 1e-9;
/** Flat taker/maker rate of the Regular tier on the Fee Structure screen. */
export const FEE_RATE = 0.002;
/** Smallest spot order value in INR, fee excluded. */
export const MIN_ORDER_INR = 100;

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function fail<T = undefined>(error: string): Result<T> {
  return { ok: false, error };
}

export function succeed<T>(value: T): Result<T> {
  return { ok: true, value };
}

/** INR free to spend: balance minus what open buy orders lock. */
export function getAvailableInr(account: AccountState): number {
  const locked = account.orders.reduce(
    (sum, order) =>
      order.status === 'open' && order.side === 'buy'
        ? sum + order.price * order.quantity * (1 + FEE_RATE)
        : sum,
    0,
  );
  return account.inrBalance - locked;
}

/** Quantity of a coin locked by open sell orders and stakes. */
export function getLockedQuantity(
  account: AccountState,
  coinId: string,
): number {
  const inOrders = account.orders.reduce(
    (sum, order) =>
      order.status === 'open' &&
      order.side === 'sell' &&
      order.coinId === coinId
        ? sum + order.quantity
        : sum,
    0,
  );
  const staked = account.stakes.reduce(
    (sum, stake) => (stake.coinId === coinId ? sum + stake.quantity : sum),
    0,
  );
  return inOrders + staked;
}

/** Quantity of a coin free to sell, stake, withdraw or transfer. */
export function getAvailableQuantity(
  account: AccountState,
  coinId: string,
): number {
  const held = account.holdings[coinId]?.quantity ?? 0;
  return Math.max(0, held - getLockedQuantity(account, coinId));
}

/** USDT in the futures wallet not tied up as margin. */
export function getAvailableMargin(account: AccountState): number {
  const { futures } = account;
  const inPositions = futures.positions.reduce(
    (sum, position) => sum + position.margin,
    0,
  );
  const inOrders = futures.orders.reduce(
    (sum, order) => (order.status === 'open' ? sum + order.margin : sum),
    0,
  );
  return Math.max(0, futures.balance - inPositions - inOrders);
}

/** Adds (or with a negative `quantity`, removes) coins at `price` INR. */
export function adjustHolding(
  account: AccountState,
  coinId: string,
  quantity: number,
  price?: number,
): AccountState {
  const holding = account.holdings[coinId];
  const held = holding?.quantity ?? 0;
  const next = held + quantity;
  const holdings = { ...account.holdings };

  if (next <= EPSILON) {
    delete holdings[coinId];
  } else if (quantity > 0 && price !== undefined) {
    holdings[coinId] = {
      quantity: next,
      avgPrice: ((holding?.avgPrice ?? 0) * held + price * quantity) / next,
    };
  } else {
    holdings[coinId] = { quantity: next, avgPrice: holding?.avgPrice ?? 0 };
  }
  return { ...account, holdings };
}
