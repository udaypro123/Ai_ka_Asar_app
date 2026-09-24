import '../src/theme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '../src/store/store';
import { ToastProvider } from '../src/components/common/Toast';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="(user)" options={{ headerShown: false }} />
            <Stack.Screen name="(hr)" options={{ headerShown: false }} />
          </Stack>
        </>
      </ToastProvider>
    </Provider>
  );
}
