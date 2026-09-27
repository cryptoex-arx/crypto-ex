import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  MobileNumber: undefined;
  OtpVerification: { mobileNumber: string };
};

/** The five destinations in the bottom tab bar. */
export type MainTabParamList = {
  Home: undefined;
  Markets: undefined;
  Futures: undefined;
  Portfolio: undefined;
  Account: undefined;
};

/** Tabs plus every detail screen pushed on top of them. */
export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
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
