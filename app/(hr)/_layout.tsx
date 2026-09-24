import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../src/store/hooks';

export default function HRLayout() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const isHR = user?.roles?.includes('HR');

  if (!isHR) {
    router.replace('(user)' as any);
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0047ecc1',
          borderBottomColor: 'rgba(253, 253, 253, 0.88)',
          borderBottomWidth: 1,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'HR Dashboard' }} />
      <Stack.Screen name="candidates" options={{ title: 'Candidates' }} />
      <Stack.Screen name="messages" options={{ title: 'Messages' }} />
    </Stack>
  );
}