import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '@/context/AuthContext';
import { ServerStatusProvider } from '@/context/ServerStatusContext';

export default function RootLayout() {
  return (
    <ServerStatusProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index"      options={{ headerShown: false }} />
          <Stack.Screen name="register"   options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)"     options={{ headerShown: false }} />
          <Stack.Screen name="class/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </AuthProvider>
    </ServerStatusProvider>
  );
}
