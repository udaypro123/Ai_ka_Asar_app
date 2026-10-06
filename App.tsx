import 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';
import AppNavigation from './src/navigation/AppNavigation';
import { GlobalApiLoader } from './src/components/common/GlobalApiLoader';
import { ToastProvider } from './src/components/common/Toast';
import { PageRefreshProvider } from './src/components/common/PageRefresh';
import { store } from './src/store/store';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <ToastProvider>
            <PageRefreshProvider>
              <StatusBar barStyle="dark-content" />
              <AppNavigation />
              <GlobalApiLoader />
            </PageRefreshProvider>
          </ToastProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
