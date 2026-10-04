import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

import { ToastHost } from '../components/common/Toast';
import { useTheme } from '../hooks/useTheme';
import { PinLockScreen } from '../screens/pinLock';
import { SplashScreen } from '../screens/splash';
import { hydrateStores } from '../services/bootstrap';
import { removePin, securityStore } from '../services/security';
import { endSession, getSession, startSession } from '../services/session';
import { userStore } from '../services/user';
import { useAppState } from '../store/useAppState';
import { logger } from '../utils/logger';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import { toNavigationTheme } from './navigationTheme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Coming back after this long in the background asks for the PIN again. */
const RELOCK_AFTER_MS = 60_000;

/**
 * Holds the splash screen while saved data is restored, then chooses between
 * the signed-in and signed-out stacks. The app PIN lock and in-app toasts sit
 * on top of whichever stack is showing.
 */
export function RootNavigator() {
  const theme = useTheme();
  const { state, dispatch } = useAppState();
  const [splashDone, setSplashDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [locked, setLocked] = useState(false);
  const backgroundedAt = useRef<number | undefined>(undefined);
  const navigationTheme = useMemo(() => toNavigationTheme(theme), [theme]);
  const onSplashFinish = useCallback(() => setSplashDone(true), []);

  // Restore saved data while the splash animates, including the keychain
  // session, and ask for the PIN (or biometrics) if one is set.
  useEffect(() => {
    let active = true;
    hydrateStores().finally(() => {
      if (!active) {
        return;
      }
      if (getSession()) {
        dispatch({ type: 'session/signIn' });
        setLocked(securityStore.get().pinHash !== undefined);
      }
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, [dispatch]);

  // Keep the keychain session in step with every sign-in and sign-out.
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    let sync: Promise<void> | undefined;
    if (!state.isSignedIn) {
      sync = endSession();
    } else if (!getSession()) {
      sync = startSession(userStore.get().profile.mobileNumber);
    }
    sync?.catch(error => logger.error('Failed to save the session', error));
  }, [hydrated, state.isSignedIn]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => {
      if (next === 'background') {
        backgroundedAt.current = Date.now();
        return;
      }
      if (next === 'active' && backgroundedAt.current !== undefined) {
        const away = Date.now() - backgroundedAt.current;
        backgroundedAt.current = undefined;
        if (away >= RELOCK_AFTER_MS && securityStore.get().pinHash) {
          setLocked(true);
        }
      }
    });
    return () => subscription.remove();
  }, []);

  const onForgetPin = useCallback(() => {
    removePin();
    setLocked(false);
    dispatch({ type: 'session/signOut' });
  }, [dispatch]);

  if (!splashDone || !hydrated) {
    return <SplashScreen onFinish={onSplashFinish} />;
  }

  return (
    <View style={styles.root}>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {state.isSignedIn ? (
            <Stack.Screen name="App" component={AppNavigator} />
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {state.isSignedIn && locked ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <PinLockScreen
            onUnlock={() => setLocked(false)}
            onSignOut={onForgetPin}
          />
        </View>
      ) : null}

      <ToastHost />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
