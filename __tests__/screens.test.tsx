/**
 * Smoke test: mounts the real app navigator and opens every route, so a
 * screen that throws while rendering fails here instead of on a device.
 */
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ReactTestRenderer from 'react-test-renderer';

import { AppNavigator } from '../src/navigation/AppNavigator';
import type { AppStackParamList } from '../src/navigation/types';
import { userStore } from '../src/services/user';
import { AppStateProvider } from '../src/store/AppStateProvider';

jest.useFakeTimers();

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

type Visit = {
  [Route in keyof AppStackParamList]: [Route, AppStackParamList[Route]];
}[keyof AppStackParamList];

const VISITS: Visit[] = [
  ['MainTabs', { screen: 'Home' }],
  ['MainTabs', { screen: 'Markets' }],
  ['MainTabs', { screen: 'Futures' }],
  ['MainTabs', { screen: 'Portfolio' }],
  ['MainTabs', { screen: 'Account' }],
  ['CoinDetail', { coinId: 'btc' }],
  ['OrderDetail', { orderId: 'seed-btc-buy' }],
  ['CoinDetail', { coinId: 'btc', side: 'sell' }],
  ['AssetDetail', { coinId: 'btc' }],
  ['AssetDetail', { coinId: 'inr' }],
  ['SelectAsset', { mode: 'withdraw' }],
  ['AddInr', undefined],
  ['WithdrawInr', undefined],
  ['DepositCrypto', { coinId: 'atom' }],
  ['WithdrawCrypto', { coinId: 'usdt' }],
  ['Transfer', undefined],
  ['Transactions', undefined],
  ['Notifications', undefined],
  ['PriceAlerts', undefined],
  ['AddPriceAlert', { coinId: 'eth', market: 'futures' }],
  ['CoinOrders', undefined],
  ['Sip', undefined],
  ['CreateSip', undefined],
  ['Earn', undefined],
  ['Baskets', undefined],
  ['BasketDetail', { basketId: 'layer-1-leaders' }],
  ['More', undefined],
  ['Profile', undefined],
  ['AccountSettings', undefined],
  ['BankAccounts', undefined],
  ['AddBankAccount', undefined],
  ['Nominee', undefined],
  ['AccountManagement', undefined],
  ['Kyc', undefined],
  ['KycFlow', undefined],
  ['Appearance', undefined],
  ['BaseCurrency', undefined],
  ['TaxReports', undefined],
  ['Security', undefined],
  ['SetPin', undefined],
  ['TwoFactor', undefined],
  ['AntiPhishing', undefined],
  ['Whitelist', undefined],
  ['AccountActivity', undefined],
  ['FeeStructure', undefined],
  ['HelpSupport', undefined],
  ['SupportChat', undefined],
  ['ReferAndEarn', undefined],
  ['CouponCode', undefined],
  ['AppFeedback', undefined],
  ['About', undefined],
  ['TransparencyCenter', undefined],
];

function renderApp() {
  const ref = createNavigationContainerRef<AppStackParamList>();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>
        <AppStateProvider>
          <NavigationContainer ref={ref}>
            <AppNavigator />
          </NavigationContainer>
        </AppStateProvider>
      </SafeAreaProvider>,
    );
  });
  return { ref, renderer: renderer! };
}

function visitAll(ref: ReturnType<typeof renderApp>['ref']) {
  for (const [route, params] of VISITS) {
    ReactTestRenderer.act(() => {
      (ref.navigate as (name: string, params?: object) => void)(route, params);
    });
    expect(ref.getCurrentRoute()?.name).toBe(
      route === 'MainTabs' ? params?.screen : route,
    );
  }
}

test('every screen renders before KYC', () => {
  const { ref, renderer } = renderApp();
  visitAll(ref);
  ReactTestRenderer.act(() => renderer.unmount());
});

test('every screen renders once KYC is verified', () => {
  userStore.update(user => ({ ...user, kyc: { status: 'verified' } }));
  const { ref, renderer } = renderApp();
  visitAll(ref);
  ReactTestRenderer.act(() => renderer.unmount());
});
