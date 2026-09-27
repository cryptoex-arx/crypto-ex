import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MobileNumberScreen } from '../screens/auth/mobileNumber';
import { OtpVerificationScreen } from '../screens/auth/otpVerification';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** Sign-in is mobile number then OTP — there is no password to create or reset. */
export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MobileNumber"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="MobileNumber" component={MobileNumberScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    </Stack.Navigator>
  );
}
