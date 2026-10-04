/** Staking products. Replace with the earn API's product list. */
export interface EarnProduct {
  id: string;
  coinId: string;
  /** Percent a year. */
  apy: number;
  /** 0 for flexible: redeem any time. */
  lockDays: number;
  /** Smallest stake, in coin units. */
  minQuantity: number;
}

export const EARN_PRODUCTS: readonly EarnProduct[] = [
  { id: 'usdt-flex', coinId: 'usdt', apy: 8, lockDays: 0, minQuantity: 10 },
  { id: 'eth-30', coinId: 'eth', apy: 4.5, lockDays: 30, minQuantity: 0.01 },
  { id: 'sol-60', coinId: 'sol', apy: 7.2, lockDays: 60, minQuantity: 0.5 },
  { id: 'dot-90', coinId: 'dot', apy: 12, lockDays: 90, minQuantity: 2 },
  { id: 'ada-flex', coinId: 'ada', apy: 3.1, lockDays: 0, minQuantity: 50 },
  { id: 'atom-30', coinId: 'atom', apy: 15, lockDays: 30, minQuantity: 1 },
];
