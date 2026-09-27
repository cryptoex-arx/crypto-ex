import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';

import { useTheme } from '../hooks/useTheme';
import { SplashScreen } from '../screens/splash';
import { useAppState } from '../store/useAppState';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import { toNavigationTheme } from './navigationTheme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Holds the splash screen until the app is ready, then chooses between the
 * authenticated and unauthenticated stacks. The session flag is a placeholder
 * in the app store until authentication is built.
 */
export function RootNavigator() {
  const theme = useTheme();
  const { state } = useAppState();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const navigationTheme = useMemo(() => toNavigationTheme(theme), [theme]);
  const onSplashFinish = useCallback(() => setIsBootstrapping(false), []);

  if (isBootstrapping) {
    return <SplashScreen onFinish={onSplashFinish} />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {state.isSignedIn ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
