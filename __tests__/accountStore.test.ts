type Account = typeof import('../src/services/account');
type Market = typeof import('../src/services/market');
type Storage =
  typeof import('@react-native-async-storage/async-storage').default;

let account: Account;
let market: Market;
let storage: Storage;

/** Fresh modules, storage included, so every test starts from the seed. */
beforeEach(() => {
  jest.useFakeTimers();
  jest.resetModules();
  storage = require('@react-native-async-storage/async-storage');
  account = require('../src/services/account');
  market = require('../src/services/market');
});
afterEach(() => jest.useRealTimers());

const btcPrice = () => market.getQuotes().btc.price;
const state = () => account.getAccount();

/** Pushes the random walk one way for `ticks` feed ticks. */
function drift(direction: 'down' | 'up', ticks: number) {
  const unsubscribe = market.subscribeToQuotes(() => undefined);
  const random = jest
    .spyOn(Math, 'random')
    .mockReturnValue(direction === 'down' ? 0 : 0.9999);
  jest.advanceTimersByTime(1500 * ticks);
  random.mockRestore();
  unsubscribe();
}

test('seed locks funds for its open orders', () => {
  // 0.005 BTC @ ₹70,43,000 plus the 0.2% fee.
  expect(account.getAvailableInr(state())).toBeCloseTo(
    50_000 - 0.005 * 7_043_000 * 1.002,
  );
  expect(account.getAvailableQuantity(state(), 'eth')).toBeCloseTo(0.25);
  expect(account.getAvailableQuantity(state(), 'doge')).toBe(0);
});

test('market buy fills at the live price and updates balance and average', () => {
  const before = state();
  const price = btcPrice();
  const result = account.placeOrder({
    coinId: 'btc',
    side: 'buy',
    type: 'market',
    quantity: 0.001,
  });

  expect(result.ok).toBe(true);
  const after = state();
  expect(after.orders[0]).toMatchObject({ status: 'filled', price });
  expect(after.orders[0].fee).toBeCloseTo(price * 0.001 * account.FEE_RATE);
  expect(after.inrBalance).toBeCloseTo(
    before.inrBalance - price * 0.001 * (1 + account.FEE_RATE),
  );
  expect(after.holdings.btc.quantity).toBeCloseTo(0.0152);
  expect(after.holdings.btc.avgPrice).toBeCloseTo(
    (0.0142 * 7_031_000 + 0.001 * price) / 0.0152,
  );
});

test('selling the whole holding removes it', () => {
  const result = account.placeOrder({
    coinId: 'sol',
    side: 'sell',
    type: 'market',
    quantity: 2.5,
  });
  expect(result.ok).toBe(true);
  expect(state().holdings.sol).toBeUndefined();
});

test('rejects invalid, too small and unaffordable orders', () => {
  const place = (input: Partial<Parameters<Account['placeOrder']>[0]>) =>
    account.placeOrder({
      coinId: 'btc',
      side: 'buy',
      type: 'market',
      quantity: 0.001,
      ...input,
    });

  expect(place({ coinId: 'nope' })).toMatchObject({ ok: false });
  expect(place({ quantity: 0 })).toMatchObject({ ok: false });
  expect(place({ type: 'limit', price: undefined })).toMatchObject({
    ok: false,
  });
  expect(place({ coinId: 'doge', quantity: 1 })).toEqual({
    ok: false,
    error: 'Minimum order value is ₹100.',
  });
  expect(place({ quantity: 1 })).toEqual({
    ok: false,
    error: 'Insufficient INR balance.',
  });
  // 0.25 ETH is free; 0.2 more is locked by the seeded sell order.
  expect(place({ coinId: 'eth', side: 'sell', quantity: 0.3 })).toEqual({
    ok: false,
    error: 'Insufficient coin balance.',
  });
  expect(state().orders).toHaveLength(5);
});

test('resting limit order locks funds, fills when the feed reaches it', () => {
  const limit = btcPrice() * 0.999;
  const result = account.placeOrder({
    coinId: 'btc',
    side: 'buy',
    type: 'limit',
    quantity: 0.001,
    price: limit,
  });
  expect(result).toMatchObject({ ok: true, value: { status: 'open' } });
  const id = result.ok ? result.value.id : '';

  drift('down', 5);

  const order = state().orders.find(item => item.id === id);
  expect(order).toMatchObject({ status: 'filled', price: limit });
});

test('a limit that already crosses fills at the better live price', () => {
  const price = btcPrice();
  const result = account.placeOrder({
    coinId: 'btc',
    side: 'buy',
    type: 'limit',
    quantity: 0.001,
    price: price * 1.05,
  });
  expect(result).toMatchObject({
    ok: true,
    value: { status: 'filled', price },
  });
});

test('stop-limit waits for its stop, then fills', () => {
  const price = btcPrice();
  expect(
    account.placeOrder({
      coinId: 'btc',
      side: 'buy',
      type: 'stopLimit',
      quantity: 0.001,
      stopPrice: price * 0.99,
      price: price,
    }),
  ).toEqual({ ok: false, error: 'A buy stop must be above the market price.' });

  const result = account.placeOrder({
    coinId: 'btc',
    side: 'buy',
    type: 'stopLimit',
    quantity: 0.001,
    stopPrice: price * 1.002,
    price: price * 1.01,
  });
  expect(result).toMatchObject({ ok: true, value: { triggered: false } });
  const id = result.ok ? result.value.id : '';

  drift('up', 3);
  expect(state().orders.find(item => item.id === id)?.status).toBe('filled');
});

test('cancel releases the lock and only works on open orders', () => {
  const available = account.getAvailableInr(state());

  expect(account.cancelOrder('seed-btc-buy')).toBe(true);
  expect(account.getAvailableInr(state())).toBeGreaterThan(available);
  expect(account.cancelOrder('seed-btc-buy')).toBe(false);
  expect(account.cancelOrder('seed-sol-buy')).toBe(false);
});

test('favourites toggle on and off', () => {
  account.toggleFavourite('sol');
  expect(state().favourites).toContain('sol');
  account.toggleFavourite('sol');
  expect(state().favourites).not.toContain('sol');
});

test('changes are saved and restored on the next launch', async () => {
  account.toggleFavourite('doge');
  await Promise.resolve();
  const saved = await storage.getItem('cryptoex/account/v2');
  expect(saved).toContain('doge');

  // A relaunch: fresh modules reading what the last session saved.
  jest.resetModules();
  await require('@react-native-async-storage/async-storage').setItem(
    'cryptoex/account/v2',
    saved,
  );
  const relaunched: Account = require('../src/services/account');
  expect(relaunched.getAccount().favourites).not.toContain('doge');
  await relaunched.hydrateAccount();
  expect(relaunched.getAccount().favourites).toContain('doge');
});

describe('funds', () => {
  function verifyKyc() {
    const { userStore } = require('../src/services/user');
    userStore.update((user: { kyc: object }) => ({
      ...user,
      kyc: { status: 'verified' },
    }));
  }

  function linkBank() {
    return account.addBankAccount({
      holderName: 'Rahul Sharma',
      accountNumber: '50100123456789',
      confirmAccountNumber: '50100123456789',
      ifsc: 'HDFC0001234',
    });
  }

  test('need KYC and a bank account', () => {
    expect(account.depositInr(1000, 'UPI')).toMatchObject({ ok: false });
    verifyKyc();
    expect(account.depositInr(1000, 'UPI')).toEqual({
      ok: false,
      error: 'Add a bank account first.',
    });
  });

  test('bank accounts validate and the first becomes primary', () => {
    expect(
      account.addBankAccount({
        holderName: 'Rahul',
        accountNumber: '123',
        confirmAccountNumber: '123',
        ifsc: 'HDFC0001234',
      }),
    ).toMatchObject({ ok: false });
    expect(
      account.addBankAccount({
        holderName: 'Rahul',
        accountNumber: '50100123456789',
        confirmAccountNumber: '50100123456788',
        ifsc: 'HDFC0001234',
      }),
    ).toEqual({ ok: false, error: 'Account numbers do not match.' });
    expect(linkBank()).toMatchObject({
      ok: true,
      value: { bankName: 'HDFC Bank', primary: true },
    });
    expect(linkBank()).toEqual({
      ok: false,
      error: 'This bank account is already linked.',
    });
  });

  test('INR deposit settles after a delay; withdrawal debits at once', () => {
    verifyKyc();
    linkBank();
    const before = state().inrBalance;

    expect(account.depositInr(50, 'UPI')).toMatchObject({ ok: false });
    expect(account.depositInr(2000, 'UPI')).toMatchObject({
      ok: true,
      value: { status: 'pending' },
    });
    expect(state().inrBalance).toBe(before);
    jest.advanceTimersByTime(6000);
    expect(state().inrBalance).toBe(before + 2000);
    expect(state().transactions[0].status).toBe('completed');

    const bankId = state().bankAccounts[0].id;
    expect(account.withdrawInr(1_000_000, bankId)).toEqual({
      ok: false,
      error: 'Insufficient INR balance.',
    });
    expect(account.withdrawInr(500, bankId).ok).toBe(true);
    expect(state().inrBalance).toBe(before + 1500);
  });

  test('crypto withdrawal checks address, minimum, balance and 2FA', () => {
    verifyKyc();
    const withdraw = (
      input: Partial<Parameters<Account['withdrawCrypto']>[0]>,
    ) =>
      account.withdrawCrypto({
        coinId: 'usdt',
        networkId: 'TRC20',
        address: 'T' + 'A'.repeat(33),
        amount: 11,
        ...input,
      });

    expect(withdraw({ address: '0x123' })).toMatchObject({ ok: false });
    expect(withdraw({ amount: 5 })).toMatchObject({ ok: false });
    expect(withdraw({ amount: 13 })).toEqual({
      ok: false,
      error: 'Insufficient USDT balance.',
    });

    const security = require('../src/services/security');
    const { generateSecret, totp } = require('../src/utils/totp');
    const secret = generateSecret();
    expect(security.enableTwoFactor(secret, totp(secret)).ok).toBe(true);
    expect(withdraw({ code: '000000' })).toEqual({
      ok: false,
      error: 'Enter a valid Google Authenticator code.',
    });
    expect(withdraw({ code: totp(secret) })).toMatchObject({
      ok: true,
      value: { fee: 1, status: 'pending' },
    });
    expect(state().holdings.usdt.quantity).toBeCloseTo(1.4);
  });

  test('whitelist blocks unknown addresses', () => {
    verifyKyc();
    const security = require('../src/services/security');
    security.setWhitelistEnabled(true);
    const address = 'T' + 'B'.repeat(33);
    const input = {
      coinId: 'usdt',
      networkId: 'TRC20',
      address,
      amount: 11,
    };
    expect(account.withdrawCrypto(input)).toMatchObject({ ok: false });
    expect(
      security.addWhitelistAddress({
        label: 'Ledger',
        coinId: 'usdt',
        networkId: 'TRC20',
        address,
      }).ok,
    ).toBe(true);
    expect(account.withdrawCrypto(input).ok).toBe(true);
  });

  test('USDT moves between spot and futures', () => {
    expect(account.transferUsdt('toFutures', 20)).toMatchObject({ ok: false });
    expect(account.transferUsdt('toFutures', 10).ok).toBe(true);
    expect(state().futures.balance).toBe(260);
    expect(state().holdings.usdt.quantity).toBeCloseTo(2.4);
    expect(account.transferUsdt('toSpot', 60).ok).toBe(true);
    expect(state().futures.balance).toBe(200);
  });

  test('coupons credit once', () => {
    expect(account.redeemCoupon('nope')).toMatchObject({ ok: false });
    expect(account.redeemCoupon('welcome50')).toEqual({ ok: true, value: 50 });
    expect(account.redeemCoupon('WELCOME50')).toMatchObject({ ok: false });
    expect(state().inrBalance).toBe(50_050);
  });
});

describe('futures', () => {
  test('opens at mark with fee, closes with P&L', () => {
    const mark = account.getMarkPrice('btc')!;
    const result = account.placeFuturesOrder({
      coinId: 'btc',
      side: 'long',
      type: 'market',
      leverage: 10,
      margin: 100,
    });
    expect(result.ok).toBe(true);
    const position = state().futures.positions[0];
    expect(position.entryPrice).toBe(mark);
    expect(position.quantity).toBeCloseTo(1000 / mark);
    expect(state().futures.balance).toBeCloseTo(250 - 1000 * 0.0005);

    expect(account.closePosition(position.id).ok).toBe(true);
    expect(state().futures.positions).toHaveLength(0);
    expect(state().futures.history[0].reason).toBe('manual');
  });

  test('validates leverage, margin and targets', () => {
    const mark = account.getMarkPrice('btc')!;
    const open = (
      input: Partial<Parameters<Account['placeFuturesOrder']>[0]>,
    ) =>
      account.placeFuturesOrder({
        coinId: 'btc',
        side: 'long',
        type: 'market',
        leverage: 10,
        margin: 100,
        ...input,
      });
    expect(open({ leverage: 80 })).toMatchObject({ ok: false });
    expect(open({ margin: 1 })).toMatchObject({ ok: false });
    expect(open({ margin: 300 })).toMatchObject({ ok: false });
    expect(open({ takeProfit: mark * 0.9 })).toMatchObject({ ok: false });
    expect(open({ stopLoss: mark * 0.5 })).toMatchObject({ ok: false });
    expect(open({ coinId: 'usdt' })).toMatchObject({ ok: false });
  });

  test('liquidates when the mark crosses the liquidation price', () => {
    account.placeFuturesOrder({
      coinId: 'btc',
      side: 'long',
      type: 'market',
      leverage: 50,
      margin: 100,
    });
    drift('down', 20);
    expect(state().futures.positions).toHaveLength(0);
    expect(state().futures.history[0]).toMatchObject({
      reason: 'liquidation',
      pnl: -100,
    });
  });
});

describe('earn, SIP and baskets', () => {
  test('stakes lock coins and flexible ones redeem with reward', () => {
    const { subscribeEarn, redeemStake } = account;
    expect(subscribeEarn('usdt-flex', 5)).toMatchObject({ ok: false });
    const stake = subscribeEarn('usdt-flex', 10);
    expect(stake.ok).toBe(true);
    expect(account.getAvailableQuantity(state(), 'usdt')).toBeCloseTo(2.4);

    const id = stake.ok ? stake.value.id : '';
    const reward = redeemStake(id, Date.now() + 365 * 86_400_000);
    expect(reward.ok && reward.value).toBeCloseTo(0.8);
    expect(state().holdings.usdt.quantity).toBeCloseTo(13.2);
  });

  test('locked stakes refuse early redemption', () => {
    const stake = account.subscribeEarn('eth-30', 0.1);
    const id = stake.ok ? stake.value.id : '';
    expect(account.redeemStake(id).ok).toBe(false);
  });

  test('SIP buys the first instalment now and the next when due', () => {
    expect(account.createSip('btc', 100, 'daily')).toMatchObject({
      ok: false,
    });
    const plan = account.createSip('btc', 1000, 'daily');
    expect(plan).toMatchObject({ ok: true, value: { instalments: 1 } });
    const spent = 50_000 - state().inrBalance;
    expect(spent).toBeCloseTo(1000, 0);

    account.runDueSips(Date.now() + 86_400_000 + 1);
    expect(state().sipPlans[0].instalments).toBe(2);
  });

  test('basket invests across every coin', () => {
    expect(account.investInBasket('blue-chip', 100)).toMatchObject({
      ok: false,
    });
    expect(account.investInBasket('blue-chip', 1000)).toEqual({
      ok: true,
      value: 2,
    });
    expect(state().holdings.btc.quantity).toBeGreaterThan(0.0142);
  });
});

describe('alerts', () => {
  test('reject already-met prices and trigger when crossed', () => {
    const alerts = require('../src/services/alerts');
    const price = btcPrice();
    expect(
      alerts.addAlert({
        coinId: 'btc',
        market: 'spot',
        direction: 'above',
        price: price * 0.9,
      }).ok,
    ).toBe(false);
    expect(
      alerts.addAlert({
        coinId: 'btc',
        market: 'spot',
        direction: 'above',
        price: price * 1.002,
      }).ok,
    ).toBe(true);

    drift('up', 3);
    expect(alerts.alertsStore.get().alerts[0].status).toBe('triggered');
    const { notificationsStore } = require('../src/services/notifications');
    expect(notificationsStore.get().items[0].kind).toBe('alert');
  });
});
