import type { BadgeTone } from '../components/ui/Badge';

/**
 * Placeholder spot orders for the Coin Orders screen and each coin's detail
 * screen. Replace with the orders endpoint once the API layer is wired up.
 */
export type OrderTab = 'pending' | 'history';

export interface CoinOrder {
  id: string;
  symbol: string;
  side: 'Buy' | 'Sell';
  detail: string;
  status: string;
  statusTone: BadgeTone;
}

export const COIN_ORDERS: Record<OrderTab, readonly CoinOrder[]> = {
  pending: [
    {
      id: 'btc-buy',
      symbol: 'BTC',
      side: 'Buy',
      detail: '0.005 BTC @ ₹70,43,000',
      status: 'Open',
      statusTone: 'success',
    },
    {
      id: 'eth-sell',
      symbol: 'ETH',
      side: 'Sell',
      detail: '0.2 ETH @ ₹1,54,200',
      status: 'Open',
      statusTone: 'danger',
    },
  ],
  history: [
    {
      id: 'sol-buy',
      symbol: 'SOL',
      side: 'Buy',
      detail: '2.5 SOL @ ₹12,480',
      status: 'Filled',
      statusTone: 'success',
    },
    {
      id: 'btc-sell',
      symbol: 'BTC',
      side: 'Sell',
      detail: '0.002 BTC @ ₹71,10,000',
      status: 'Filled',
      statusTone: 'success',
    },
    {
      id: 'eth-buy',
      symbol: 'ETH',
      side: 'Buy',
      detail: '0.5 ETH @ ₹1,38,900',
      status: 'Cancelled',
      statusTone: 'neutral',
    },
  ],
};
