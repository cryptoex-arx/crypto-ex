import { MARKET_COINS } from '../../constants/markets';
import { formatUsdt } from '../../utils/format';
import { getQuotes, type QuoteMap } from '../market';
import {
  accountStore,
  EPSILON,
  fail,
  getAvailableMargin,
  newId,
  succeed,
} from './store';
import type {
  AccountState,
  ClosedPosition,
  CloseReason,
  FuturesOrder,
  Position,
  PositionSide,
  Result,
} from './types';

/** Taker fee on futures notional. */
export const FUTURES_FEE_RATE = 0.0005;
/** Margin share kept back before liquidation. */
export const MAINTENANCE_MARGIN = 0.005;
export const MAX_LEVERAGE = 50;
/** Smallest margin per order, in USDT. */
export const MIN_MARGIN = 5;

/** Every listed coin except stablecoins has a USDT perpetual. */
export const FUTURES_COINS = MARKET_COINS.filter(coin => !coin.stable);

/** Perpetual mark price in USDT, derived from the INR feed. */
export function getMarkPrice(
  coinId: string,
  quotes: QuoteMap = getQuotes(),
): number | undefined {
  const inr = quotes[coinId]?.price;
  const usdt = quotes.usdt?.price;
  return inr !== undefined && usdt ? inr / usdt : undefined;
}

export function liquidationPrice(
  side: PositionSide,
  entryPrice: number,
  leverage: number,
): number {
  return side === 'long'
    ? entryPrice * (1 - 1 / leverage + MAINTENANCE_MARGIN)
    : entryPrice * (1 + 1 / leverage - MAINTENANCE_MARGIN);
}

export function unrealizedPnl(position: Position, markPrice: number): number {
  const direction = position.side === 'long' ? 1 : -1;
  return (markPrice - position.entryPrice) * position.quantity * direction;
}

/** Return on margin, in percent. */
export function returnOnEquity(position: Position, markPrice: number): number {
  return (unrealizedPnl(position, markPrice) / position.margin) * 100;
}

export interface FuturesOrderInput {
  coinId: string;
  side: PositionSide;
  type: 'market' | 'limit';
  leverage: number;
  /** USDT margin. */
  margin: number;
  /** USDT limit price; limit orders only. */
  price?: number;
  takeProfit?: number;
  stopLoss?: number;
}

/** Checks TP/SL sit on the right side of the entry and before liquidation. */
export function validateTargets(
  side: PositionSide,
  entryPrice: number,
  leverage: number,
  takeProfit?: number,
  stopLoss?: number,
): string | undefined {
  const long = side === 'long';
  if (takeProfit !== undefined) {
    if (!(takeProfit > 0)) {
      return 'Take profit must be greater than zero.';
    }
    if (long ? takeProfit <= entryPrice : takeProfit >= entryPrice) {
      return long
        ? 'Take profit must be above the entry price.'
        : 'Take profit must be below the entry price.';
    }
  }
  if (stopLoss !== undefined) {
    if (!(stopLoss > 0)) {
      return 'Stop loss must be greater than zero.';
    }
    if (long ? stopLoss >= entryPrice : stopLoss <= entryPrice) {
      return long
        ? 'Stop loss must be below the entry price.'
        : 'Stop loss must be above the entry price.';
    }
    const liquidation = liquidationPrice(side, entryPrice, leverage);
    if (long ? stopLoss <= liquidation : stopLoss >= liquidation) {
      return (
        'Stop loss is past the liquidation price (' +
        formatUsdt(liquidation) +
        ').'
      );
    }
  }
  return undefined;
}

function openPosition(
  account: AccountState,
  order: Omit<FuturesOrder, 'status' | 'price' | 'createdAt'>,
  price: number,
  now: number,
): { account: AccountState; position: Position } {
  const quantity = (order.margin * order.leverage) / price;
  const openFee = order.margin * order.leverage * FUTURES_FEE_RATE;
  const position: Position = {
    id: order.id,
    coinId: order.coinId,
    side: order.side,
    leverage: order.leverage,
    quantity,
    entryPrice: price,
    margin: order.margin,
    takeProfit: order.takeProfit,
    stopLoss: order.stopLoss,
    openFee,
    openedAt: now,
  };
  return {
    position,
    account: {
      ...account,
      futures: {
        ...account.futures,
        balance: account.futures.balance - openFee,
        positions: [position, ...account.futures.positions],
      },
    },
  };
}

function closeAt(
  account: AccountState,
  position: Position,
  exitPrice: number,
  reason: CloseReason,
  now: number,
): { account: AccountState; closed: ClosedPosition } {
  const liquidated = reason === 'liquidation';
  const pnl = liquidated
    ? -position.margin
    : Math.max(-position.margin, unrealizedPnl(position, exitPrice));
  const closeFee = liquidated
    ? 0
    : exitPrice * position.quantity * FUTURES_FEE_RATE;
  const closed: ClosedPosition = {
    ...position,
    exitPrice,
    pnl,
    closeFee,
    reason,
    closedAt: now,
  };
  return {
    closed,
    account: {
      ...account,
      futures: {
        ...account.futures,
        balance: account.futures.balance + pnl - closeFee,
        positions: account.futures.positions.filter(
          item => item.id !== position.id,
        ),
        history: [closed, ...account.futures.history],
      },
    },
  };
}

export function placeFuturesOrder(
  input: FuturesOrderInput,
): Result<{ position?: Position; order?: FuturesOrder }> {
  if (!FUTURES_COINS.some(coin => coin.id === input.coinId)) {
    return fail('This contract is not available.');
  }
  const mark = getMarkPrice(input.coinId);
  if (mark === undefined) {
    return fail('No price for this contract yet.');
  }
  if (
    !Number.isInteger(input.leverage) ||
    input.leverage < 1 ||
    input.leverage > MAX_LEVERAGE
  ) {
    return fail('Leverage must be between 1x and ' + MAX_LEVERAGE + 'x.');
  }
  if (!Number.isFinite(input.margin) || input.margin < MIN_MARGIN) {
    return fail('Minimum margin is ' + formatUsdt(MIN_MARGIN) + '.');
  }
  if (
    input.type === 'limit' &&
    !(input.price !== undefined && input.price > 0)
  ) {
    return fail('Enter a limit price greater than zero.');
  }

  const entry = input.type === 'limit' ? input.price! : mark;
  const invalidTargets = validateTargets(
    input.side,
    entry,
    input.leverage,
    input.takeProfit,
    input.stopLoss,
  );
  if (invalidTargets) {
    return fail(invalidTargets);
  }

  const account = accountStore.get();
  const fee = input.margin * input.leverage * FUTURES_FEE_RATE;
  if (input.margin + fee > getAvailableMargin(account) + EPSILON) {
    return fail('Insufficient futures balance. Transfer USDT from spot.');
  }

  const now = Date.now();
  const base = {
    id: newId(),
    coinId: input.coinId,
    side: input.side,
    leverage: input.leverage,
    margin: input.margin,
    takeProfit: input.takeProfit,
    stopLoss: input.stopLoss,
  };
  const crosses =
    input.type === 'market' ||
    (input.side === 'long' ? mark <= entry : mark >= entry);

  if (crosses) {
    const opened = openPosition(account, base, mark, now);
    accountStore.set(opened.account);
    return succeed({ position: opened.position });
  }

  const order: FuturesOrder = {
    ...base,
    price: entry,
    status: 'open',
    createdAt: now,
  };
  accountStore.set({
    ...account,
    futures: {
      ...account.futures,
      orders: [order, ...account.futures.orders],
    },
  });
  return succeed({ order });
}

/** Closes a position at the live mark price. */
export function closePosition(positionId: string): Result<ClosedPosition> {
  const account = accountStore.get();
  const position = account.futures.positions.find(
    item => item.id === positionId,
  );
  const mark = position ? getMarkPrice(position.coinId) : undefined;
  if (!position || mark === undefined) {
    return fail('This position is already closed.');
  }
  const result = closeAt(account, position, mark, 'manual', Date.now());
  accountStore.set(result.account);
  return succeed(result.closed);
}

export function cancelFuturesOrder(orderId: string): boolean {
  const account = accountStore.get();
  const order = account.futures.orders.find(item => item.id === orderId);
  if (!order || order.status !== 'open') {
    return false;
  }
  accountStore.set({
    ...account,
    futures: {
      ...account.futures,
      orders: account.futures.orders.map(item =>
        item.id === orderId
          ? { ...item, status: 'cancelled', closedAt: Date.now() }
          : item,
      ),
    },
  });
  return true;
}

export interface FuturesEvent {
  title: string;
  body: string;
}

const REASON_TITLES: Record<Exclude<CloseReason, 'manual'>, string> = {
  takeProfit: 'Take profit hit',
  stopLoss: 'Stop loss hit',
  liquidation: 'Position liquidated',
};

function symbolOf(coinId: string): string {
  return MARKET_COINS.find(coin => coin.id === coinId)?.symbol ?? coinId;
}

/**
 * Fills resting futures orders and closes positions whose liquidation, take
 * profit or stop loss the latest tick has reached.
 */
export function matchFutures(
  account: AccountState,
  quotes: QuoteMap,
  now: number,
): { account: AccountState; events: FuturesEvent[] } {
  let next = account;
  const events: FuturesEvent[] = [];

  for (const order of account.futures.orders) {
    const mark = getMarkPrice(order.coinId, quotes);
    if (order.status !== 'open' || mark === undefined) {
      continue;
    }
    const reached =
      order.side === 'long' ? mark <= order.price : mark >= order.price;
    if (!reached) {
      continue;
    }
    next = {
      ...next,
      futures: {
        ...next.futures,
        orders: next.futures.orders.map(item =>
          item.id === order.id
            ? { ...item, status: 'filled', closedAt: now }
            : item,
        ),
      },
    };
    next = openPosition(
      next,
      { ...order, id: newId() },
      order.price,
      now,
    ).account;
    events.push({
      title: 'Futures order filled',
      body:
        symbolOf(order.coinId) +
        ' ' +
        order.side +
        ' ' +
        order.leverage +
        'x opened at ' +
        formatUsdt(order.price) +
        '.',
    });
  }

  for (const position of account.futures.positions) {
    const mark = getMarkPrice(position.coinId, quotes);
    if (mark === undefined) {
      continue;
    }
    const long = position.side === 'long';
    const liquidation = liquidationPrice(
      position.side,
      position.entryPrice,
      position.leverage,
    );
    let exit: { price: number; reason: CloseReason } | undefined;
    if (long ? mark <= liquidation : mark >= liquidation) {
      exit = { price: liquidation, reason: 'liquidation' };
    } else if (
      position.stopLoss !== undefined &&
      (long ? mark <= position.stopLoss : mark >= position.stopLoss)
    ) {
      exit = { price: position.stopLoss, reason: 'stopLoss' };
    } else if (
      position.takeProfit !== undefined &&
      (long ? mark >= position.takeProfit : mark <= position.takeProfit)
    ) {
      exit = { price: position.takeProfit, reason: 'takeProfit' };
    }
    if (!exit) {
      continue;
    }
    const result = closeAt(next, position, exit.price, exit.reason, now);
    next = result.account;
    events.push({
      title: REASON_TITLES[exit.reason as Exclude<CloseReason, 'manual'>],
      body:
        symbolOf(position.coinId) +
        ' ' +
        position.side +
        ' closed at ' +
        formatUsdt(exit.price) +
        ', P&L ' +
        formatUsdt(result.closed.pnl - result.closed.closeFee) +
        '.',
    });
  }

  return { account: next, events };
}

export function hasFuturesActivity(account: AccountState): boolean {
  return (
    account.futures.positions.length > 0 ||
    account.futures.orders.some(order => order.status === 'open')
  );
}
