export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stopLimit';
export type OrderStatus = 'open' | 'filled' | 'cancelled';

export interface SpotOrder {
  id: string;
  coinId: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  /** INR. The limit price while open, the execution price once filled. */
  price: number;
  /** Stop-limit only: the INR price that activates the limit order. */
  stopPrice?: number;
  /** Stop-limit only: set once the feed has reached `stopPrice`. */
  triggered?: boolean;
  /** INR fee charged on fill; 0 until then. */
  fee: number;
  status: OrderStatus;
  createdAt: number;
  /** When it filled or was cancelled. */
  closedAt?: number;
}

export interface Holding {
  quantity: number;
  /** Average INR buy price, fees excluded. */
  avgPrice: number;
}

export type TransactionKind = 'deposit' | 'withdrawal' | 'transfer';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  kind: TransactionKind;
  /** `inr` or a coin id. */
  asset: string;
  /** Gross amount, in the asset's units. */
  amount: number;
  /** Fee, in the asset's units, taken out of `amount`. */
  fee: number;
  status: TransactionStatus;
  /** Rail or network, e.g. `UPI`, `TRC20`, `Spot → Futures`. */
  method: string;
  /** Masked bank account or the wallet address. */
  destination?: string;
  /** UTR or transaction hash. */
  reference: string;
  createdAt: number;
  completedAt?: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  holderName: string;
  accountNumber: string;
  ifsc: string;
  primary: boolean;
}

export type PositionSide = 'long' | 'short';

export interface FuturesOrder {
  id: string;
  coinId: string;
  side: PositionSide;
  leverage: number;
  /** USDT locked as margin. */
  margin: number;
  /** USDT limit price. */
  price: number;
  takeProfit?: number;
  stopLoss?: number;
  status: OrderStatus;
  createdAt: number;
  closedAt?: number;
}

export interface Position {
  id: string;
  coinId: string;
  side: PositionSide;
  leverage: number;
  /** Contract size in coin units. */
  quantity: number;
  /** USDT. */
  entryPrice: number;
  /** USDT locked as margin. */
  margin: number;
  takeProfit?: number;
  stopLoss?: number;
  /** USDT fee paid to open. */
  openFee: number;
  openedAt: number;
}

export type CloseReason = 'manual' | 'takeProfit' | 'stopLoss' | 'liquidation';

export interface ClosedPosition extends Position {
  exitPrice: number;
  /** Realised USDT P&L before fees. */
  pnl: number;
  closeFee: number;
  reason: CloseReason;
  closedAt: number;
}

export interface FuturesAccount {
  /** USDT wallet, margin of open positions and orders included. */
  balance: number;
  positions: readonly Position[];
  /** Newest first. */
  orders: readonly FuturesOrder[];
  /** Newest first. */
  history: readonly ClosedPosition[];
}

export interface Stake {
  id: string;
  productId: string;
  coinId: string;
  quantity: number;
  /** Percent a year. */
  apy: number;
  /** 0 for flexible. */
  lockDays: number;
  startedAt: number;
}

export type SipFrequency = 'daily' | 'weekly' | 'monthly';

export interface SipPlan {
  id: string;
  coinId: string;
  /** INR per instalment, fee included. */
  amount: number;
  frequency: SipFrequency;
  status: 'active' | 'paused';
  nextRunAt: number;
  createdAt: number;
  instalments: number;
  /** INR spent so far. */
  invested: number;
}

export interface AccountState {
  /** Total INR, including what open buy orders have locked. */
  inrBalance: number;
  /** Keyed by coin id. Includes what open sells and stakes have locked. */
  holdings: Readonly<Record<string, Holding>>;
  /** Newest first. */
  orders: readonly SpotOrder[];
  favourites: readonly string[];
  /** Newest first. */
  transactions: readonly Transaction[];
  bankAccounts: readonly BankAccount[];
  futures: FuturesAccount;
  stakes: readonly Stake[];
  sipPlans: readonly SipPlan[];
  redeemedCoupons: readonly string[];
}

export type Result<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; error: string };
