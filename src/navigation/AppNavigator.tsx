import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AboutScreen } from '../screens/main/about';
import { AccountActivityScreen } from '../screens/main/accountActivity';
import { AccountManagementScreen } from '../screens/main/accountManagement';
import { AccountSettingsScreen } from '../screens/main/accountSettings';
import { AddBankAccountScreen } from '../screens/main/addBankAccount';
import { AddInrScreen } from '../screens/main/addInr';
import { AddPriceAlertScreen } from '../screens/main/addPriceAlert';
import { AntiPhishingScreen } from '../screens/main/antiPhishing';
import { AppearanceScreen } from '../screens/main/appearance';
import { AppFeedbackScreen } from '../screens/main/appFeedback';
import { AssetDetailScreen } from '../screens/main/assetDetail';
import { BankAccountsScreen } from '../screens/main/bankAccounts';
import { BaseCurrencyScreen } from '../screens/main/baseCurrency';
import { BasketDetailScreen } from '../screens/main/basketDetail';
import { BasketsScreen } from '../screens/main/baskets';
import { CoinDetailScreen } from '../screens/main/coinDetail';
import { CoinOrdersScreen } from '../screens/main/coinOrders';
import { CouponCodeScreen } from '../screens/main/couponCode';
import { CreateSipScreen } from '../screens/main/createSip';
import { DepositCryptoScreen } from '../screens/main/depositCrypto';
import { EarnScreen } from '../screens/main/earn';
import { FeeStructureScreen } from '../screens/main/feeStructure';
import { HelpSupportScreen } from '../screens/main/helpSupport';
import { KycScreen } from '../screens/main/kyc';
import { KycFlowScreen } from '../screens/main/kycFlow';
import { MoreScreen } from '../screens/main/more';
import { NomineeScreen } from '../screens/main/nominee';
import { NotificationsScreen } from '../screens/main/notifications';
import { OrderDetailScreen } from '../screens/main/orderDetail';
import { PriceAlertsScreen } from '../screens/main/priceAlerts';
import { ProfileScreen } from '../screens/main/profile';
import { ReferAndEarnScreen } from '../screens/main/referAndEarn';
import { SecurityScreen } from '../screens/main/security';
import { SelectAssetScreen } from '../screens/main/selectAsset';
import { SetPinScreen } from '../screens/main/setPin';
import { SipScreen } from '../screens/main/sip';
import { SupportChatScreen } from '../screens/main/supportChat';
import { TaxReportsScreen } from '../screens/main/taxReports';
import { TransactionsScreen } from '../screens/main/transactions';
import { TransferScreen } from '../screens/main/transfer';
import { TransparencyCenterScreen } from '../screens/main/transparencyCenter';
import { TwoFactorScreen } from '../screens/main/twoFactor';
import { WhitelistScreen } from '../screens/main/whitelist';
import { WithdrawCryptoScreen } from '../screens/main/withdrawCrypto';
import { WithdrawInrScreen } from '../screens/main/withdrawInr';
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

      {/* Trading */}
      <Stack.Screen name="CoinDetail" component={CoinDetailScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="CoinOrders" component={CoinOrdersScreen} />
      <Stack.Screen name="PriceAlerts" component={PriceAlertsScreen} />
      <Stack.Screen name="AddPriceAlert" component={AddPriceAlertScreen} />
      <Stack.Screen name="Sip" component={SipScreen} />
      <Stack.Screen name="CreateSip" component={CreateSipScreen} />
      <Stack.Screen name="Earn" component={EarnScreen} />
      <Stack.Screen name="Baskets" component={BasketsScreen} />
      <Stack.Screen name="BasketDetail" component={BasketDetailScreen} />
      <Stack.Screen name="More" component={MoreScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />

      {/* Funds */}
      <Stack.Screen name="AssetDetail" component={AssetDetailScreen} />
      <Stack.Screen name="SelectAsset" component={SelectAssetScreen} />
      <Stack.Screen name="AddInr" component={AddInrScreen} />
      <Stack.Screen name="WithdrawInr" component={WithdrawInrScreen} />
      <Stack.Screen name="DepositCrypto" component={DepositCryptoScreen} />
      <Stack.Screen name="WithdrawCrypto" component={WithdrawCryptoScreen} />
      <Stack.Screen name="Transfer" component={TransferScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />

      {/* Account */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="BankAccounts" component={BankAccountsScreen} />
      <Stack.Screen name="AddBankAccount" component={AddBankAccountScreen} />
      <Stack.Screen name="Nominee" component={NomineeScreen} />
      <Stack.Screen
        name="AccountManagement"
        component={AccountManagementScreen}
      />
      <Stack.Screen name="Kyc" component={KycScreen} />
      <Stack.Screen name="KycFlow" component={KycFlowScreen} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} />
      <Stack.Screen name="BaseCurrency" component={BaseCurrencyScreen} />
      <Stack.Screen name="TaxReports" component={TaxReportsScreen} />

      {/* Security */}
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="SetPin" component={SetPinScreen} />
      <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
      <Stack.Screen name="AntiPhishing" component={AntiPhishingScreen} />
      <Stack.Screen name="Whitelist" component={WhitelistScreen} />
      <Stack.Screen name="AccountActivity" component={AccountActivityScreen} />

      {/* Help, rewards and about */}
      <Stack.Screen name="FeeStructure" component={FeeStructureScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="SupportChat" component={SupportChatScreen} />
      <Stack.Screen name="ReferAndEarn" component={ReferAndEarnScreen} />
      <Stack.Screen name="CouponCode" component={CouponCodeScreen} />
      <Stack.Screen name="AppFeedback" component={AppFeedbackScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen
        name="TransparencyCenter"
        component={TransparencyCenterScreen}
      />
    </Stack.Navigator>
  );
}
