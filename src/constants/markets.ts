/**
 * Placeholder market data for the Home and Markets tabs. Replace with the
 * ticker feed once the API layer is wired up.
 */
export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  pair: string;
  /** Brand colour of the coin. Omitted when there is no logo yet. */
  color?: string;
  price: string;
  volume: string;
  /** Numeric volume in USD, used only for sorting. */
  volumeUsd: number;
  change: string;
  up: boolean;
}

export const MARKET_COINS: readonly MarketCoin[] = [
  {
    id: 'trx',
    symbol: 'TRX',
    name: 'TRON',
    pair: 'TRX/USDT',
    price: '₹32.57',
    volume: '$2M',
    volumeUsd: 2_000_000,
    change: '+0.56%',
    up: true,
  },
  {
    id: 'doge',
    symbol: 'DOGE',
    name: 'Dogecoin',
    pair: 'DOGE/USDT',
    color: '#C2A633',
    price: '₹8.14',
    volume: '$3M',
    volumeUsd: 3_000_000,
    change: '+0.71%',
    up: true,
  },
  {
    id: 'arb',
    symbol: 'ARB',
    name: 'Arbitrum',
    pair: 'ARB/USDT',
    price: '₹8.39',
    volume: '$367K',
    volumeUsd: 367_000,
    change: '+0.80%',
    up: true,
  },
  {
    id: 'dot',
    symbol: 'DOT',
    name: 'Polkadot',
    pair: 'DOT/USDT',
    price: '₹81.48',
    volume: '$8M',
    volumeUsd: 8_000_000,
    change: '+1.38%',
    up: true,
  },
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    pair: 'BTC/USDT',
    color: '#F7931A',
    price: '₹74.78L',
    volume: '$164M',
    volumeUsd: 164_000_000,
    change: '+0.66%',
    up: true,
  },
  {
    id: 'ada',
    symbol: 'ADA',
    name: 'Cardano',
    pair: 'ADA/USDT',
    color: '#0033AD',
    price: '₹19.30',
    volume: '$1M',
    volumeUsd: 1_000_000,
    change: '+0.84%',
    up: true,
  },
  {
    id: 'inj',
    symbol: 'INJ',
    name: 'Injective',
    pair: 'INJ/USDT',
    price: '₹496.78',
    volume: '$719K',
    volumeUsd: 719_000,
    change: '+3.30%',
    up: true,
  },
  {
    id: 'atom',
    symbol: 'ATOM',
    name: 'Cosmos',
    pair: 'ATOM/USDT',
    price: '₹141.67',
    volume: '$416K',
    volumeUsd: 416_000,
    change: '-1.02%',
    up: false,
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    pair: 'ETH/USDT',
    color: '#627EEA',
    price: '₹2.35L',
    volume: '$41M',
    volumeUsd: 41_000_000,
    change: '+1.01%',
    up: true,
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    pair: 'SOL/USDT',
    color: '#9945FF',
    price: '₹13,240',
    volume: '$12M',
    volumeUsd: 12_000_000,
    change: '+4.10%',
    up: true,
  },
];
