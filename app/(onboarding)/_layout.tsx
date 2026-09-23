import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="profession" />
      <Stack.Screen name="career-profile" />
      <Stack.Screen name="assessment" />
    </Stack>
  );
}
