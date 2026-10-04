import type { AccountState } from '../services/account/types';

const HOUR_MS = 3_600_000;
const seededAt = Date.now();

/**
 * Starting account for the simulated wallet in `src/services/account`, used
 * until something is saved on the device. Replace with the wallet API.
 */
export const ACCOUNT_SEED: AccountState = {
  inrBalance: 50_000,
  holdings: {
    btc: { quantity: 0.0142, avgPrice: 7_031_000 },
    eth: { quantity: 0.45, avgPrice: 240_000 },
    sol: { quantity: 2.5, avgPrice: 12_480 },
    usdt: { quantity: 12.4, avgPrice: 84.1 },
  },
  orders: [
    {
      id: 'seed-btc-buy',
      coinId: 'btc',
      side: 'buy',
      type: 'limit',
      quantity: 0.005,
      price: 7_043_000,
      fee: 0,
      status: 'open',
      createdAt: seededAt - HOUR_MS,
    },
    {
      id: 'seed-eth-sell',
      coinId: 'eth',
      side: 'sell',
      type: 'limit',
      quantity: 0.2,
      price: 260_000,
      fee: 0,
      status: 'open',
      createdAt: seededAt - 2 * HOUR_MS,
    },
    {
      id: 'seed-sol-buy',
      coinId: 'sol',
      side: 'buy',
      type: 'market',
      quantity: 2.5,
      price: 12_480,
      fee: 62.4,
      status: 'filled',
      createdAt: seededAt - 24 * HOUR_MS,
      closedAt: seededAt - 24 * HOUR_MS,
    },
    {
      id: 'seed-btc-sell',
      coinId: 'btc',
      side: 'sell',
      type: 'limit',
      quantity: 0.002,
      price: 7_110_000,
      fee: 28.44,
      status: 'filled',
      createdAt: seededAt - 48 * HOUR_MS,
      closedAt: seededAt - 47 * HOUR_MS,
    },
    {
      id: 'seed-eth-buy',
      coinId: 'eth',
      side: 'buy',
      type: 'limit',
      quantity: 0.5,
      price: 221_000,
      fee: 0,
      status: 'cancelled',
      createdAt: seededAt - 72 * HOUR_MS,
      closedAt: seededAt - 70 * HOUR_MS,
    },
  ],
  favourites: ['btc', 'eth'],
  transactions: [
    {
      id: 'seed-inr-deposit',
      kind: 'deposit',
      asset: 'inr',
      amount: 50_000,
      fee: 0,
      status: 'completed',
      method: 'UPI',
      reference: 'UPI418822913045',
      createdAt: seededAt - 96 * HOUR_MS,
      completedAt: seededAt - 96 * HOUR_MS,
    },
  ],
  bankAccounts: [],
  futures: { balance: 250, positions: [], orders: [], history: [] },
  stakes: [],
  sipPlans: [],
  redeemedCoupons: [],
};
