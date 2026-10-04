import { EARN_PRODUCTS } from '../../constants/earn';
import { MARKET_COINS } from '../../constants/markets';
import { formatDate, formatQuantity } from '../../utils/format';
import {
  accountStore,
  adjustHolding,
  EPSILON,
  fail,
  getAvailableQuantity,
  newId,
  succeed,
} from './store';
import type { Result, Stake } from './types';

const DAY_MS = 86_400_000;
const YEAR_MS = 365 * DAY_MS;

/** Rewards accrued so far, in coin units. */
export function stakeReward(stake: Stake, now = Date.now()): number {
  return (
    (stake.quantity * stake.apy * Math.max(0, now - stake.startedAt)) /
    100 /
    YEAR_MS
  );
}

/** When a locked stake can be redeemed; `startedAt` for flexible ones. */
export function stakeMaturesAt(stake: Stake): number {
  return stake.startedAt + stake.lockDays * DAY_MS;
}

function symbolOf(coinId: string): string {
  return MARKET_COINS.find(coin => coin.id === coinId)?.symbol ?? coinId;
}

/** Locks coins into a staking product. They stay in holdings, locked. */
export function subscribeEarn(
  productId: string,
  quantity: number,
): Result<Stake> {
  const product = EARN_PRODUCTS.find(item => item.id === productId);
  if (!product) {
    return fail('This product is not available.');
  }
  const symbol = symbolOf(product.coinId);
  if (!Number.isFinite(quantity) || quantity < product.minQuantity) {
    return fail(
      'Minimum stake is ' + formatQuantity(product.minQuantity, symbol) + '.',
    );
  }
  const account = accountStore.get();
  if (quantity > getAvailableQuantity(account, product.coinId) + EPSILON) {
    return fail('Insufficient ' + symbol + ' balance.');
  }
  const stake: Stake = {
    id: newId(),
    productId: product.id,
    coinId: product.coinId,
    quantity,
    apy: product.apy,
    lockDays: product.lockDays,
    startedAt: Date.now(),
  };
  accountStore.set({ ...account, stakes: [...account.stakes, stake] });
  return succeed(stake);
}

/** Unlocks a stake and credits its rewards. Returns the reward. */
export function redeemStake(stakeId: string, now = Date.now()): Result<number> {
  const account = accountStore.get();
  const stake = account.stakes.find(item => item.id === stakeId);
  if (!stake) {
    return fail('This stake has already been redeemed.');
  }
  if (now < stakeMaturesAt(stake)) {
    return fail('Locked until ' + formatDate(stakeMaturesAt(stake)) + '.');
  }
  const reward = stakeReward(stake, now);
  const next = adjustHolding(account, stake.coinId, reward);
  accountStore.set({
    ...next,
    stakes: next.stakes.filter(item => item.id !== stakeId),
  });
  return succeed(reward);
}
