import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useTheme } from './hooks/useTheme';
import { RootNavigator } from './navigation/RootNavigator';
import { AppStateProvider } from './store/AppStateProvider';

function App() {
  const { scheme } = useTheme();

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar
          barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <AppStateProvider>
          <RootNavigator />
        </AppStateProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default App;
