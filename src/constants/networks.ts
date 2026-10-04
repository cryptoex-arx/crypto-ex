import { sha1, utf8 } from '../utils/hash';

const ALPHABETS = {
  hex: '0123456789abcdef',
  base58: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  bech32: 'qpzry9x8gf2tvdw0s3jn54khce6mua7l',
} as const;

export interface Network {
  /** Short code shown on chips, e.g. `TRC20`. */
  id: string;
  name: string;
  /** Address format: fixed prefix, then characters from one alphabet. */
  prefix: string;
  alphabet: keyof typeof ALPHABETS;
  /** Allowed length after the prefix. */
  length: readonly [number, number];
  /** Withdrawal fee, in coin units, taken out of the amount. */
  fee: number;
  minWithdrawal: number;
  minDeposit: number;
  confirmations: number;
  /** Deposits also need a memo / tag. */
  memo?: boolean;
}

function evm(id: string, name: string, fee: number, min: number): Network {
  return {
    id,
    name,
    prefix: '0x',
    alphabet: 'hex',
    length: [40, 40],
    fee,
    minWithdrawal: min,
    minDeposit: min / 5,
    confirmations: 12,
  };
}

function tron(fee: number, min: number): Network {
  return {
    id: 'TRC20',
    name: 'Tron (TRC20)',
    prefix: 'T',
    alphabet: 'base58',
    length: [33, 33],
    fee,
    minWithdrawal: min,
    minDeposit: 1,
    confirmations: 20,
  };
}

/**
 * Deposit and withdrawal networks per coin, with the fees from the Fee
 * Structure screen. Replace with the wallet API's network list.
 */
export const NETWORKS: Readonly<Record<string, readonly Network[]>> = {
  btc: [
    {
      id: 'BTC',
      name: 'Bitcoin',
      prefix: 'bc1q',
      alphabet: 'bech32',
      length: [38, 58],
      fee: 0.0004,
      minWithdrawal: 0.001,
      minDeposit: 0.0001,
      confirmations: 2,
    },
  ],
  eth: [
    evm('ERC20', 'Ethereum (ERC20)', 0.0021, 0.005),
    evm('BEP20', 'BNB Smart Chain (BEP20)', 0.0003, 0.002),
  ],
  usdt: [
    tron(1, 10),
    evm('ERC20', 'Ethereum (ERC20)', 5, 20),
    evm('BEP20', 'BNB Smart Chain (BEP20)', 0.5, 10),
  ],
  sol: [
    {
      id: 'SOL',
      name: 'Solana',
      prefix: '',
      alphabet: 'base58',
      length: [43, 44],
      fee: 0.01,
      minWithdrawal: 0.1,
      minDeposit: 0.01,
      confirmations: 1,
    },
  ],
  trx: [tron(1, 10)],
  doge: [
    {
      id: 'DOGE',
      name: 'Dogecoin',
      prefix: 'D',
      alphabet: 'base58',
      length: [33, 33],
      fee: 5,
      minWithdrawal: 20,
      minDeposit: 5,
      confirmations: 6,
    },
  ],
  ada: [
    {
      id: 'ADA',
      name: 'Cardano',
      prefix: 'addr1',
      alphabet: 'bech32',
      length: [98, 98],
      fee: 1,
      minWithdrawal: 10,
      minDeposit: 1,
      confirmations: 15,
    },
  ],
  dot: [
    {
      id: 'DOT',
      name: 'Polkadot',
      prefix: '1',
      alphabet: 'base58',
      length: [46, 47],
      fee: 0.1,
      minWithdrawal: 2,
      minDeposit: 0.5,
      confirmations: 1,
    },
  ],
  arb: [evm('ARBITRUM', 'Arbitrum One', 0.5, 2)],
  inj: [
    {
      id: 'INJ',
      name: 'Injective',
      prefix: 'inj1',
      alphabet: 'bech32',
      length: [38, 38],
      fee: 0.01,
      minWithdrawal: 0.1,
      minDeposit: 0.01,
      confirmations: 1,
    },
  ],
  atom: [
    {
      id: 'ATOM',
      name: 'Cosmos Hub',
      prefix: 'cosmos1',
      alphabet: 'bech32',
      length: [38, 38],
      fee: 0.005,
      minWithdrawal: 0.1,
      minDeposit: 0.01,
      confirmations: 1,
      memo: true,
    },
  ],
};

export function findNetwork(
  coinId: string,
  networkId: string,
): Network | undefined {
  return NETWORKS[coinId]?.find(network => network.id === networkId);
}

/** Error message for a malformed address, or `undefined` if it looks right. */
export function validateAddress(
  network: Network,
  address: string,
): string | undefined {
  const [min, max] = network.length;
  const body = network.alphabet === 'hex' ? address.toLowerCase() : address;
  const valid =
    body.startsWith(network.prefix) &&
    body.length - network.prefix.length >= min &&
    body.length - network.prefix.length <= max &&
    [...body.slice(network.prefix.length)].every(char =>
      ALPHABETS[network.alphabet].includes(char),
    );
  return valid
    ? undefined
    : 'This is not a valid ' + network.name + ' address.';
}

/** Deterministic bytes for a seed string, as long as needed. */
function seededBytes(seed: string, length: number): number[] {
  const bytes: number[] = [];
  let round = 0;
  while (bytes.length < length) {
    bytes.push(...sha1(utf8(seed + ':' + round)));
    round += 1;
  }
  return bytes.slice(0, length);
}

/** The account's deposit address on a network. Stable across launches. */
export function depositAddress(coinId: string, network: Network): string {
  const alphabet = ALPHABETS[network.alphabet];
  const length = network.length[1];
  const body = seededBytes('cryptoex:' + coinId + ':' + network.id, length)
    .map(byte => alphabet[byte % alphabet.length])
    .join('');
  return network.prefix + body;
}

/** Memo / tag to send with deposits on networks that need one. */
export function depositMemo(coinId: string, network: Network): string {
  const bytes = seededBytes('cryptoex-memo:' + coinId + network.id, 4);
  return String(bytes[0] * 65_536 + bytes[1] * 256 + bytes[2] + 100_000_000);
}
