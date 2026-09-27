import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AboutScreen } from '../screens/main/about';
import { AccountSettingsScreen } from '../screens/main/accountSettings';
import { AppearanceScreen } from '../screens/main/appearance';
import { AppFeedbackScreen } from '../screens/main/appFeedback';
import { BaseCurrencyScreen } from '../screens/main/baseCurrency';
import { CoinOrdersScreen } from '../screens/main/coinOrders';
import { CouponCodeScreen } from '../screens/main/couponCode';
import { FeeStructureScreen } from '../screens/main/feeStructure';
import { HelpSupportScreen } from '../screens/main/helpSupport';
import { KycScreen } from '../screens/main/kyc';
import { PriceAlertsScreen } from '../screens/main/priceAlerts';
import { ProfileScreen } from '../screens/main/profile';
import { ReferAndEarnScreen } from '../screens/main/referAndEarn';
import { SecurityScreen } from '../screens/main/security';
import { TaxReportsScreen } from '../screens/main/taxReports';
import { MainTabNavigator } from './MainTabNavigator';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/** Every screen uses its own ScreenHeader, so the native header stays off. */
export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Kyc" component={KycScreen} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} />
      <Stack.Screen name="BaseCurrency" component={BaseCurrencyScreen} />
      <Stack.Screen name="PriceAlerts" component={PriceAlertsScreen} />
      <Stack.Screen name="CoinOrders" component={CoinOrdersScreen} />
      <Stack.Screen name="TaxReports" component={TaxReportsScreen} />
      <Stack.Screen name="FeeStructure" component={FeeStructureScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="ReferAndEarn" component={ReferAndEarnScreen} />
      <Stack.Screen name="CouponCode" component={CouponCodeScreen} />
      <Stack.Screen name="AppFeedback" component={AppFeedbackScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
