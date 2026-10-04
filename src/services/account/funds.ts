import {
  BANK_NAMES,
  COUPON_REWARDS,
  INR_DEPOSIT_METHODS,
  INR_MAX_WITHDRAWAL,
  INR_MIN_DEPOSIT,
  INR_MIN_WITHDRAWAL,
  INR_WITHDRAWAL_FEE,
  MAX_BANK_ACCOUNTS,
  SETTLEMENT_MS,
} from '../../constants/funds';
import { MARKET_COINS } from '../../constants/markets';
import { findNetwork, validateAddress } from '../../constants/networks';
import { formatInr, formatQuantity } from '../../utils/format';
import { getQuotes } from '../market';
import { notify } from '../notifications';
import { isWhitelisted, securityStore, verifySecondFactor } from '../security';
import { userStore } from '../user';
import {
  accountStore,
  adjustHolding,
  EPSILON,
  fail,
  getAvailableInr,
  getAvailableMargin,
  getAvailableQuantity,
  newId,
  succeed,
} from './store';
import type { AccountState, BankAccount, Result, Transaction } from './types';

function kycError(): string | undefined {
  return userStore.get().kyc.status === 'verified'
    ? undefined
    : 'Complete KYC verification to move funds.';
}

function randomDigits(length: number): string {
  let digits = '';
  while (digits.length < length) {
    digits += Math.floor(Math.random() * 10);
  }
  return digits;
}

function randomHash(): string {
  let hash = '0x';
  while (hash.length < 66) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  return hash;
}

export function maskAccountNumber(accountNumber: string): string {
  return '••••' + accountNumber.slice(-4);
}

function symbolOf(asset: string): string {
  return asset === 'inr'
    ? 'INR'
    : MARKET_COINS.find(coin => coin.id === asset)?.symbol ?? asset;
}

function formatAmount(asset: string, amount: number): string {
  return asset === 'inr'
    ? formatInr(amount, 'full')
    : formatQuantity(amount, symbolOf(asset));
}

function addTransaction(
  account: AccountState,
  transaction: Transaction,
): AccountState {
  return {
    ...account,
    transactions: [transaction, ...account.transactions],
  };
}

let settlementTimer: ReturnType<typeof setTimeout> | undefined;

/** Completes every pending deposit and withdrawal that is due. */
export function settleDueTransactions(now = Date.now()) {
  let account = accountStore.get();
  const settled: Transaction[] = [];

  for (const transaction of account.transactions) {
    if (
      transaction.status !== 'pending' ||
      transaction.createdAt + SETTLEMENT_MS > now
    ) {
      continue;
    }
    if (transaction.kind === 'deposit') {
      const net = transaction.amount - transaction.fee;
      account =
        transaction.asset === 'inr'
          ? { ...account, inrBalance: account.inrBalance + net }
          : adjustHolding(
              account,
              transaction.asset,
              net,
              getQuotes()[transaction.asset]?.price ?? 0,
            );
    }
    const completed: Transaction = {
      ...transaction,
      status: 'completed',
      completedAt: now,
    };
    account = {
      ...account,
      transactions: account.transactions.map(item =>
        item.id === transaction.id ? completed : item,
      ),
    };
    settled.push(transaction);
  }

  if (settled.length === 0) {
    return;
  }
  accountStore.set(account);
  settled.forEach(transaction => {
    const net = formatAmount(
      transaction.asset,
      transaction.amount - transaction.fee,
    );
    notify(
      'funds',
      transaction.kind === 'deposit' ? 'Deposit credited' : 'Withdrawal sent',
      transaction.kind === 'deposit'
        ? net + ' was added to your wallet.'
        : net + ' was sent to ' + (transaction.destination ?? 'you') + '.',
    );
  });
}

/** Keeps one timer running for the next pending transaction. */
export function scheduleSettlement() {
  if (settlementTimer) {
    clearTimeout(settlementTimer);
    settlementTimer = undefined;
  }
  const pending = accountStore
    .get()
    .transactions.filter(transaction => transaction.status === 'pending');
  if (pending.length === 0) {
    return;
  }
  const due =
    Math.min(...pending.map(transaction => transaction.createdAt)) +
    SETTLEMENT_MS -
    Date.now();
  settlementTimer = setTimeout(() => {
    settlementTimer = undefined;
    settleDueTransactions();
    scheduleSettlement();
  }, Math.max(0, due));
}

function recordPending(transaction: Transaction, account: AccountState) {
  accountStore.set(addTransaction(account, transaction));
  scheduleSettlement();
  return succeed(transaction);
}

export function depositInr(
  amount: number,
  methodId: string,
): Result<Transaction> {
  const blocked = kycError();
  if (blocked) {
    return fail(blocked);
  }
  const method = INR_DEPOSIT_METHODS.find(item => item.id === methodId);
  if (!method) {
    return fail('Choose a payment method.');
  }
  if (!Number.isFinite(amount) || amount < INR_MIN_DEPOSIT) {
    return fail('Minimum deposit is ' + formatInr(INR_MIN_DEPOSIT) + '.');
  }
  if (amount > method.max) {
    return fail(method.title + ' allows up to ' + formatInr(method.max) + '.');
  }
  const account = accountStore.get();
  const bank = account.bankAccounts.find(item => item.primary);
  if (!bank) {
    return fail('Add a bank account first.');
  }
  return recordPending(
    {
      id: newId(),
      kind: 'deposit',
      asset: 'inr',
      amount,
      fee: 0,
      status: 'pending',
      method: method.id,
      destination: bank.bankName + ' ' + maskAccountNumber(bank.accountNumber),
      reference: method.id + randomDigits(12),
      createdAt: Date.now(),
    },
    account,
  );
}

export function withdrawInr(
  amount: number,
  bankId: string,
): Result<Transaction> {
  const blocked = kycError();
  if (blocked) {
    return fail(blocked);
  }
  const account = accountStore.get();
  const bank = account.bankAccounts.find(item => item.id === bankId);
  if (!bank) {
    return fail('Choose a bank account.');
  }
  if (!Number.isFinite(amount) || amount < INR_MIN_WITHDRAWAL) {
    return fail('Minimum withdrawal is ' + formatInr(INR_MIN_WITHDRAWAL) + '.');
  }
  if (amount > INR_MAX_WITHDRAWAL) {
    return fail('Maximum withdrawal is ' + formatInr(INR_MAX_WITHDRAWAL) + '.');
  }
  if (amount > getAvailableInr(account) + EPSILON) {
    return fail('Insufficient INR balance.');
  }
  return recordPending(
    {
      id: newId(),
      kind: 'withdrawal',
      asset: 'inr',
      amount,
      fee: INR_WITHDRAWAL_FEE,
      status: 'pending',
      method: 'IMPS',
      destination: bank.bankName + ' ' + maskAccountNumber(bank.accountNumber),
      reference: 'IMPS' + randomDigits(12),
      createdAt: Date.now(),
    },
    { ...account, inrBalance: account.inrBalance - amount },
  );
}

export interface CryptoWithdrawalInput {
  coinId: string;
  networkId: string;
  address: string;
  amount: number;
  /** Authenticator or backup code; required while 2FA is on. */
  code?: string;
}

export function withdrawCrypto(
  input: CryptoWithdrawalInput,
): Result<Transaction> {
  const blocked = kycError();
  if (blocked) {
    return fail(blocked);
  }
  const network = findNetwork(input.coinId, input.networkId);
  if (!network) {
    return fail('Choose a network.');
  }
  const address = input.address.trim();
  const invalid = validateAddress(network, address);
  if (invalid) {
    return fail(invalid);
  }
  const security = securityStore.get();
  if (security.whitelistEnabled && !isWhitelisted(network.id, address)) {
    return fail('Whitelist is on: add this address to your whitelist first.');
  }
  const symbol = symbolOf(input.coinId);
  if (!Number.isFinite(input.amount) || input.amount < network.minWithdrawal) {
    return fail(
      'Minimum withdrawal is ' +
        formatQuantity(network.minWithdrawal, symbol) +
        '.',
    );
  }
  const account = accountStore.get();
  if (input.amount > getAvailableQuantity(account, input.coinId) + EPSILON) {
    return fail('Insufficient ' + symbol + ' balance.');
  }
  if (security.twoFactor.enabled && !verifySecondFactor(input.code ?? '')) {
    return fail('Enter a valid Google Authenticator code.');
  }
  return recordPending(
    {
      id: newId(),
      kind: 'withdrawal',
      asset: input.coinId,
      amount: input.amount,
      fee: network.fee,
      status: 'pending',
      method: network.id,
      destination: address,
      reference: randomHash(),
      createdAt: Date.now(),
    },
    adjustHolding(account, input.coinId, -input.amount),
  );
}

/**
 * Stands in for coins arriving on-chain at the deposit address, so the
 * deposit flow can be tried without a real wallet.
 */
export function simulateCryptoDeposit(
  coinId: string,
  networkId: string,
  amount: number,
): Result<Transaction> {
  const blocked = kycError();
  if (blocked) {
    return fail(blocked);
  }
  const network = findNetwork(coinId, networkId);
  if (!network) {
    return fail('Choose a network.');
  }
  if (!Number.isFinite(amount) || amount < network.minDeposit) {
    return fail(
      'Minimum deposit is ' +
        formatQuantity(network.minDeposit, symbolOf(coinId)) +
        '.',
    );
  }
  return recordPending(
    {
      id: newId(),
      kind: 'deposit',
      asset: coinId,
      amount,
      fee: 0,
      status: 'pending',
      method: network.id,
      reference: randomHash(),
      createdAt: Date.now(),
    },
    accountStore.get(),
  );
}

export type TransferDirection = 'toFutures' | 'toSpot';

/** Moves USDT between the spot and futures wallets, instantly. */
export function transferUsdt(
  direction: TransferDirection,
  amount: number,
): Result<Transaction> {
  if (!Number.isFinite(amount) || amount <= 0) {
    return fail('Enter an amount greater than zero.');
  }
  let account = accountStore.get();
  const available =
    direction === 'toFutures'
      ? getAvailableQuantity(account, 'usdt')
      : getAvailableMargin(account);
  if (amount > available + EPSILON) {
    return fail('Insufficient USDT balance.');
  }

  if (direction === 'toFutures') {
    account = adjustHolding(account, 'usdt', -amount);
    account = {
      ...account,
      futures: {
        ...account.futures,
        balance: account.futures.balance + amount,
      },
    };
  } else {
    account = adjustHolding(
      account,
      'usdt',
      amount,
      getQuotes().usdt?.price ?? 0,
    );
    account = {
      ...account,
      futures: {
        ...account.futures,
        balance: account.futures.balance - amount,
      },
    };
  }

  const now = Date.now();
  const transaction: Transaction = {
    id: newId(),
    kind: 'transfer',
    asset: 'usdt',
    amount,
    fee: 0,
    status: 'completed',
    method: direction === 'toFutures' ? 'Spot → Futures' : 'Futures → Spot',
    reference: 'TRF' + randomDigits(10),
    createdAt: now,
    completedAt: now,
  };
  accountStore.set(addTransaction(account, transaction));
  return succeed(transaction);
}

export interface BankAccountInput {
  holderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifsc: string;
}

export function validateIfsc(ifsc: string): string | undefined {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)
    ? undefined
    : 'IFSC is 11 characters, like HDFC0001234.';
}

export function addBankAccount(input: BankAccountInput): Result<BankAccount> {
  const holderName = input.holderName.trim();
  const accountNumber = input.accountNumber.trim();
  const ifsc = input.ifsc.trim().toUpperCase();
  if (!/^[A-Za-z][A-Za-z .']{2,}$/.test(holderName)) {
    return fail('Enter the account holder name as on the bank record.');
  }
  if (!/^\d{9,18}$/.test(accountNumber)) {
    return fail('Account number is 9 to 18 digits.');
  }
  if (accountNumber !== input.confirmAccountNumber.trim()) {
    return fail('Account numbers do not match.');
  }
  const invalidIfsc = validateIfsc(ifsc);
  if (invalidIfsc) {
    return fail(invalidIfsc);
  }
  const account = accountStore.get();
  if (account.bankAccounts.length >= MAX_BANK_ACCOUNTS) {
    return fail('You can link up to ' + MAX_BANK_ACCOUNTS + ' bank accounts.');
  }
  if (account.bankAccounts.some(item => item.accountNumber === accountNumber)) {
    return fail('This bank account is already linked.');
  }
  const prefix = ifsc.slice(0, 4);
  const bank: BankAccount = {
    id: newId(),
    bankName: BANK_NAMES[prefix] ?? prefix + ' Bank',
    holderName,
    accountNumber,
    ifsc,
    primary: account.bankAccounts.length === 0,
  };
  accountStore.set({
    ...account,
    bankAccounts: [...account.bankAccounts, bank],
  });
  return succeed(bank);
}

export function setPrimaryBankAccount(id: string) {
  accountStore.update(account => ({
    ...account,
    bankAccounts: account.bankAccounts.map(bank => ({
      ...bank,
      primary: bank.id === id,
    })),
  }));
}

export function removeBankAccount(id: string) {
  accountStore.update(account => {
    const remaining = account.bankAccounts.filter(bank => bank.id !== id);
    const hasPrimary = remaining.some(bank => bank.primary);
    return {
      ...account,
      bankAccounts: remaining.map((bank, index) =>
        hasPrimary || index > 0 ? bank : { ...bank, primary: true },
      ),
    };
  });
}

/** Credits a promo code's INR bonus, once per code. */
export function redeemCoupon(code: string): Result<number> {
  const clean = code.trim().toUpperCase();
  const reward = COUPON_REWARDS[clean];
  if (reward === undefined) {
    return fail('This coupon code is not valid.');
  }
  const account = accountStore.get();
  if (account.redeemedCoupons.includes(clean)) {
    return fail('You have already used this coupon.');
  }
  accountStore.set({
    ...account,
    inrBalance: account.inrBalance + reward,
    redeemedCoupons: [...account.redeemedCoupons, clean],
  });
  notify(
    'funds',
    'Coupon applied',
    formatInr(reward) + ' bonus from ' + clean + ' is in your wallet.',
  );
  return succeed(reward);
}
