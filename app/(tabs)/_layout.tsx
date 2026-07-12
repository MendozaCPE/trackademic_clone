import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="classes" />
      <Stack.Screen name="performance" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
