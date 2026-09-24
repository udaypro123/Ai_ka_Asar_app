import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../src/store/hooks';

export default function UserLayout() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const hasAccess = user?.roles?.includes('USER') || user?.roles?.includes('HR') || user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN');

  if (!hasAccess) {
    router.replace('(hr)' as any);
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
      <Stack.Screen name="index" options={{ title: 'My Dashboard' }} />
      <Stack.Screen name="community" options={{ title: 'Community' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
    </Stack>
  );
}