/**
 * Placeholder coin list. Prices and changes seed the simulated feed in
 * `src/services/market`; replace both with the ticker API once it exists.
 */
export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  pair: string;
  /** Brand colour of the coin. Omitted when there is no logo yet. */
  color?: string;
  /** Last traded price in INR. The seed for the simulated live feed. */
  price: number;
  /** 24h volume in USD. */
  volumeUsd: number;
  /** 24h change in percent, e.g. `-1.02`. */
  change24h: number;
  /** Stablecoin: the simulated feed barely moves it. */
  stable?: boolean;
}

export const MARKET_COINS: readonly MarketCoin[] = [
  {
    id: 'trx',
    symbol: 'TRX',
    name: 'TRON',
    pair: 'TRX/USDT',
    price: 32.57,
    volumeUsd: 2_000_000,
    change24h: 0.56,
  },
  {
    id: 'doge',
    symbol: 'DOGE',
    name: 'Dogecoin',
    pair: 'DOGE/USDT',
    color: '#C2A633',
    price: 8.14,
    volumeUsd: 3_000_000,
    change24h: 0.71,
  },
  {
    id: 'arb',
    symbol: 'ARB',
    name: 'Arbitrum',
    pair: 'ARB/USDT',
    price: 8.39,
    volumeUsd: 367_000,
    change24h: 0.8,
  },
  {
    id: 'dot',
    symbol: 'DOT',
    name: 'Polkadot',
    pair: 'DOT/USDT',
    price: 81.48,
    volumeUsd: 8_000_000,
    change24h: 1.38,
  },
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    pair: 'BTC/USDT',
    color: '#F7931A',
    price: 7_478_000,
    volumeUsd: 164_000_000,
    change24h: 0.66,
  },
  {
    id: 'ada',
    symbol: 'ADA',
    name: 'Cardano',
    pair: 'ADA/USDT',
    color: '#0033AD',
    price: 19.3,
    volumeUsd: 1_000_000,
    change24h: 0.84,
  },
  {
    id: 'inj',
    symbol: 'INJ',
    name: 'Injective',
    pair: 'INJ/USDT',
    price: 496.78,
    volumeUsd: 719_000,
    change24h: 3.3,
  },
  {
    id: 'atom',
    symbol: 'ATOM',
    name: 'Cosmos',
    pair: 'ATOM/USDT',
    price: 141.67,
    volumeUsd: 416_000,
    change24h: -1.02,
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    pair: 'ETH/USDT',
    color: '#627EEA',
    price: 235_000,
    volumeUsd: 41_000_000,
    change24h: 1.01,
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    pair: 'SOL/USDT',
    color: '#9945FF',
    price: 13_240,
    volumeUsd: 12_000_000,
    change24h: 4.1,
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether',
    pair: 'USDT/INR',
    color: '#26A17B',
    price: 84.5,
    volumeUsd: 250_000_000,
    change24h: 0.12,
    stable: true,
  },
];

export function findCoin(coinId: string): MarketCoin | undefined {
  return MARKET_COINS.find(coin => coin.id === coinId);
}
