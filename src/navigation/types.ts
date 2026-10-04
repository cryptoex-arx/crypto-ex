import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { OrderSide, PositionSide } from '../services/account';
import type { AlertMarket } from '../services/alerts';

export type AuthStackParamList = {
  MobileNumber: undefined;
  OtpVerification: { mobileNumber: string };
};

/** The five destinations in the bottom tab bar. */
export type MainTabParamList = {
  Home: undefined;
  Markets: undefined;
  /** Expert picks and positions open the ticket preset. */
  Futures:
    | { coinId?: string; side?: PositionSide; leverage?: number }
    | undefined;
  Portfolio: undefined;
  Account: undefined;
};

/** Tabs plus every detail screen pushed on top of them. */
export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  /** `side` opens the ticket on that side with the chart folded away. */
  CoinDetail: { coinId: string; side?: OrderSide };
  OrderDetail: { orderId: string };
  /** Use `inr` for the rupee wallet. */
  AssetDetail: { coinId: string };
  SelectAsset: { mode: 'deposit' | 'withdraw' };
  AddInr: undefined;
  WithdrawInr: undefined;
  DepositCrypto: { coinId: string };
  WithdrawCrypto: { coinId: string };
  Transfer: undefined;
  Transactions: undefined;
  Notifications: undefined;
  AddPriceAlert: { coinId?: string; market?: AlertMarket } | undefined;
  TwoFactor: undefined;
  SetPin: undefined;
  AntiPhishing: undefined;
  Whitelist: undefined;
  AccountActivity: undefined;
  BankAccounts: undefined;
  AddBankAccount: undefined;
  Nominee: undefined;
  AccountManagement: undefined;
  KycFlow: undefined;
  SupportChat: undefined;
  TransparencyCenter: undefined;
  Sip: undefined;
  CreateSip: { coinId?: string } | undefined;
  Earn: undefined;
  Baskets: undefined;
  BasketDetail: { basketId: string };
  More: undefined;
  Profile: undefined;
  AccountSettings: undefined;
  Security: undefined;
  Kyc: undefined;
  Appearance: undefined;
  BaseCurrency: undefined;
  PriceAlerts: undefined;
  CoinOrders: undefined;
  TaxReports: undefined;
  FeeStructure: undefined;
  HelpSupport: undefined;
  ReferAndEarn: undefined;
  CouponCode: undefined;
  AppFeedback: undefined;
  About: undefined;
};

/** Detail routes that take no params, so a plain `navigate(route)` works. */
export type ParamlessRoute = {
  [Route in keyof AppStackParamList]: undefined extends AppStackParamList[Route]
    ? Route
    : never;
}[Exclude<keyof AppStackParamList, 'MainTabs'>];

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

export type AuthStackScreenProps<RouteName extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, RouteName>;

export type AppStackScreenProps<RouteName extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, RouteName>;

/** Tab screens also need to reach the detail screens on the parent stack. */
export type MainTabScreenProps<RouteName extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, RouteName>,
    AppStackScreenProps<keyof AppStackParamList>
  >;

/** Makes `useNavigation()` and `navigate()` aware of the root routes. */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
