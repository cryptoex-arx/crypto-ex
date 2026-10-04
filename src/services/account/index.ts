import { scheduleSettlement, settleDueTransactions } from './funds';
import { syncMatcher } from './matcher';
import { runDueSips } from './sip';
import { accountStore } from './store';

export { basketChange, investInBasket } from './baskets';
export {
  redeemStake,
  stakeMaturesAt,
  stakeReward,
  subscribeEarn,
} from './earn';
export type {
  BankAccountInput,
  CryptoWithdrawalInput,
  TransferDirection,
} from './funds';
export {
  addBankAccount,
  depositInr,
  maskAccountNumber,
  redeemCoupon,
  removeBankAccount,
  setPrimaryBankAccount,
  simulateCryptoDeposit,
  transferUsdt,
  validateIfsc,
  withdrawCrypto,
  withdrawInr,
} from './funds';
export type { FuturesOrderInput } from './futures';
export {
  cancelFuturesOrder,
  closePosition,
  FUTURES_COINS,
  FUTURES_FEE_RATE,
  getMarkPrice,
  liquidationPrice,
  MAX_LEVERAGE,
  MIN_MARGIN,
  placeFuturesOrder,
  returnOnEquity,
  unrealizedPnl,
  validateTargets,
} from './futures';
export {
  createSip,
  deleteSip,
  nextRunAfter,
  pauseSip,
  resumeSip,
  runDueSips,
  SIP_FREQUENCIES,
  SIP_MIN_AMOUNT,
} from './sip';
export type { OrderInput } from './spot';
export { cancelOrder, placeOrder, toggleFavourite } from './spot';
export {
  accountStore,
  FEE_RATE,
  getAvailableInr,
  getAvailableMargin,
  getAvailableQuantity,
  getLockedQuantity,
  MIN_ORDER_INR,
} from './store';
export type {
  AccountState,
  BankAccount,
  ClosedPosition,
  CloseReason,
  FuturesAccount,
  FuturesOrder,
  Holding,
  OrderSide,
  OrderStatus,
  OrderType,
  Position,
  PositionSide,
  Result,
  SipFrequency,
  SipPlan,
  SpotOrder,
  Stake,
  Transaction,
  TransactionKind,
  TransactionStatus,
} from './types';

export const getAccount = accountStore.get;
export const subscribeToAccount = accountStore.subscribe;

/**
 * Restores the saved account, then catches up on what happened while the app
 * was closed: settles due transfers, buys due SIPs and resumes order matching.
 */
export async function hydrateAccount(): Promise<void> {
  await accountStore.hydrate();
  settleDueTransactions();
  scheduleSettlement();
  runDueSips();
  syncMatcher();
}
