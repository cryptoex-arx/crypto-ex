import { MARKET_COINS } from '../../constants/markets';
import { floorTo, formatInr } from '../../utils/format';
import { getQuotes } from '../market';
import { notify } from '../notifications';
import { placeOrder } from './spot';
import { accountStore, fail, FEE_RATE, newId, succeed } from './store';
import type { Result, SipFrequency, SipPlan } from './types';

export const SIP_MIN_AMOUNT = 500;

export const SIP_FREQUENCIES: readonly {
  value: SipFrequency;
  label: string;
}[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function nextRunAfter(from: number, frequency: SipFrequency): number {
  const date = new Date(from);
  if (frequency === 'daily') {
    date.setDate(date.getDate() + 1);
  } else if (frequency === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date.getTime();
}

/** Market-buys `amount` INR of the coin, fee included. */
function buyFor(coinId: string, amount: number): Result<number> {
  const price = getQuotes()[coinId]?.price;
  if (!price) {
    return fail('No price for this coin yet.');
  }
  const quantity = floorTo(amount / (price * (1 + FEE_RATE)), 8);
  const result = placeOrder({ coinId, side: 'buy', type: 'market', quantity });
  if (!result.ok) {
    return result;
  }
  return succeed(result.value.price * result.value.quantity + result.value.fee);
}

function symbolOf(coinId: string): string {
  return MARKET_COINS.find(coin => coin.id === coinId)?.symbol ?? coinId;
}

/** Starts a plan; the first instalment is bought right away. */
export function createSip(
  coinId: string,
  amount: number,
  frequency: SipFrequency,
): Result<SipPlan> {
  if (!MARKET_COINS.some(coin => coin.id === coinId && !coin.stable)) {
    return fail('Choose a coin for the SIP.');
  }
  if (!Number.isFinite(amount) || amount < SIP_MIN_AMOUNT) {
    return fail('Minimum SIP amount is ' + formatInr(SIP_MIN_AMOUNT) + '.');
  }
  const first = buyFor(coinId, amount);
  if (!first.ok) {
    return first;
  }
  const now = Date.now();
  const plan: SipPlan = {
    id: newId(),
    coinId,
    amount,
    frequency,
    status: 'active',
    nextRunAt: nextRunAfter(now, frequency),
    createdAt: now,
    instalments: 1,
    invested: first.value,
  };
  accountStore.update(account => ({
    ...account,
    sipPlans: [plan, ...account.sipPlans],
  }));
  return succeed(plan);
}

function updatePlan(id: string, recipe: (plan: SipPlan) => SipPlan) {
  accountStore.update(account => ({
    ...account,
    sipPlans: account.sipPlans.map(plan =>
      plan.id === id ? recipe(plan) : plan,
    ),
  }));
}

export function pauseSip(id: string) {
  updatePlan(id, plan => ({ ...plan, status: 'paused' }));
}

export function resumeSip(id: string) {
  const now = Date.now();
  updatePlan(id, plan => ({
    ...plan,
    status: 'active',
    nextRunAt:
      plan.nextRunAt > now ? plan.nextRunAt : nextRunAfter(now, plan.frequency),
  }));
}

export function deleteSip(id: string) {
  accountStore.update(account => ({
    ...account,
    sipPlans: account.sipPlans.filter(plan => plan.id !== id),
  }));
}

/**
 * Buys every instalment that is due. Missed runs are not back-filled: a plan
 * runs once and moves on to its next date, like a skipped bank mandate.
 */
export function runDueSips(now = Date.now()) {
  const due = accountStore
    .get()
    .sipPlans.filter(plan => plan.status === 'active' && plan.nextRunAt <= now);

  for (const plan of due) {
    const result = buyFor(plan.coinId, plan.amount);
    const symbol = symbolOf(plan.coinId);
    updatePlan(plan.id, current => ({
      ...current,
      nextRunAt: nextRunAfter(now, current.frequency),
      instalments: current.instalments + (result.ok ? 1 : 0),
      invested: current.invested + (result.ok ? result.value : 0),
    }));
    notify(
      'trade',
      result.ok ? 'SIP instalment bought' : 'SIP instalment skipped',
      result.ok
        ? formatInr(plan.amount) + ' of ' + symbol + ' bought.'
        : symbol + ': ' + result.error,
    );
  }
}
