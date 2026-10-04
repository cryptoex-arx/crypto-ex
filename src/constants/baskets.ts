/** Curated coin baskets. Weights in each basket add up to 1. */
export interface Basket {
  id: string;
  name: string;
  description: string;
  /** INR. */
  minInvestment: number;
  components: readonly { coinId: string; weight: number }[];
}

export const BASKETS: readonly Basket[] = [
  {
    id: 'layer-1-leaders',
    name: 'Layer 1 Leaders',
    description: 'The largest smart-contract and settlement chains.',
    minInvestment: 1000,
    components: [
      { coinId: 'btc', weight: 0.35 },
      { coinId: 'eth', weight: 0.3 },
      { coinId: 'sol', weight: 0.15 },
      { coinId: 'ada', weight: 0.1 },
      { coinId: 'dot', weight: 0.1 },
    ],
  },
  {
    id: 'interoperability',
    name: 'Interoperability',
    description: 'Chains and layer 2s that connect other chains.',
    minInvestment: 500,
    components: [
      { coinId: 'dot', weight: 0.3 },
      { coinId: 'atom', weight: 0.3 },
      { coinId: 'inj', weight: 0.2 },
      { coinId: 'arb', weight: 0.2 },
    ],
  },
  {
    id: 'blue-chip',
    name: 'Blue Chip Duo',
    description: 'Bitcoin and Ethereum, weighted by market size.',
    minInvestment: 500,
    components: [
      { coinId: 'btc', weight: 0.6 },
      { coinId: 'eth', weight: 0.4 },
    ],
  },
  {
    id: 'community',
    name: 'Community Coins',
    description: 'Coins with the largest retail communities.',
    minInvestment: 500,
    components: [
      { coinId: 'doge', weight: 0.5 },
      { coinId: 'trx', weight: 0.5 },
    ],
  },
];
